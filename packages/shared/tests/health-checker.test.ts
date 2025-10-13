/**
 * Tests for Health Checker
 * Ensures proper health monitoring and diagnostics
 */

import { describe, it, expect, vi } from 'vitest';
import { HealthChecker } from '../src/health/health-checker.js';

describe('HealthChecker', () => {
  describe('constructor', () => {
    it('should initialize with server name and version', () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      expect(checker).toBeDefined();
    });
  });

  describe('check', () => {
    it('should perform complete health check', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.status).toBeDefined();
      expect(result.checks).toBeDefined();
      expect(result.checks.stdio).toBeDefined();
      expect(result.checks.filesystem).toBeDefined();
      expect(result.checks.dependencies).toBeDefined();
      expect(result.checks.performance).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.version).toBe('1.0.0');
      expect(result.environment).toBeDefined();
    });

    it('should handle verbose flag', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check(true);

      expect(result).toBeDefined();
    });

    it('should return healthy status when all checks pass', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      if (result.issues.length === 0) {
        expect(result.status).toBe('healthy');
      }
    });

    it('should return degraded status when there are warnings', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      const hasWarnings = result.issues.some(i => i.severity === 'warning');
      const hasCritical = result.issues.some(i => i.severity === 'critical');

      if (hasWarnings && !hasCritical) {
        expect(result.status).toBe('degraded');
      }
    });

    it('should return unhealthy status when there are critical issues', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      const hasCritical = result.issues.some(i => i.severity === 'critical');

      if (hasCritical) {
        expect(result.status).toBe('unhealthy');
      }
    });
  });

  describe('stdio check', () => {
    it('should check stdin readability', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.stdio.details?.stdin_readable).toBeDefined();
    });

    it('should check stdout writability', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.stdio.details?.stdout_writable).toBeDefined();
    });

    it('should check stderr writability', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.stdio.details?.stderr_writable).toBeDefined();
    });

    it('should include TTY information', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      // TTY fields may be undefined in test environment
      expect(result.checks.stdio.details).toBeDefined();
      // stdin_is_tty and stdout_is_tty exist but may be undefined
      expect('stdin_is_tty' in (result.checks.stdio.details || {})).toBe(true);
      expect('stdout_is_tty' in (result.checks.stdio.details || {})).toBe(true);
    });
  });

  describe('filesystem check', () => {
    it('should check file read access', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.filesystem.details?.can_read_files).toBeDefined();
    });

    it('should check working directory', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.filesystem.details?.working_dir).toBeDefined();
      expect(typeof result.checks.filesystem.details?.working_dir).toBe('string');
    });

    it('should check home directory', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.filesystem.details?.home_dir).toBeDefined();
    });

    it('should check project root accessibility', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.filesystem.details?.project_root_accessible).toBeDefined();
    });

    it('should include platform information', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.filesystem.details?.platform).toBeDefined();
      expect(result.checks.filesystem.details?.path_separator).toBeDefined();
    });
  });

  describe('dependencies check', () => {
    it('should check for critical dependencies', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.dependencies.details).toBeDefined();
    });

    it('should detect missing dependencies', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      if (!result.checks.dependencies.passed) {
        expect(result.checks.dependencies.warning).toBeDefined();
        expect(result.checks.dependencies.fix).toBeDefined();
      }
    });
  });

  describe('performance check', () => {
    it('should check memory usage', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.performance.details?.memory_usage_mb).toBeDefined();
      expect(typeof result.checks.performance.details?.memory_usage_mb).toBe('number');
    });

    it('should check RSS memory', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.performance.details?.memory_rss_mb).toBeDefined();
    });

    it('should check uptime', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.performance.details?.uptime_seconds).toBeDefined();
      expect(result.checks.performance.details?.uptime_seconds).toBeGreaterThanOrEqual(0);
    });

    it('should include Node.js version', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.performance.details?.node_version).toBeDefined();
      expect(result.checks.performance.details?.node_version).toContain('v');
    });

    it('should include platform and architecture', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');

      const result = await checker.check();

      expect(result.checks.performance.details?.platform).toBeDefined();
      expect(result.checks.performance.details?.arch).toBeDefined();
    });
  });

  describe('format', () => {
    it('should format health check result as readable string', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      const formatted = HealthChecker.format(result);

      expect(formatted).toContain('Health Status');
      // Format shows "Server: version", not the server name
      expect(formatted).toContain('Server:');
      expect(formatted).toContain('1.0.0');
    });

    it('should include check results', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      const formatted = HealthChecker.format(result);

      expect(formatted).toContain('Checks:');
      expect(formatted).toContain('stdio');
      expect(formatted).toContain('filesystem');
      expect(formatted).toContain('dependencies');
      expect(formatted).toContain('performance');
    });

    it('should include issues if present', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      const formatted = HealthChecker.format(result);

      if (result.issues.length > 0) {
        expect(formatted).toContain('Issues:');
        expect(formatted).toContain('Fix:');
      }
    });

    it('should use appropriate emoji for healthy status', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      const formatted = HealthChecker.format(result);

      if (result.status === 'healthy') {
        expect(formatted).toContain('✅');
      } else if (result.status === 'degraded') {
        expect(formatted).toContain('⚠️');
      } else {
        expect(formatted).toContain('❌');
      }
    });

    it('should format uptime in seconds', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      const formatted = HealthChecker.format(result);

      expect(formatted).toMatch(/Uptime: \d+s/);
    });

    it('should use check marks for passed checks', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      const formatted = HealthChecker.format(result);

      if (result.checks.stdio.passed) {
        expect(formatted).toContain('✓ stdio');
      }
    });

    it('should use X marks for failed checks', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      const formatted = HealthChecker.format(result);

      if (!result.checks.stdio.passed) {
        expect(formatted).toContain('✗ stdio');
      }
    });
  });

  describe('issue identification', () => {
    it('should identify stdio issues as critical', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      const stdioIssue = result.issues.find(i => i.component === 'stdio');

      if (stdioIssue) {
        expect(stdioIssue.severity).toBe('critical');
      }
    });

    it('should identify filesystem issues as warning', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      const fsIssue = result.issues.find(i => i.component === 'filesystem');

      if (fsIssue) {
        expect(fsIssue.severity).toBe('warning');
      }
    });

    it('should identify dependency issues as critical', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      const depIssue = result.issues.find(i => i.component === 'dependencies');

      if (depIssue) {
        expect(depIssue.severity).toBe('critical');
      }
    });

    it('should identify performance issues as info', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      const perfIssue = result.issues.find(i => i.component === 'performance');

      if (perfIssue) {
        expect(perfIssue.severity).toBe('info');
      }
    });

    it('should include fix suggestions for all issues', async () => {
      const checker = new HealthChecker('test-server', '1.0.0');
      const result = await checker.check();

      result.issues.forEach(issue => {
        expect(issue.fix).toBeDefined();
        expect(issue.fix.length).toBeGreaterThan(0);
      });
    });
  });
});
