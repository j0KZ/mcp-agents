/**
 * Environment Detection System
 * Automatically detects IDE, locale, transport, and runtime environment
 * Works with any MCP-compatible editor without configuration
 */

import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';

export interface RuntimeEnvironment {
  ide: string;
  ideVersion: string | null;
  transport: 'stdio' | 'sse' | 'websocket' | 'unknown';
  locale: string;
  platform: NodeJS.Platform;
  arch: string;
  nodeVersion: string;
  workingDir: string;
  homeDir: string;
  projectRoot: string | null;
  caseSensitiveFS: boolean;
  pathSeparator: string;
}

export class EnvironmentDetector {
  /**
   * Detect complete runtime environment
   */
  static detect(): RuntimeEnvironment {
    return {
      ide: this.detectIDE(),
      ideVersion: this.detectIDEVersion(),
      transport: this.detectTransport(),
      locale: this.detectLocale(),
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      workingDir: process.cwd(),
      homeDir: os.homedir(),
      projectRoot: this.detectProjectRoot(),
      caseSensitiveFS: this.isFilesystemCaseSensitive(),
      pathSeparator: path.sep,
    };
  }

  /**
   * Detect which IDE is running this MCP server
   */
  private static detectIDE(): string {
    // Check environment variables (most reliable)
    if (process.env.CLAUDE_CODE_VERSION) return 'claude-code';
    if (process.env.CURSOR_VERSION) return 'cursor';
    if (process.env.WINDSURF_VERSION) return 'windsurf';
    if (process.env.QODER_VERSION) return 'qoder';
    if (process.env.ROO_CODE_VERSION) return 'roo-code';
    if (process.env.VSCODE_PID) return 'vscode';
    if (process.env.MCP_IDE) return process.env.MCP_IDE; // Explicit override

    // Check parent process name (less reliable but works)
    try {
      const parentProcess = this.getParentProcessName();
      if (parentProcess.includes('cursor')) return 'cursor';
      if (parentProcess.includes('code')) return 'vscode';
      if (parentProcess.includes('qoder')) return 'qoder';
      if (parentProcess.includes('windsurf')) return 'windsurf';
    } catch {
      // Parent process detection failed, continue
    }

    return 'unknown';
  }

  /**
   * Detect IDE version if available
   */
  private static detectIDEVersion(): string | null {
    return (
      process.env.CLAUDE_CODE_VERSION ||
      process.env.CURSOR_VERSION ||
      process.env.WINDSURF_VERSION ||
      process.env.QODER_VERSION ||
      null
    );
  }

  /**
   * Detect transport mechanism from actual I/O
   */
  private static detectTransport(): 'stdio' | 'sse' | 'websocket' | 'unknown' {
    // Check explicit environment variable
    const explicitTransport = process.env.MCP_TRANSPORT;
    if (
      explicitTransport === 'stdio' ||
      explicitTransport === 'sse' ||
      explicitTransport === 'websocket'
    ) {
      return explicitTransport;
    }

    // Auto-detect from I/O streams
    if (process.stdin && process.stdout) {
      // stdin/stdout are pipes (not TTY) = stdio transport
      if (process.stdin.isTTY === false && process.stdout.isTTY === false) {
        return 'stdio';
      }
    }

    // Check if running as HTTP server (SSE transport)
    if (process.env.PORT || process.env.HTTP_SERVER) {
      return 'sse';
    }

    // Default assumption for MCP
    return 'stdio';
  }

  /**
   * Detect user's locale/language preference
   */
  private static detectLocale(): string {
    // Priority order:
    // 1. Explicit MCP locale override
    if (process.env.MCP_LOCALE) {
      return process.env.MCP_LOCALE;
    }

    // 2. System LANG environment variable
    if (process.env.LANG) {
      // Format: en_US.UTF-8 → en_US
      return process.env.LANG.split('.')[0];
    }

    // 3. LANGUAGE environment variable
    if (process.env.LANGUAGE) {
      return process.env.LANGUAGE.split(':')[0]; // First language in list
    }

    // 4. LC_ALL or LC_MESSAGES
    if (process.env.LC_ALL) {
      return process.env.LC_ALL.split('.')[0];
    }
    if (process.env.LC_MESSAGES) {
      return process.env.LC_MESSAGES.split('.')[0];
    }

    // 5. Default to English
    return 'en_US';
  }

  /**
   * Detect project root directory (where package.json or .git exists)
   */
  private static detectProjectRoot(): string | null {
    // Check explicit environment variable
    if (process.env.MCP_PROJECT_ROOT) {
      return process.env.MCP_PROJECT_ROOT;
    }

    // Start from current working directory
    let currentDir = process.cwd();
    const { root } = path.parse(currentDir);

    // Walk up directory tree looking for project markers
    while (currentDir !== root) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { existsSync } = require('fs');

        // Check for common project markers
        if (
          existsSync(path.join(currentDir, 'package.json')) ||
          existsSync(path.join(currentDir, '.git')) ||
          existsSync(path.join(currentDir, '.gitignore')) ||
          existsSync(path.join(currentDir, 'tsconfig.json')) ||
          existsSync(path.join(currentDir, 'pyproject.toml')) ||
          existsSync(path.join(currentDir, 'Cargo.toml')) ||
          existsSync(path.join(currentDir, 'go.mod'))
        ) {
          return currentDir;
        }
      } catch {
        // Ignore errors and continue
      }

      // Move up one directory
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Reached root
      currentDir = parentDir;
    }

    // Fallback to working directory
    return process.cwd();
  }

  /**
   * Check if filesystem is case-sensitive
   */
  private static isFilesystemCaseSensitive(): boolean {
    // Windows and macOS are typically case-insensitive
    // Linux and Unix are typically case-sensitive
    return !['win32', 'darwin'].includes(process.platform);
  }

  /**
   * Get parent process name (best-effort)
   */
  private static getParentProcessName(): string {
    try {
      if (process.platform === 'win32') {
        // Windows: Use WMIC
        const ppid = process.ppid;
        const result = execSync(`wmic process where ProcessId=${ppid} get Name`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
        });
        return result.toLowerCase();
      } else {
        // Unix/Linux/macOS: Use ps
        const ppid = process.ppid;
        const result = execSync(`ps -p ${ppid} -o comm=`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
        });
        return result.trim().toLowerCase();
      }
    } catch {
      return '';
    }
  }

  /**
   * Get detailed environment info for debugging
   */
  static getDebugInfo(): Record<string, unknown> {
    const env = this.detect();
    return {
      ...env,
      timestamp: new Date().toISOString(),
      processId: process.pid,
      parentProcessId: process.ppid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      environmentVariables: {
        MCP_IDE: process.env.MCP_IDE,
        MCP_LOCALE: process.env.MCP_LOCALE,
        MCP_TRANSPORT: process.env.MCP_TRANSPORT,
        MCP_PROJECT_ROOT: process.env.MCP_PROJECT_ROOT,
        NODE_ENV: process.env.NODE_ENV,
      },
    };
  }

  /**
   * Check if running in specific IDE
   */
  static isIDE(ideName: string): boolean {
    return this.detect().ide.toLowerCase() === ideName.toLowerCase();
  }

  /**
   * Check if running in known MCP-compatible IDE
   */
  static isKnownIDE(): boolean {
    const ide = this.detect().ide;
    return ['claude-code', 'cursor', 'windsurf', 'qoder', 'roo-code', 'vscode'].includes(ide);
  }
}
