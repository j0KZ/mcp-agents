/**
 * Security Scanner Type Definitions
 * Comprehensive type system for security vulnerability detection
 */
/**
 * Severity levels for security findings
 */
export var SeverityLevel;
(function (SeverityLevel) {
    SeverityLevel["CRITICAL"] = "critical";
    SeverityLevel["HIGH"] = "high";
    SeverityLevel["MEDIUM"] = "medium";
    SeverityLevel["LOW"] = "low";
    SeverityLevel["INFO"] = "info";
})(SeverityLevel || (SeverityLevel = {}));
/**
 * Types of security vulnerabilities
 */
export var VulnerabilityType;
(function (VulnerabilityType) {
    VulnerabilityType["SECRET_EXPOSURE"] = "secret_exposure";
    VulnerabilityType["SQL_INJECTION"] = "sql_injection";
    VulnerabilityType["XSS"] = "xss";
    VulnerabilityType["PATH_TRAVERSAL"] = "path_traversal";
    VulnerabilityType["COMMAND_INJECTION"] = "command_injection";
    VulnerabilityType["INSECURE_DESERIALIZATION"] = "insecure_deserialization";
    VulnerabilityType["WEAK_CRYPTO"] = "weak_crypto";
    VulnerabilityType["INSECURE_DEPENDENCY"] = "insecure_dependency";
    VulnerabilityType["AUTHENTICATION_BYPASS"] = "authentication_bypass";
    VulnerabilityType["AUTHORIZATION_ISSUE"] = "authorization_issue";
    VulnerabilityType["CSRF"] = "csrf";
    VulnerabilityType["SSRF"] = "ssrf";
    VulnerabilityType["XXE"] = "xxe";
    VulnerabilityType["OPEN_REDIRECT"] = "open_redirect";
    VulnerabilityType["INFORMATION_DISCLOSURE"] = "information_disclosure";
})(VulnerabilityType || (VulnerabilityType = {}));
/**
 * OWASP Top 10 categories
 */
export var OWASPCategory;
(function (OWASPCategory) {
    OWASPCategory["A01_BROKEN_ACCESS_CONTROL"] = "A01:2021 \u2013 Broken Access Control";
    OWASPCategory["A02_CRYPTOGRAPHIC_FAILURES"] = "A02:2021 \u2013 Cryptographic Failures";
    OWASPCategory["A03_INJECTION"] = "A03:2021 \u2013 Injection";
    OWASPCategory["A04_INSECURE_DESIGN"] = "A04:2021 \u2013 Insecure Design";
    OWASPCategory["A05_SECURITY_MISCONFIGURATION"] = "A05:2021 \u2013 Security Misconfiguration";
    OWASPCategory["A06_VULNERABLE_COMPONENTS"] = "A06:2021 \u2013 Vulnerable and Outdated Components";
    OWASPCategory["A07_AUTH_FAILURES"] = "A07:2021 \u2013 Identification and Authentication Failures";
    OWASPCategory["A08_DATA_INTEGRITY_FAILURES"] = "A08:2021 \u2013 Software and Data Integrity Failures";
    OWASPCategory["A09_LOGGING_FAILURES"] = "A09:2021 \u2013 Security Logging and Monitoring Failures";
    OWASPCategory["A10_SSRF"] = "A10:2021 \u2013 Server-Side Request Forgery (SSRF)";
})(OWASPCategory || (OWASPCategory = {}));
//# sourceMappingURL=types.js.map