/**
 * Health Check System for MCP Servers
 * Provides comprehensive diagnostics and status monitoring
 */

import * as fs from 'fs/promises';
import { EnvironmentDetector } from '../runtime/environment-detector.js';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    stdio: CheckResult;
    filesystem: CheckResult;
    dependencies: CheckResult;
    performance: CheckResult;
  };
  issues: HealthIssue[];
  timestamp: string;
  uptime: number;
  version: string;
  environment: ReturnType<typeof EnvironmentDetector.detect>;
}

export interface CheckResult {
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
  error?: string;
  warning?: string;
  fix?: string;
}

export interface HealthIssue {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  fix: string;
  component: string;
}

export class HealthChecker {
  private version: string;
  private serverName: string;

  constructor(serverName: string, version: string) {
    this.serverName = serverName;
    this.version = version;
  }

  /**
   * Run complete health check
   */
  async check(_verbose = false): Promise<HealthCheckResult> {
    const checks = {
      stdio: await this.checkStdio(),
      filesystem: await this.checkFilesystem(),
      dependencies: await this.checkDependencies(),
      performance: await this.checkPerformance(),
    };

    const issues = this.identifyIssues(checks);

    const status = this.determineStatus(issues);

    return {
      status,
      checks,
      issues,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: this.version,
      environment: EnvironmentDetector.detect(),
    };
  }

  /**
   * Check stdio communication
   */
  private async checkStdio(): Promise<CheckResult> {
    try {
      // Test if stdin is readable
      const stdinReadable = process.stdin.readable && !process.stdin.destroyed;

      // Test if stdout is writable
      const stdoutWritable = process.stdout.writable && !process.stdout.destroyed;

      // Test if stderr is writable (for logging)
      const stderrWritable = process.stderr.writable && !process.stderr.destroyed;

      const allHealthy = stdinReadable && stdoutWritable && stderrWritable;

      return {
        passed: allHealthy,
        message: allHealthy ? 'stdio communication healthy' : 'stdio communication issues detected',
        details: {
          stdin_readable: stdinReadable,
          stdout_writable: stdoutWritable,
          stderr_writable: stderrWritable,
          stdin_is_tty: process.stdin.isTTY,
          stdout_is_tty: process.stdout.isTTY,
        },
        warning: !allHealthy ? 'MCP server may not communicate properly with IDE' : undefined,
        fix: !allHealthy ? 'Restart your IDE or MCP server' : undefined,
      };
    } catch (error) {
      return {
        passed: false,
        message: 'stdio check failed',
        error: error instanceof Error ? error.message : String(error),
        fix: 'Restart MCP server',
      };
    }
  }

  /**
   * Check filesystem access
   */
  private async checkFilesystem(): Promise<CheckResult> {
    try {
      const env = EnvironmentDetector.detect();

      // Test if we can read files
      const canRead = await this.testFileAccess(__filename, fs.constants.R_OK);

      // Test if we can resolve paths
      const workingDir = process.cwd();
      const homeDir = env.homeDir;

      // Test if project root is accessible
      let projectRootAccessible = true;
      if (env.projectRoot) {
        try {
          await fs.access(env.projectRoot);
        } catch {
          projectRootAccessible = false;
        }
      }

      const allHealthy = canRead && projectRootAccessible;

      return {
        passed: allHealthy,
        message: allHealthy ? 'filesystem access healthy' : 'filesystem access issues',
        details: {
          can_read_files: canRead,
          working_dir: workingDir,
          home_dir: homeDir,
          project_root: env.projectRoot,
          project_root_accessible: projectRootAccessible,
          platform: env.platform,
          path_separator: env.pathSeparator,
        },
        warning: !allHealthy ? 'May not be able to access some files' : undefined,
        fix: !allHealthy ? 'Check file permissions and working directory' : undefined,
      };
    } catch (error) {
      return {
        passed: false,
        message: 'filesystem check failed',
        error: error instanceof Error ? error.message : String(error),
        fix: 'Verify file system permissions',
      };
    }
  }

