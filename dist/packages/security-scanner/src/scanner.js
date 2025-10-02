/**
 * Security Scanner Core Implementation
 * Comprehensive security vulnerability detection engine
 */
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { SeverityLevel, VulnerabilityType, OWASPCategory } from './types.js';
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
/**
 * Default secret detection patterns
 */
const DEFAULT_SECRET_PATTERNS = [
    {
        name: 'AWS Access Key',
        pattern: /AKIA[0-9A-Z]{16}/g,
        severity: SeverityLevel.CRITICAL,
        description: 'AWS Access Key ID detected'
    },
    {
        name: 'AWS Secret Key',
        pattern: /aws_secret_access_key\s*=\s*['""]?([A-Za-z0-9/+=]{40})['""]?/gi,
        severity: SeverityLevel.CRITICAL,
        description: 'AWS Secret Access Key detected'
    },
    {
        name: 'GitHub Token',
        pattern: /gh[ps]_[a-zA-Z0-9]{36}/g,
        severity: SeverityLevel.CRITICAL,
        description: 'GitHub Personal Access Token detected'
    },
    {
        name: 'Generic API Key',
        pattern: /api[_-]?key\s*[:=]\s*['""]([a-zA-Z0-9_\-]{20,})['"\"]/gi,
        severity: SeverityLevel.HIGH,
        description: 'Generic API key detected'
    },
    {
        name: 'Private Key',
        pattern: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH)\s+PRIVATE\s+KEY-----/g,
        severity: SeverityLevel.CRITICAL,
        description: 'Private cryptographic key detected'
    },
    {
        name: 'Password in Code',
        pattern: /password\s*[:=]\s*['""]([^'""]{8,})['"\"]/gi,
        severity: SeverityLevel.HIGH,
        description: 'Hardcoded password detected'
    },
    {
        name: 'JWT Token',
        pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
        severity: SeverityLevel.HIGH,
        description: 'JWT token detected'
    },
    {
        name: 'Slack Token',
        pattern: /xox[baprs]-[0-9a-zA-Z-]{10,}/g,
        severity: SeverityLevel.CRITICAL,
        description: 'Slack token detected'
    },
    {
        name: 'Connection String',
        pattern: /(mongodb|mysql|postgresql):\/\/[^\s]+/gi,
        severity: SeverityLevel.HIGH,
        description: 'Database connection string detected'
    }
];
/**
 * SQL injection detection patterns
 */
