/**
 * Smart Path Resolution System
 * Intelligently resolves file paths using multiple fallback strategies
 * Handles relative paths, home directory expansion, and fuzzy matching
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { EnvironmentDetector } from '../runtime/environment-detector.js';

export interface PathResolutionResult {
  resolved: string;
  strategy: string;
  attempted: Array<{ path: string; reason: string }>;
  suggestions?: string[];
}

export interface PathResolutionContext {
  workingDir?: string;
  projectRoot?: string;
  allowedDirs?: string[];
  maxDepth?: number;
}

export class SmartPathResolver {
  /**
   * Resolve file path using multiple fallback strategies
   */
  static async resolvePath(
    inputPath: string,
    context: PathResolutionContext = {}
  ): Promise<PathResolutionResult> {
    const attempted: Array<{ path: string; reason: string }> = [];
    const env = EnvironmentDetector.detect();

    // Normalize context with defaults
    const ctx = {
      workingDir: context.workingDir || env.workingDir,
      projectRoot: context.projectRoot || env.projectRoot || env.workingDir,
      allowedDirs: context.allowedDirs || [],
      maxDepth: context.maxDepth || 3,
    };

    // Strategy 1: Handle home directory expansion
    const normalizedPath = inputPath.replace(/^~/, os.homedir());

    // Strategy 2: Absolute path (use as-is)
    if (path.isAbsolute(normalizedPath)) {
      if (await this.fileExists(normalizedPath)) {
        return {
          resolved: normalizedPath,
          strategy: 'absolute_path',
          attempted,
        };
      }
      attempted.push({ path: normalizedPath, reason: 'file not found' });
    }

    // Strategy 3: Relative to working directory
    const fromCwd = path.resolve(ctx.workingDir, normalizedPath);
    if (await this.fileExists(fromCwd)) {
      return {
        resolved: fromCwd,
        strategy: 'relative_to_cwd',
        attempted,
      };
    }
    attempted.push({ path: fromCwd, reason: 'file not found' });

    // Strategy 4: Relative to project root
    if (ctx.projectRoot && ctx.projectRoot !== ctx.workingDir) {
      const fromRoot = path.resolve(ctx.projectRoot, normalizedPath);
      if (await this.fileExists(fromRoot)) {
        return {
          resolved: fromRoot,
          strategy: 'relative_to_project_root',
          attempted,
        };
      }
      attempted.push({ path: fromRoot, reason: 'file not found' });
    }

    // Strategy 5: Search in allowed directories
    for (const allowedDir of ctx.allowedDirs) {
      const fromAllowed = path.resolve(allowedDir, normalizedPath);
      if (await this.fileExists(fromAllowed)) {
        return {
          resolved: fromAllowed,
          strategy: 'from_allowed_directory',
          attempted,
        };
      }
      attempted.push({ path: fromAllowed, reason: 'file not found' });
    }

    // Strategy 6: Walk up parent directories (for relative paths like "../file.js")
    if (!path.isAbsolute(normalizedPath)) {
      const fromParents = await this.searchParentDirectories(
        normalizedPath,
        ctx.workingDir,
        ctx.maxDepth
      );
      if (fromParents) {
        return {
          resolved: fromParents,
          strategy: 'parent_directory_search',
          attempted,
        };
      }
    }

    // Strategy 7: Fuzzy filename match (maybe typo?)
    const fuzzyMatch = await this.fuzzyFindFile(normalizedPath, ctx.workingDir, ctx.maxDepth);
    if (fuzzyMatch) {
      return {
        resolved: fuzzyMatch,
        strategy: 'fuzzy_match',
        attempted,
        suggestions: [`Did you mean: ${fuzzyMatch}?`],
      };
    }

    // All strategies failed
    throw new PathResolutionError(inputPath, attempted);
  }

  /**
   * Check if file exists and is accessible
   */
  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.R_OK);
      const stats = await fs.stat(filePath);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  /**
   * Search for file in parent directories (up to maxDepth levels)
   */
  private static async searchParentDirectories(
    filename: string,
    startDir: string,
    maxDepth: number
  ): Promise<string | null> {
    let currentDir = startDir;
    const { root } = path.parse(currentDir);

    for (let depth = 0; depth < maxDepth; depth++) {
      const candidate = path.join(currentDir, filename);
      if (await this.fileExists(candidate)) {
        return candidate;
      }

      // Move up one directory
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir || parentDir === root) {
        break; // Reached root
      }
      currentDir = parentDir;
    }

    return null;
  }

  /**
   * Fuzzy file search (find similar filenames)
   */
  private static async fuzzyFindFile(
    targetName: string,
    searchDir: string,
    maxDepth: number
  ): Promise<string | null> {
    try {
      const targetBase = path.basename(targetName).toLowerCase();
      const matches = await this.recursiveReadDir(searchDir, maxDepth);

      // Find files with similar names
      for (const file of matches) {
        const baseName = path.basename(file).toLowerCase();

        // Exact match (case-insensitive)
        if (baseName === targetBase) {
          return file;
        }

        // Close match (Levenshtein distance < 3)
        if (this.levenshteinDistance(baseName, targetBase) < 3) {
          return file;
        }
      }
    } catch {
      // Search failed, ignore
    }

    return null;
  }

  /**
   * Recursively read directory up to maxDepth
   */
  private static async recursiveReadDir(dir: string, maxDepth: number): Promise<string[]> {
    const files: string[] = [];

    async function walk(currentDir: string, depth: number) {
      if (depth > maxDepth) return;

      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);

          // Skip node_modules, .git, etc.
          if (['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
            continue;
          }

          if (entry.isFile()) {
            files.push(fullPath);
          } else if (entry.isDirectory()) {
            await walk(fullPath, depth + 1);
          }
        }
      } catch {
        // Permission denied or other error, skip
      }
    }

    await walk(dir, 0);
    return files;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Get relative path from project root (for display purposes)
   */
  static getRelativePath(absolutePath: string): string {
    const env = EnvironmentDetector.detect();
    const projectRoot = env.projectRoot || env.workingDir;

    if (absolutePath.startsWith(projectRoot)) {
      return path.relative(projectRoot, absolutePath);
    }

    return absolutePath;
  }
}

/**
 * Custom error for path resolution failures
 */
export class PathResolutionError extends Error {
  constructor(
    public readonly requestedPath: string,
    public readonly attempted: Array<{ path: string; reason: string }>
  ) {
    super(`Cannot resolve path: ${requestedPath}`);
    this.name = 'PathResolutionError';
  }

  toJSON() {
    return {
      error: this.message,
      requestedPath: this.requestedPath,
      attempted: this.attempted,
      suggestion: 'Check if the file path is correct and the file exists',
    };
  }
}