  /**
   * Check critical dependencies
   */
  private async checkDependencies(): Promise<CheckResult> {
    try {
      const deps: Record<string, boolean> = {};

      // Check critical dependencies
      const criticalDeps = ['@modelcontextprotocol/sdk', '@j0kz/shared'];

      for (const dep of criticalDeps) {
        deps[dep] = await this.checkModule(dep);
      }

      const allPresent = Object.values(deps).every(v => v);

      return {
        passed: allPresent,
        message: allPresent ? 'all dependencies present' : 'missing dependencies',
        details: deps,
        warning: !allPresent ? 'Some features may not work' : undefined,
        fix: !allPresent ? 'Run: npm install or npm cache clean --force' : undefined,
      };
    } catch (error) {
      return {
        passed: false,
        message: 'dependency check failed',
        error: error instanceof Error ? error.message : String(error),
        fix: 'Run: npm install',
      };
    }
  }

  /**
   * Check performance metrics
   */
  private async checkPerformance(): Promise<CheckResult> {
    try {
      const memoryUsage = process.memoryUsage();
      const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

      // Performance thresholds
      const memoryHealthy = memoryMB < 500; // < 500MB
      const uptimeHealthy = process.uptime() < 3600 * 24; // < 24 hours

      const healthy = memoryHealthy && uptimeHealthy;

      return {
        passed: healthy,
        message: healthy ? 'performance healthy' : 'performance degraded',
        details: {
          memory_usage_mb: memoryMB,
          memory_rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
          uptime_seconds: Math.round(process.uptime()),
          node_version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        warning: !memoryHealthy ? 'High memory usage detected' : undefined,
        fix: !healthy ? 'Consider restarting MCP server' : undefined,
      };
    } catch (error) {
      return {
        passed: false,
        message: 'performance check failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test file access
   */
  private async testFileAccess(filePath: string, mode: number): Promise<boolean> {
    try {
      await fs.access(filePath, mode);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if module is available
   */
  private async checkModule(moduleName: string): Promise<boolean> {
    try {
      require.resolve(moduleName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Identify issues from check results
   */
  private identifyIssues(checks: HealthCheckResult['checks']): HealthIssue[] {
    const issues: HealthIssue[] = [];

    // Check stdio issues
    if (!checks.stdio.passed) {
      issues.push({
        severity: 'critical',
        message: 'stdio communication is not working properly',
        fix: checks.stdio.fix || 'Restart your IDE',
        component: 'stdio',
      });
    }

    // Check filesystem issues
    if (!checks.filesystem.passed) {
      issues.push({
        severity: 'warning',
        message: 'Filesystem access issues detected',
        fix: checks.filesystem.fix || 'Check file permissions',
        component: 'filesystem',
      });
    }

    // Check dependency issues
    if (!checks.dependencies.passed) {
      issues.push({
        severity: 'critical',
        message: 'Missing required dependencies',
        fix: checks.dependencies.fix || 'Run: npm install',
        component: 'dependencies',
      });
    }

    // Check performance issues
    if (!checks.performance.passed) {
      issues.push({
        severity: 'info',
        message: 'Performance degradation detected',
        fix: checks.performance.fix || 'Restart MCP server',
        component: 'performance',
      });
    }

    return issues;
  }

  /**
   * Determine overall health status
   */
  private determineStatus(issues: HealthIssue[]): 'healthy' | 'degraded' | 'unhealthy' {
    const hasCritical = issues.some(i => i.severity === 'critical');
    const hasWarning = issues.some(i => i.severity === 'warning');

    if (hasCritical) return 'unhealthy';
    if (hasWarning) return 'degraded';
    return 'healthy';
  }

  /**
   * Format health check result as human-readable string
   */
  static format(result: HealthCheckResult): string {
    const lines: string[] = [];

    // Status header
    const statusEmoji =
      result.status === 'healthy' ? '✅' : result.status === 'degraded' ? '⚠️' : '❌';
    lines.push(`\n${statusEmoji} Health Status: ${result.status.toUpperCase()}`);
    lines.push(`   Server: ${result.version}`);
    lines.push(`   IDE: ${result.environment.ide}`);
    lines.push(`   Uptime: ${Math.round(result.uptime)}s`);
    lines.push('');

    // Check results
    lines.push('📋 Checks:');
    for (const [name, check] of Object.entries(result.checks)) {
      const icon = check.passed ? '✓' : '✗';
      lines.push(`   ${icon} ${name}: ${check.message}`);
    }

    // Issues
    if (result.issues.length > 0) {
      lines.push('');
      lines.push('⚠️  Issues:');
      result.issues.forEach((issue, idx) => {
        lines.push(`   ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
        lines.push(`      Fix: ${issue.fix}`);
      });
    }

    return lines.join('\n');
  }
}
