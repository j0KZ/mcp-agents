/**
 * Security Scanner Thresholds and Constants
 * Centralized configuration for security scanning parameters
 */

/**
 * Entropy thresholds for detecting high-entropy strings (potential secrets)
 */
export const ENTROPY_THRESHOLDS = {
  /** High entropy threshold for generic secrets (bits) */
  HIGH: 4.5,
  /** Medium entropy threshold (bits) */
  MEDIUM: 3.5,
  /** Low entropy threshold (bits) */
  LOW: 3.0,
} as const;

/**
 * Severity score weights for calculating overall security score
 */
export const SEVERITY_WEIGHTS = {
  /** Weight for critical severity findings */
  CRITICAL: 100,
  /** Weight for high severity findings */
  HIGH: 50,
  /** Weight for medium severity findings */
  MEDIUM: 25,
  /** Weight for low severity findings */
  LOW: 10,
  /** Weight for info severity findings */
  INFO: 5,
} as const;

/**
 * Security score bounds
 */
export const SECURITY_SCORE = {
  /** Maximum security score (perfect) */
  MAX: 100,
  /** Minimum security score */
  MIN: 0,
} as const;

/**
 * File processing limits
 */
export const FILE_LIMITS = {
  /** Maximum line length to scan (prevent ReDoS) */
  MAX_LINE_LENGTH: 1000,
  /** Maximum file size to scan (bytes) */
  MAX_FILE_SIZE: 10_000_000, // 10MB
  /** Default context lines to show around findings */
  CONTEXT_LINES: 2,
  /** Maximum number of findings per file before stopping */
  MAX_FINDINGS_PER_FILE: 100,
} as const;

/**
 * Pattern matching limits
 */
export const PATTERN_LIMITS = {
  /** Maximum regex match length */
  MAX_MATCH_LENGTH: 1000,
  /** Minimum secret length to consider */
  MIN_SECRET_LENGTH: 8,
  /** Maximum secret preview length in reports */
  SECRET_PREVIEW_LENGTH: 20,
} as const;

/**
 * Dependency scanning configuration
 */
export const DEPENDENCY_LIMITS = {
  /** Default CVSS score for unknown vulnerabilities */
  DEFAULT_CVSS: 7.5,
  /** Minimum CVSS score to report */
  MIN_CVSS_THRESHOLD: 4.0,
} as const;

/**
 * CVSS scores for specific vulnerability types
 */
export const CVSS_SCORES = {
  /** SQL Injection vulnerability score */
  SQL_INJECTION: 9.8,
  /** XSS vulnerability score */
  XSS: 7.5,
  /** Insecure deserialization score */
  INSECURE_DESERIALIZATION: 8.1,
} as const;

/**
 * OWASP Top 10 category mappings
 */
export const OWASP_CATEGORIES = {
  BROKEN_ACCESS_CONTROL: 'A01:2021',
  CRYPTOGRAPHIC_FAILURES: 'A02:2021',
  INJECTION: 'A03:2021',
  INSECURE_DESIGN: 'A04:2021',
  SECURITY_MISCONFIGURATION: 'A05:2021',
  VULNERABLE_COMPONENTS: 'A06:2021',
  IDENTIFICATION_FAILURES: 'A07:2021',
  SOFTWARE_INTEGRITY_FAILURES: 'A08:2021',
  LOGGING_FAILURES: 'A09:2021',
  SERVER_SIDE_REQUEST_FORGERY: 'A10:2021',
} as const;

/**
 * CWE (Common Weakness Enumeration) mappings
 */
export const CWE_IDS = {
  HARDCODED_CREDENTIALS: 'CWE-798',
  SQL_INJECTION: 'CWE-89',
  XSS: 'CWE-79',
  PATH_TRAVERSAL: 'CWE-22',
  COMMAND_INJECTION: 'CWE-78',
  WEAK_CRYPTO: 'CWE-327',
  INSECURE_DESERIALIZATION: 'CWE-502',
  XXE: 'CWE-611',
  SSRF: 'CWE-918',
  OPEN_REDIRECT: 'CWE-601',
} as const;
