/**
 * Security Scanner Type Definitions
 * Comprehensive type system for security vulnerability detection
 */
/**
 * Severity levels for security findings
 */
export declare enum SeverityLevel {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    INFO = "info"
}
/**
 * Types of security vulnerabilities
 */
export declare enum VulnerabilityType {
    SECRET_EXPOSURE = "secret_exposure",
    SQL_INJECTION = "sql_injection",
    XSS = "xss",
    PATH_TRAVERSAL = "path_traversal",
    COMMAND_INJECTION = "command_injection",
    INSECURE_DESERIALIZATION = "insecure_deserialization",
    WEAK_CRYPTO = "weak_crypto",
    INSECURE_DEPENDENCY = "insecure_dependency",
    AUTHENTICATION_BYPASS = "authentication_bypass",
    AUTHORIZATION_ISSUE = "authorization_issue",
    CSRF = "csrf",
    SSRF = "ssrf",
    XXE = "xxe",
    OPEN_REDIRECT = "open_redirect",
    INFORMATION_DISCLOSURE = "information_disclosure"
}
/**
 * OWASP Top 10 categories
 */
export declare enum OWASPCategory {
    A01_BROKEN_ACCESS_CONTROL = "A01:2021 \u2013 Broken Access Control",
    A02_CRYPTOGRAPHIC_FAILURES = "A02:2021 \u2013 Cryptographic Failures",
    A03_INJECTION = "A03:2021 \u2013 Injection",
    A04_INSECURE_DESIGN = "A04:2021 \u2013 Insecure Design",
    A05_SECURITY_MISCONFIGURATION = "A05:2021 \u2013 Security Misconfiguration",
    A06_VULNERABLE_COMPONENTS = "A06:2021 \u2013 Vulnerable and Outdated Components",
    A07_AUTH_FAILURES = "A07:2021 \u2013 Identification and Authentication Failures",
    A08_DATA_INTEGRITY_FAILURES = "A08:2021 \u2013 Software and Data Integrity Failures",
    A09_LOGGING_FAILURES = "A09:2021 \u2013 Security Logging and Monitoring Failures",
    A10_SSRF = "A10:2021 \u2013 Server-Side Request Forgery (SSRF)"
}
/**
 * Individual security finding
 */
export interface SecurityFinding {
    /** Unique identifier for the finding */
    id: string;
    /** Type of vulnerability */
    type: VulnerabilityType;
    /** Severity level */
    severity: SeverityLevel;
    /** Human-readable title */
    title: string;
    /** Detailed description */
    description: string;
    /** File path where issue was found */
    filePath: string;
    /** Line number in the file */
    line: number;
    /** Column number (optional) */
    column?: number;
    /** Code snippet showing the issue */
    codeSnippet: string;
    /** Recommended fix */
    recommendation: string;
    /** OWASP category mapping */
    owaspCategory?: OWASPCategory;
    /** CWE identifier */
    cweId?: string;
    /** CVSS score (0-10) */
    cvssScore?: number;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Secret detection pattern
 */
export interface SecretPattern {
    /** Pattern name */
    name: string;
    /** Regular expression pattern */
    pattern: RegExp;
    /** Severity if found */
    severity: SeverityLevel;
    /** Description of what this detects */
    description: string;
    /** Entropy threshold (optional) */
    entropyThreshold?: number;
}
/**
 * Dependency vulnerability information
 */
export interface DependencyVulnerability {
    /** Package name */
    package: string;
    /** Current version */
    version: string;
    /** Vulnerability ID (CVE, GHSA, etc.) */
    vulnerabilityId: string;
    /** Severity level */
    severity: SeverityLevel;
    /** Description of vulnerability */
    description: string;
    /** Patched version */
    patchedVersion?: string;
    /** CVSS score */
    cvssScore?: number;
    /** Reference URLs */
    references?: string[];
}
/**
 * Scan configuration options
 */
export interface ScanConfig {
    /** Include secret scanning */
    scanSecrets?: boolean;
    /** Include SQL injection scanning */
    scanSQLInjection?: boolean;
    /** Include XSS scanning */
    scanXSS?: boolean;
    /** Include OWASP Top 10 checks */
    scanOWASP?: boolean;
    /** Include dependency scanning */
    scanDependencies?: boolean;
    /** Custom patterns to scan for */
    customPatterns?: SecretPattern[];
    /** File patterns to exclude */
    excludePatterns?: string[];
    /** Maximum file size to scan (bytes) */
    maxFileSize?: number;
    /** Minimum severity to report */
    minSeverity?: SeverityLevel;
    /** Enable verbose logging */
    verbose?: boolean;
}
/**
 * Scan result summary
 */
export interface ScanResult {
    /** Total number of findings */
    totalFindings: number;
    /** Findings by severity */
    findingsBySeverity: Record<SeverityLevel, number>;
    /** Findings by type */
    findingsByType: Record<VulnerabilityType, number>;
    /** All security findings */
    findings: SecurityFinding[];
    /** Dependency vulnerabilities */
    dependencyVulnerabilities: DependencyVulnerability[];
    /** Files scanned */
    filesScanned: number;
    /** Scan duration (ms) */
    scanDuration: number;
    /** Scan configuration used */
    config: ScanConfig;
    /** Scan timestamp */
    timestamp: Date;
    /** Overall security score (0-100) */
    securityScore: number;
}
/**
 * File scan context
 */
export interface FileScanContext {
    /** File path */
    filePath: string;
    /** File content */
    content: string;
    /** File extension */
    extension: string;
    /** Language detected */
    language?: string;
    /** File size in bytes */
    size: number;
}
/**
 * Security report format
 */
export interface SecurityReport {
    /** Report title */
    title: string;
    /** Executive summary */
    summary: string;
    /** Scan results */
    results: ScanResult;
    /** Recommendations */
    recommendations: string[];
    /** Generated at timestamp */
    generatedAt: Date;
    /** Report format version */
    version: string;
}
/**
 * Code context for a finding
 */
export interface CodeContext {
    /** Lines before the issue */
    beforeLines: string[];
    /** The problematic line */
    issueLine: string;
    /** Lines after the issue */
    afterLines: string[];
    /** Total line number */
    lineNumber: number;
}
//# sourceMappingURL=types.d.ts.map