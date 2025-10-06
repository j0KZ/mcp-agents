/**
 * Security Scanner Constants
 * Central location for all magic numbers and constant values
 */

// Severity Levels
export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
} as const;

// CVSS Scores (Common Vulnerability Scoring System)
export const CVSS_SCORE = {
  CRITICAL: 9.0,
  HIGH: 7.0,
  MEDIUM: 4.0,
  LOW: 0.1,
} as const;

// Vulnerability Types
export const VULN_TYPE = {
  SECRET: 'secret',
  SQL_INJECTION: 'sql_injection',
  XSS: 'xss',
  PATH_TRAVERSAL: 'path_traversal',
  COMMAND_INJECTION: 'command_injection',
  WEAK_CRYPTO: 'weak_crypto',
  INSECURE_DESERIALIZATION: 'insecure_deserialization',
  OWASP: 'owasp',
} as const;

// OWASP Categories
export const OWASP_CATEGORY = {
  A01_BROKEN_ACCESS: 'A01:2021 – Broken Access Control',
  A02_CRYPTO_FAILURES: 'A02:2021 – Cryptographic Failures',
  A03_INJECTION: 'A03:2021 – Injection',
  A04_INSECURE_DESIGN: 'A04:2021 – Insecure Design',
  A05_SECURITY_MISCONFIG: 'A05:2021 – Security Misconfiguration',
  A06_VULNERABLE_COMPONENTS: 'A06:2021 – Vulnerable and Outdated Components',
  A07_AUTH_FAILURES: 'A07:2021 – Identification and Authentication Failures',
  A08_DATA_INTEGRITY: 'A08:2021 – Software and Data Integrity Failures',
  A09_LOGGING_FAILURES: 'A09:2021 – Security Logging and Monitoring Failures',
  A10_SSRF: 'A10:2021 – Server-Side Request Forgery',
} as const;

// CWE IDs (Common Weakness Enumeration)
export const CWE_ID = {
  SQL_INJECTION: 'CWE-89',
  XSS: 'CWE-79',
  PATH_TRAVERSAL: 'CWE-22',
  COMMAND_INJECTION: 'CWE-78',
  WEAK_CRYPTO: 'CWE-327',
  HARDCODED_CREDENTIALS: 'CWE-798',
  INSECURE_DESERIALIZATION: 'CWE-502',
  EVAL_INJECTION: 'CWE-95',
} as const;

// Entropy Thresholds for Secret Detection
export const ENTROPY_THRESHOLD = {
  HIGH: 4.5,
  MEDIUM: 3.5,
  LOW: 2.5,
} as const;

// String Length Thresholds
export const STRING_LENGTH = {
  MIN_SECRET_LENGTH: 16,
  MAX_SECRET_LENGTH: 512,
  CONTEXT_LINES: 2,
  TRUNCATE_LENGTH: 20,
  MIN_API_KEY_LENGTH: 20,
  AWS_SECRET_KEY_LENGTH: 40,
  SLACK_TOKEN_MIN_LENGTH: 10,
  PATTERN_MAX_LENGTH: 200,
} as const;

// File Scanning Limits
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10000,
  DEFAULT_MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Scan Configuration Defaults
export const SCAN_DEFAULTS = {
  MIN_SEVERITY: 'medium',
  SCAN_SECRETS: true,
  SCAN_SQL_INJECTION: true,
  SCAN_XSS: true,
  SCAN_OWASP: true,
  SCAN_DEPENDENCIES: false,
  VERBOSE: false,
} as const;

// Security Score Calculation
export const SECURITY_SCORE = {
  PERFECT: 100,
  CRITICAL_PENALTY: 25,
  CRITICAL_WEIGHT: 10,
  HIGH_PENALTY: 15,
  HIGH_WEIGHT: 5,
  MEDIUM_PENALTY: 5,
  MEDIUM_WEIGHT: 2,
  LOW_PENALTY: 1,
  LOW_WEIGHT: 1,
  MIN_SCORE: 0,
  MAX_SCORE: 100,
} as const;

// Excluded Patterns (False Positive Prevention)
export const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  'vendor',
  '__pycache__',
  '.pytest_cache',
  '.venv',
  'venv',
] as const;

// File Extensions to Scan
export const SCANNABLE_EXTENSIONS = [
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.py',
  '.java',
  '.go',
  '.rb',
  '.php',
  '.cs',
  '.sql',
  '.yml',
  '.yaml',
  '.json',
  '.env',
  '.config',
] as const;

// Recommendation Templates
export const RECOMMENDATIONS = {
  SQL_INJECTION:
    'Use parameterized queries or prepared statements. Never concatenate user input directly into SQL queries.',
  XSS: 'Sanitize user input before rendering. Use textContent instead of innerHTML, or use a sanitization library like DOMPurify.',
  PATH_TRAVERSAL:
    'Validate and sanitize file paths. Use path.resolve() and check that the resolved path is within allowed directories.',
  COMMAND_INJECTION:
    'Avoid using shell commands with user input. Use safe alternatives or properly escape/validate input.',
  WEAK_CRYPTO:
    'Use strong cryptographic algorithms like SHA-256, SHA-384, or SHA-512 for hashing. Use AES-256-GCM for encryption.',
  HARDCODED_SECRET:
    'Move secrets to environment variables or a secure secrets management system (e.g., AWS Secrets Manager, HashiCorp Vault).',
  INSECURE_DESERIALIZATION:
    'Avoid deserializing untrusted data. Implement integrity checks and use safe deserialization libraries.',
} as const;