const SQL_INJECTION_PATTERNS = [
    {
        pattern: /(?:execute|exec|query|sql)\s*\(\s*['""`].*?\$\{.*?\}.*?['""`]\s*\)/gi,
        description: 'String interpolation in SQL query'
    },
    {
        pattern: /(?:execute|exec|query|sql)\s*\(\s*.*?\+.*?\)/gi,
        description: 'String concatenation in SQL query'
    },
    {
        pattern: /SELECT\s+.*?\s+FROM\s+.*?\s+WHERE\s+.*?\+/gi,
        description: 'Direct SQL concatenation detected'
    },
    {
        pattern: /(?:mysql_query|pg_query|sqlite_query)\s*\(\s*['""].*?\$.*?['"\"]\s*\)/gi,
        description: 'Direct variable interpolation in database query'
    }
];
/**
 * XSS vulnerability patterns
 */
const XSS_PATTERNS = [
    {
        pattern: /innerHTML\s*=\s*(?!['"""])/gi,
        description: 'Direct innerHTML assignment without sanitization'
    },
    {
        pattern: /document\.write\s*\(/gi,
        description: 'document.write usage (potential XSS vector)'
    },
    {
        pattern: /eval\s*\(/gi,
        description: 'eval() usage (potential code injection)'
    },
    {
        pattern: /dangerouslySetInnerHTML/gi,
        description: 'React dangerouslySetInnerHTML usage'
    },
    {
        pattern: /v-html\s*=/gi,
        description: 'Vue v-html directive usage'
    }
];
/**
 * Calculate Shannon entropy of a string
 */
function calculateEntropy(str) {
    const len = str.length;
    const frequencies = {};
    for (const char of str) {
        frequencies[char] = (frequencies[char] || 0) + 1;
    }
    let entropy = 0;
    for (const freq of Object.values(frequencies)) {
        const p = freq / len;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}
/**
 * Extract code context around a line
 */
function extractCodeContext(content, lineNumber, contextLines = 2) {
    const lines = content.split('\n');
    const beforeLines = lines.slice(Math.max(0, lineNumber - contextLines - 1), lineNumber - 1);
    const issueLine = lines[lineNumber - 1] || '';
    const afterLines = lines.slice(lineNumber, lineNumber + contextLines);
    return {
        beforeLines,
        issueLine,
        afterLines,
        lineNumber
    };
}
/**
 * Generate unique finding ID
 */
function generateFindingId(filePath, line, type) {
    const hash = Buffer.from(`${filePath}:${line}:${type}`).toString('base64');
    return hash.substring(0, 16);
}
/**
 * Scan file content for hardcoded secrets and credentials
 */
export async function scanForSecrets(context, customPatterns = []) {
    const findings = [];
    const patterns = [...DEFAULT_SECRET_PATTERNS, ...customPatterns];
    const lines = context.content.split('\n');
    for (const pattern of patterns) {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const matches = line.matchAll(pattern.pattern);
            for (const match of matches) {
                const matchedText = match[0];
                // Skip if it's in a comment or appears to be an example
                if (line.trim().startsWith('//') || line.trim().startsWith('#') ||
                    line.includes('example') || line.includes('EXAMPLE')) {
                    continue;
                }
                // Check entropy for high-entropy strings
                if (pattern.entropyThreshold) {
                    const entropy = calculateEntropy(matchedText);
                    if (entropy < pattern.entropyThreshold) {
                        continue;
                    }
                }
                const codeContext = extractCodeContext(context.content, i + 1);
                findings.push({
                    id: generateFindingId(context.filePath, i + 1, VulnerabilityType.SECRET_EXPOSURE),
                    type: VulnerabilityType.SECRET_EXPOSURE,
                    severity: pattern.severity,
                    title: `${pattern.name} Detected`,
                    description: `${pattern.description}. Hardcoded secrets should never be committed to source code.`,
                    filePath: context.filePath,
                    line: i + 1,
                    column: match.index,
                    codeSnippet: codeContext.issueLine,
                    recommendation: 'Remove the hardcoded secret and use environment variables or a secure secret management service (e.g., AWS Secrets Manager, HashiCorp Vault, Azure Key Vault).',
                    owaspCategory: OWASPCategory.A02_CRYPTOGRAPHIC_FAILURES,
                    cweId: 'CWE-798',
                    metadata: {
                        patternName: pattern.name,
                        matchedText: matchedText.substring(0, 20) + '...'
                    }
                });
            }
        }
    }
    return findings;
}
/**
 * Scan for SQL injection vulnerabilities
 */
export async function scanForSQLInjection(context) {
    const findings = [];
    const lines = context.content.split('\n');
    for (const { pattern, description } of SQL_INJECTION_PATTERNS) {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const matches = line.matchAll(pattern);
            for (const match of matches) {
                const codeContext = extractCodeContext(context.content, i + 1);
                findings.push({
                    id: generateFindingId(context.filePath, i + 1, VulnerabilityType.SQL_INJECTION),
                    type: VulnerabilityType.SQL_INJECTION,
                    severity: SeverityLevel.CRITICAL,
                    title: 'Potential SQL Injection Vulnerability',
                    description: `${description}. This pattern is vulnerable to SQL injection attacks.`,
                    filePath: context.filePath,
                    line: i + 1,
                    column: match.index,
                    codeSnippet: codeContext.issueLine,
                    recommendation: 'Use parameterized queries or prepared statements instead of string concatenation. Example: db.query("SELECT * FROM users WHERE id = ?", [userId])',
                    owaspCategory: OWASPCategory.A03_INJECTION,
                    cweId: 'CWE-89',
                    cvssScore: 9.8,
                    metadata: {
                        detectedPattern: description
                    }
                });
            }
        }
    }
    return findings;
}
/**
 * Scan for Cross-Site Scripting (XSS) vulnerabilities
 */
export async function scanForXSS(context) {
    const findings = [];
    const lines = context.content.split('\n');
    for (const { pattern, description } of XSS_PATTERNS) {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const matches = line.matchAll(pattern);
            for (const match of matches) {
                const codeContext = extractCodeContext(context.content, i + 1);
                findings.push({
                    id: generateFindingId(context.filePath, i + 1, VulnerabilityType.XSS),
                    type: VulnerabilityType.XSS,
                    severity: SeverityLevel.HIGH,
                    title: 'Potential Cross-Site Scripting (XSS) Vulnerability',
                    description: `${description}. This can allow attackers to inject malicious scripts.`,
                    filePath: context.filePath,
                    line: i + 1,
                    column: match.index,
                    codeSnippet: codeContext.issueLine,
                    recommendation: 'Sanitize user input before rendering. Use textContent instead of innerHTML, or use a sanitization library like DOMPurify.',
                    owaspCategory: OWASPCategory.A03_INJECTION,
                    cweId: 'CWE-79',
                    cvssScore: 7.5,
                    metadata: {
                        detectedPattern: description
                    }
                });
            }
        }
    }
    return findings;
}
/**
 * Perform OWASP Top 10 security checks
 */
export async function scanOWASP(context) {
    const findings = [];
    const lines = context.content.split('\n');
    // Check for weak cryptographic algorithms
    const weakCryptoPatterns = [
        { pattern: /\b(MD5|SHA1)\b/gi, algo: 'MD5/SHA1' },
        { pattern: /\bDES\b/gi, algo: 'DES' },
        { pattern: /\bRC4\b/gi, algo: 'RC4' }
    ];
    for (const { pattern, algo } of weakCryptoPatterns) {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (pattern.test(line)) {
                const codeContext = extractCodeContext(context.content, i + 1);
                findings.push({
                    id: generateFindingId(context.filePath, i + 1, VulnerabilityType.WEAK_CRYPTO),
                    type: VulnerabilityType.WEAK_CRYPTO,
                    severity: SeverityLevel.MEDIUM,
                    title: `Weak Cryptographic Algorithm: ${algo}`,
                    description: `Usage of ${algo} detected. This algorithm is cryptographically broken and should not be used.`,
                    filePath: context.filePath,
                    line: i + 1,
                    codeSnippet: codeContext.issueLine,
                    recommendation: 'Use strong cryptographic algorithms like SHA-256, SHA-384, or SHA-512 for hashing. Use AES-256-GCM for encryption.',
                    owaspCategory: OWASPCategory.A02_CRYPTOGRAPHIC_FAILURES,
                    cweId: 'CWE-327',
                    metadata: { algorithm: algo }
                });
            }
        }
    }
    // Check for insecure deserialization
    const deserializationPatterns = [
        /pickle\.loads?\(/gi,
        /yaml\.load\(/gi,
        /unserialize\(/gi,
        /JSON\.parse\(.*?(?:localStorage|sessionStorage|location\.)/gi
    ];
    for (const pattern of deserializationPatterns) {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (pattern.test(line)) {
                const codeContext = extractCodeContext(context.content, i + 1);
                findings.push({
                    id: generateFindingId(context.filePath, i + 1, VulnerabilityType.INSECURE_DESERIALIZATION),
                    type: VulnerabilityType.INSECURE_DESERIALIZATION,
                    severity: SeverityLevel.HIGH,
                    title: 'Insecure Deserialization',
                    description: 'Deserializing untrusted data can lead to remote code execution.',
                    filePath: context.filePath,
                    line: i + 1,
                    codeSnippet: codeContext.issueLine,
                    recommendation: 'Validate and sanitize data before deserialization. Use safe deserialization methods or implement integrity checks.',
                    owaspCategory: OWASPCategory.A08_DATA_INTEGRITY_FAILURES,
                    cweId: 'CWE-502',
                    cvssScore: 8.1
                });
            }
        }
    }
    // Check for path traversal vulnerabilities
    const pathTraversalPattern = /(?:readFile|writeFile|open|unlink|rmdir|mkdir|stat)\s*\(.*?(?:\+|concat|\$\{)/gi;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (pathTraversalPattern.test(line)) {
            const codeContext = extractCodeContext(context.content, i + 1);
            findings.push({
                id: generateFindingId(context.filePath, i + 1, VulnerabilityType.PATH_TRAVERSAL),
                type: VulnerabilityType.PATH_TRAVERSAL,
                severity: SeverityLevel.HIGH,
                title: 'Potential Path Traversal Vulnerability',
                description: 'File path operations with user input can allow attackers to access unauthorized files.',
                filePath: context.filePath,
                line: i + 1,
                codeSnippet: codeContext.issueLine,
                recommendation: 'Validate and sanitize file paths. Use path.join() and check that resolved paths stay within allowed directories.',
                owaspCategory: OWASPCategory.A01_BROKEN_ACCESS_CONTROL,
                cweId: 'CWE-22',
                cvssScore: 7.5
            });
        }
    }
    return findings;
}
/**
 * Scan package.json for vulnerable dependencies
 */
export async function scanDependencies(projectPath) {
    const vulnerabilities = [];
    try {
        const packageJsonPath = path.join(projectPath, 'package.json');
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };
        // Known vulnerable packages (example - in production, use npm audit or Snyk API)
        const knownVulnerabilities = {
            'lodash': {
                versions: ['<4.17.21'],
                cve: 'CVE-2020-8203',
                severity: SeverityLevel.HIGH,
                description: 'Prototype pollution vulnerability'
            },
            'minimist': {
                versions: ['<1.2.6'],
                cve: 'CVE-2021-44906',
                severity: SeverityLevel.MEDIUM,
                description: 'Prototype pollution vulnerability'
            }
        };
        for (const [pkg, version] of Object.entries(allDeps)) {
            if (knownVulnerabilities[pkg]) {
                const vuln = knownVulnerabilities[pkg];
                vulnerabilities.push({
                    package: pkg,
                    version: version,
                    vulnerabilityId: vuln.cve,
                    severity: vuln.severity,
                    description: vuln.description,
                    references: [`https://nvd.nist.gov/vuln/detail/${vuln.cve}`]
                });
            }
        }
    }
    catch (error) {
        // package.json not found or invalid
    }
    return vulnerabilities;
}
/**
 * Scan a single file for all vulnerability types
 */
