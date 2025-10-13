/**
 * Universal Configuration Adapter
 * Normalizes any MCP config format to work across all IDEs
 * Automatically fixes common configuration issues
 */

import * as path from 'path';
import { EnvironmentDetector } from '../runtime/environment-detector.js';

export interface MCPServerConfig {
  type?: 'stdio' | 'sse' | 'websocket';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  [key: string]: unknown;
}

export interface NormalizedConfig {
  type: 'stdio' | 'sse' | 'websocket';
  command?: string;
  args: string[];
  env: Record<string, string>;
  url?: string;
}

export interface ConfigValidation {
  valid: boolean;
  normalized: NormalizedConfig | null;
  issues: string[];
  fixes: string[];
  warnings: string[];
}

export class ConfigAdapter {
  /**
   * Normalize any config format to standard MCP config
   */
  static normalize(config: MCPServerConfig): NormalizedConfig {
    const env = EnvironmentDetector.detect();

    // Determine transport type
    const type = config.type || this.inferTransport(config);

    // Build normalized config
    const normalized: NormalizedConfig = {
      type,
      command: config.command,
      args: config.args || [],
      env: {
        ...this.getDefaultEnv(env),
        ...(config.env || {}),
      },
    };

    // Handle SSE-specific config
    if (type === 'sse') {
      normalized.url = config.url;
    }

    return normalized;
  }

  /**
   * Validate and auto-fix configuration
   */
  static validate(config: MCPServerConfig): ConfigValidation {
    const issues: string[] = [];
    const fixes: string[] = [];
    const warnings: string[] = [];

    // Fix 1: Missing type field
    if (!config.type) {
      issues.push('Missing "type" field');
      fixes.push('Inferred transport type from config structure');
    }

    // Fix 2: Missing args array
    if (!config.args) {
      issues.push('Missing "args" array');
      fixes.push('Initialized empty args array');
    }

    // Fix 3: Missing env object
    if (!config.env) {
      issues.push('Missing "env" object');
      fixes.push('Added default environment variables');
    }

    // Validation: stdio requires command
    const type = config.type || this.inferTransport(config);
    if (type === 'stdio' && !config.command) {
      issues.push('CRITICAL: stdio transport requires "command" field');
      return {
        valid: false,
        normalized: null,
        issues,
        fixes,
        warnings,
      };
    }

    // Validation: SSE requires url
    if (type === 'sse' && !config.url) {
      issues.push('CRITICAL: SSE transport requires "url" field');
      return {
        valid: false,
        normalized: null,
        issues,
        fixes,
        warnings,
      };
    }

    // Warning: Using @latest in production
    if (config.args?.some(arg => arg.includes('@latest'))) {
      warnings.push('Using @latest may cause version inconsistencies. Consider pinning versions.');
    }

    // Warning: No explicit NODE_ENV
    if (!config.env?.NODE_ENV) {
      warnings.push('NODE_ENV not set. Defaulting to "production"');
    }

    // Normalize the config
    const normalized = this.normalize(config);

    return {
      valid: true,
      normalized,
      issues,
      fixes,
      warnings,
    };
  }

  /**
   * Auto-fix common configuration issues
   */
  static autoFix(config: MCPServerConfig): {
    fixed: NormalizedConfig;
    changes: string[];
  } {
    const changes: string[] = [];
    const normalized = this.normalize(config);

    // Fix: Ensure NODE_ENV is set
    if (!normalized.env.NODE_ENV) {
      normalized.env.NODE_ENV = 'production';
      changes.push('Set NODE_ENV=production');
    }

    // Fix: Ensure locale is set
    if (!normalized.env.MCP_LOCALE) {
      const env = EnvironmentDetector.detect();
      normalized.env.MCP_LOCALE = env.locale;
      changes.push(`Set MCP_LOCALE=${env.locale}`);
    }

    // Fix: Add IDE identifier
    if (!normalized.env.MCP_IDE) {
      const env = EnvironmentDetector.detect();
      normalized.env.MCP_IDE = env.ide;
      changes.push(`Set MCP_IDE=${env.ide}`);
    }

    // Fix: Resolve command to absolute path (best effort)
    if (normalized.command && !path.isAbsolute(normalized.command)) {
      try {
        // Try to find command in PATH
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const which = require('which');
        const resolved = which.sync(normalized.command, { nothrow: true });
        if (resolved) {
          normalized.command = resolved;
          changes.push(`Resolved command path: ${resolved}`);
        }
      } catch {
        // which module not available or command not found
        // Keep original command as-is
      }
    }

    return { fixed: normalized, changes };
  }

  /**
   * Infer transport type from config structure
   */
  private static inferTransport(config: MCPServerConfig): 'stdio' | 'sse' | 'websocket' {
    // SSE: has url field
    if (config.url) {
      return 'sse';
    }

    // Stdio: has command field
    if (config.command) {
      return 'stdio';
    }

    // Check environment detection
    const env = EnvironmentDetector.detect();
    return env.transport === 'unknown' ? 'stdio' : env.transport;
  }

  /**
   * Get default environment variables based on runtime
   */
  private static getDefaultEnv(
    env: ReturnType<typeof EnvironmentDetector.detect>
  ): Record<string, string> {
    return {
      NODE_ENV: 'production',
      MCP_IDE: env.ide,
      MCP_LOCALE: env.locale,
      MCP_TRANSPORT: env.transport,
      MCP_PROJECT_ROOT: env.projectRoot || env.workingDir,
    };
  }

  /**
   * Generate IDE-specific config from universal config
   */
  static toIDEConfig(
    normalizedConfig: NormalizedConfig,
    targetIDE: 'claude' | 'cursor' | 'windsurf' | 'qoder' | 'vscode'
  ): MCPServerConfig {
    // IDE-specific adjustments
    switch (targetIDE) {
      case 'qoder':
      case 'vscode':
        // Qoder and VSCode require explicit type field
        return {
          ...normalizedConfig,
        };

      case 'claude':
      case 'cursor':
      case 'windsurf': {
        // These IDEs infer stdio if type is missing
        // Can omit type field for cleaner config
        const { type: _type, ...rest } = normalizedConfig;
        return rest;
      }

      default:
        return { ...normalizedConfig };
    }
  }

  /**
   * Detect config format (for migration)
   */
  static detectFormat(config: MCPServerConfig): 'claude' | 'qoder' | 'vscode' | 'generic' {
    // Qoder format: always has explicit type
    if (config.type && config.command && config.args) {
      return 'qoder';
    }

    // Claude format: minimal, no type field
    if (!config.type && config.command) {
      return 'claude';
    }

    // VSCode format: structured with type
    if (config.type && (config.command || config.url)) {
      return 'vscode';
    }

    return 'generic';
  }
}
