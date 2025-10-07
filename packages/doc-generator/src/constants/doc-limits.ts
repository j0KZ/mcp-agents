/**
 * Documentation generation limits and thresholds
 */

/**
 * Git commit limits
 */
export const GIT_LIMITS = {
  /** Default maximum number of commits to include in changelog */
  DEFAULT_COMMIT_LIMIT: 100,
  /** Maximum buffer size for git command output (10MB) */
  MAX_GIT_BUFFER: 10 * 1024 * 1024,
} as const;

/**
 * File and directory exclusion patterns
 */
export const EXCLUSION_PATTERNS = {
  /** Hidden directories (starting with .) */
  HIDDEN_DIRS: /^\./,
  /** Node modules directory */
  NODE_MODULES: 'node_modules',
  /** Build output directory */
  DIST: 'dist',
  /** Test file patterns */
  TEST_FILES: /\.test\.|\.spec\./,
} as const;

/**
 * File type patterns
 */
export const FILE_PATTERNS = {
  /** Source file extensions */
  SOURCE_FILES: /\.(ts|js|tsx|jsx)$/,
} as const;