export async function scanFile(filePath, config = {}) {
    const content = await readFile(filePath, 'utf-8');
    const stats = await stat(filePath);
    // Check file size limit
    if (config.maxFileSize && stats.size > config.maxFileSize) {
        return [];
    }
    const context = {
        filePath,
        content,
        extension: path.extname(filePath),
        size: stats.size
    };
    const findings = [];
    if (config.scanSecrets !== false) {
        findings.push(...await scanForSecrets(context, config.customPatterns));
    }
    if (config.scanSQLInjection !== false) {
        findings.push(...await scanForSQLInjection(context));
    }
    if (config.scanXSS !== false) {
        findings.push(...await scanForXSS(context));
    }
    if (config.scanOWASP !== false) {
        findings.push(...await scanOWASP(context));
    }
    // Filter by minimum severity
    if (config.minSeverity) {
        const severityOrder = [
            SeverityLevel.INFO,
            SeverityLevel.LOW,
            SeverityLevel.MEDIUM,
            SeverityLevel.HIGH,
            SeverityLevel.CRITICAL
        ];
        const minIndex = severityOrder.indexOf(config.minSeverity);
        return findings.filter(f => severityOrder.indexOf(f.severity) >= minIndex);
    }
    return findings;
}
/**
 * Recursively scan a project directory
 */
