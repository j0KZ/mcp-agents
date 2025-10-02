/**
 * Security Scanner Constants
 * Central location for all magic numbers and constant values
 */
export declare const SEVERITY: {
    readonly CRITICAL: "critical";
    readonly HIGH: "high";
    readonly MEDIUM: "medium";
    readonly LOW: "low";
    readonly INFO: "info";
};
export declare const CVSS_SCORE: {
    readonly CRITICAL: 9;
    readonly HIGH: 7;
    readonly MEDIUM: 4;
    readonly LOW: 0.1;
};
export declare const VULN_TYPE: {
    readonly SECRET: "secret";
    readonly SQL_INJECTION: "sql_injection";
    readonly XSS: "xss";
    readonly PATH_TRAVERSAL: "path_traversal";
    readonly COMMAND_INJECTION: "command_injection";
    readonly WEAK_CRYPTO: "weak_crypto";
    readonly INSECURE_DESERIALIZATION: "insecure_deserialization";
    readonly OWASP: "owasp";
};
export declare const OWASP_CATEGORY: {
    readonly A01_BROKEN_ACCESS: "A01:2021 – Broken Access Control";
    readonly A02_CRYPTO_FAILURES: "A02:2021 – Cryptographic Failures";
    readonly A03_INJECTION: "A03:2021 – Injection";
    readonly A04_INSECURE_DESIGN: "A04:2021 – Insecure Design";
    readonly A05_SECURITY_MISCONFIG: "A05:2021 – Security Misconfiguration";
    readonly A06_VULNERABLE_COMPONENTS: "A06:2021 – Vulnerable and Outdated Components";
    readonly A07_AUTH_FAILURES: "A07:2021 – Identification and Authentication Failures";
    readonly A08_DATA_INTEGRITY: "A08:2021 – Software and Data Integrity Failures";
    readonly A09_LOGGING_FAILURES: "A09:2021 – Security Logging and Monitoring Failures";
    readonly A10_SSRF: "A10:2021 – Server-Side Request Forgery";
};
export declare const CWE_ID: {
    readonly SQL_INJECTION: "CWE-89";
    readonly XSS: "CWE-79";
    readonly PATH_TRAVERSAL: "CWE-22";
    readonly COMMAND_INJECTION: "CWE-78";
    readonly WEAK_CRYPTO: "CWE-327";
    readonly HARDCODED_CREDENTIALS: "CWE-798";
    readonly INSECURE_DESERIALIZATION: "CWE-502";
    readonly EVAL_INJECTION: "CWE-95";
};
export declare const ENTROPY_THRESHOLD: {
    readonly HIGH: 4.5;
    readonly MEDIUM: 3.5;
    readonly LOW: 2.5;
};
export declare const STRING_LENGTH: {
    readonly MIN_SECRET_LENGTH: 16;
    readonly MAX_SECRET_LENGTH: 512;
    readonly CONTEXT_LINES: 2;
};
export declare const FILE_LIMITS: {
    readonly MAX_FILE_SIZE: number;
    readonly MAX_FILES: 10000;
    readonly DEFAULT_MAX_FILE_SIZE: number;
};
export declare const SCAN_DEFAULTS: {
    readonly MIN_SEVERITY: "medium";
    readonly SCAN_SECRETS: true;
    readonly SCAN_SQL_INJECTION: true;
    readonly SCAN_XSS: true;
    readonly SCAN_OWASP: true;
    readonly SCAN_DEPENDENCIES: false;
    readonly VERBOSE: false;
};
export declare const SECURITY_SCORE: {
    readonly PERFECT: 100;
    readonly CRITICAL_PENALTY: 25;
    readonly HIGH_PENALTY: 15;
    readonly MEDIUM_PENALTY: 5;
    readonly LOW_PENALTY: 1;
    readonly MIN_SCORE: 0;
};
export declare const EXCLUDE_PATTERNS: readonly ["node_modules", ".git", "dist", "build", "coverage", ".next", ".nuxt", "vendor", "__pycache__", ".pytest_cache", ".venv", "venv"];
export declare const SCANNABLE_EXTENSIONS: readonly [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".go", ".rb", ".php", ".cs", ".sql", ".yml", ".yaml", ".json", ".env", ".config"];
export declare const RECOMMENDATIONS: {
    readonly SQL_INJECTION: "Use parameterized queries or prepared statements. Never concatenate user input directly into SQL queries.";
    readonly XSS: "Sanitize user input before rendering. Use textContent instead of innerHTML, or use a sanitization library like DOMPurify.";
    readonly PATH_TRAVERSAL: "Validate and sanitize file paths. Use path.resolve() and check that the resolved path is within allowed directories.";
    readonly COMMAND_INJECTION: "Avoid using shell commands with user input. Use safe alternatives or properly escape/validate input.";
    readonly WEAK_CRYPTO: "Use strong cryptographic algorithms like SHA-256, SHA-384, or SHA-512 for hashing. Use AES-256-GCM for encryption.";
    readonly HARDCODED_SECRET: "Move secrets to environment variables or a secure secrets management system (e.g., AWS Secrets Manager, HashiCorp Vault).";
    readonly INSECURE_DESERIALIZATION: "Avoid deserializing untrusted data. Implement integrity checks and use safe deserialization libraries.";
};
//# sourceMappingURL=constants.d.ts.map