export async function scanProject(projectPath, config = {}) {
    const startTime = Date.now();
    const findings = [];
    let filesScanned = 0;
    const excludePatterns = config.excludePatterns || [
        'node_modules',
        '.git',
        'dist',
        'build',
        'coverage',
        '.next',
        '__pycache__'
    ];
    async function scanDirectory(dirPath) {
        const entries = await readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            // Check exclusions
            if (excludePatterns.some(pattern => fullPath.includes(pattern))) {
                continue;
            }
            if (entry.isDirectory()) {
                await scanDirectory(fullPath);
            }
            else if (entry.isFile()) {
                // Only scan text files
                const ext = path.extname(entry.name);
                const textExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rb', '.php', '.cs', '.cpp', '.c', '.h', '.sql', '.sh', '.json', '.yaml', '.yml', '.xml', '.html', '.css', '.env'];
                if (textExtensions.includes(ext)) {
                    try {
                        const fileFindings = await scanFile(fullPath, config);
                        findings.push(...fileFindings);
                        filesScanned++;
                    }
                    catch (error) {
                        // Skip files that can't be read
                        if (config.verbose) {
                            console.error(`Error scanning ${fullPath}:`, error);
                        }
                    }
                }
            }
        }
    }
    await scanDirectory(projectPath);
    // Scan dependencies if enabled
    let dependencyVulnerabilities = [];
    if (config.scanDependencies !== false) {
        dependencyVulnerabilities = await scanDependencies(projectPath);
    }
    const scanDuration = Date.now() - startTime;
    // Calculate statistics
    const findingsBySeverity = {
        [SeverityLevel.CRITICAL]: 0,
        [SeverityLevel.HIGH]: 0,
        [SeverityLevel.MEDIUM]: 0,
        [SeverityLevel.LOW]: 0,
        [SeverityLevel.INFO]: 0
    };
    const findingsByType = {};
    for (const finding of findings) {
        findingsBySeverity[finding.severity]++;
        findingsByType[finding.type] = (findingsByType[finding.type] || 0) + 1;
    }
    // Calculate security score (0-100, higher is better)
    const criticalWeight = 10;
    const highWeight = 5;
    const mediumWeight = 2;
    const lowWeight = 1;
    const totalWeight = findingsBySeverity[SeverityLevel.CRITICAL] * criticalWeight +
        findingsBySeverity[SeverityLevel.HIGH] * highWeight +
        findingsBySeverity[SeverityLevel.MEDIUM] * mediumWeight +
        findingsBySeverity[SeverityLevel.LOW] * lowWeight;
    const securityScore = Math.max(0, Math.min(100, 100 - totalWeight));
    return {
        totalFindings: findings.length,
        findingsBySeverity,
        findingsByType,
        findings,
        dependencyVulnerabilities,
        filesScanned,
        scanDuration,
        config,
        timestamp: new Date(),
        securityScore
    };
}
//# sourceMappingURL=scanner.js.map