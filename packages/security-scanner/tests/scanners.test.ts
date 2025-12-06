/**
 * Tests for Security Scanner Modules
 */

import { describe, it, expect } from 'vitest';
import { scanOWASP } from '../src/scanners/owasp-scanner.js';
import { scanForSQLInjection } from '../src/scanners/sql-injection-scanner.js';
import { scanForXSS } from '../src/scanners/xss-scanner.js';
import { scanForSecrets } from '../src/scanners/secret-scanner.js';
import { FileScanContext, SeverityLevel, VulnerabilityType, OWASPCategory } from '../src/types.js';

describe('OWASP Scanner', () => {
  describe('scanOWASP', () => {
    it('should detect weak crypto algorithms - MD5', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const hash = crypto.createHash('md5').update(data).digest('hex');`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanOWASP(context);

      expect(findings.some(f => f.type === VulnerabilityType.WEAK_CRYPTO)).toBe(true);
    });

    it('should detect weak crypto algorithms - SHA1', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const hash = crypto.createHash('sha1').update(data).digest('hex');`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanOWASP(context);

      expect(findings.some(f => f.type === VulnerabilityType.WEAK_CRYPTO)).toBe(true);
    });

    it('should detect insecure deserialization - pickle', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.py',
        content: `data = pickle.loads(user_input)`,
        extension: '.py',
        size: 100,
      };

      const findings = await scanOWASP(context);

      expect(findings.some(f => f.type === VulnerabilityType.INSECURE_DESERIALIZATION)).toBe(true);
    });

    it('should detect insecure deserialization - yaml.load', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.py',
        content: `config = yaml.load(open('config.yaml'))`,
        extension: '.py',
        size: 100,
      };

      const findings = await scanOWASP(context);

      expect(findings.some(f => f.type === VulnerabilityType.INSECURE_DESERIALIZATION)).toBe(true);
    });

    it('should detect insecure deserialization - JSON.parse with localStorage', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const data = JSON.parse(localStorage.getItem('userPrefs'));`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanOWASP(context);

      expect(findings.some(f => f.type === VulnerabilityType.INSECURE_DESERIALIZATION)).toBe(true);
    });

    it('should detect path traversal with readFile', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `fs.readFile(baseDir + userInput, 'utf8', callback);`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanOWASP(context);

      expect(findings.some(f => f.type === VulnerabilityType.PATH_TRAVERSAL)).toBe(true);
    });

    it('should not report findings for scanner files', async () => {
      const context: FileScanContext = {
        filePath: '/test/security-scanner/src/scanner.ts',
        content: `const hash = crypto.createHash('md5').update(data).digest('hex');`,
        extension: '.ts',
        size: 100,
      };

      const findings = await scanOWASP(context);

      expect(findings).toHaveLength(0);
    });

    it('should return empty for clean code', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const hash = crypto.createHash('sha256').update(data).digest('hex');`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanOWASP(context);

      expect(findings.every(f => f.type !== VulnerabilityType.WEAK_CRYPTO)).toBe(true);
    });

    it('should include proper finding metadata', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const hash = crypto.createHash('md5').update(data).digest('hex');`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanOWASP(context);
      const cryptoFinding = findings.find(f => f.type === VulnerabilityType.WEAK_CRYPTO);

      expect(cryptoFinding).toBeDefined();
      expect(cryptoFinding?.severity).toBe(SeverityLevel.MEDIUM);
      expect(cryptoFinding?.recommendation).toBeDefined();
      expect(cryptoFinding?.owaspCategory).toBeDefined();
    });

    it('should detect multiple vulnerabilities in same file', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `
const hash = crypto.createHash('md5').update(data).digest('hex');
const data = pickle.loads(user_input);
`,
        extension: '.js',
        size: 200,
      };

      const findings = await scanOWASP(context);

      expect(findings.length).toBeGreaterThanOrEqual(2);
    });

    it('should include line numbers in findings', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `
const foo = 'bar';
const hash = crypto.createHash('md5').update(data).digest('hex');
const baz = 'qux';
`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanOWASP(context);
      const cryptoFinding = findings.find(f => f.type === VulnerabilityType.WEAK_CRYPTO);

      expect(cryptoFinding?.line).toBe(3);
    });

    it('should include finding ID', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const hash = crypto.createHash('md5').update(data).digest('hex');`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanOWASP(context);
      const cryptoFinding = findings.find(f => f.type === VulnerabilityType.WEAK_CRYPTO);

      expect(cryptoFinding?.id).toBeDefined();
      expect(typeof cryptoFinding?.id).toBe('string');
    });

    it('should include CWE ID in findings', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const data = pickle.loads(user_input);`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanOWASP(context);
      const finding = findings.find(f => f.type === VulnerabilityType.INSECURE_DESERIALIZATION);

      expect(finding?.cweId).toBeDefined();
    });

    it('should include OWASP category in findings', async () => {
      // Use a pattern that definitely produces a finding (weak crypto)
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const hash = crypto.createHash('md5').update(data).digest('hex');`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanOWASP(context);
      const finding = findings.find(f => f.type === VulnerabilityType.WEAK_CRYPTO);

      expect(finding).toBeDefined();
      if (finding) {
        expect(finding.owaspCategory).toBeDefined();
      }
    });
  });
});

describe('SQL Injection Scanner', () => {
  describe('scanForSQLInjection', () => {
    it('should detect string concatenation in SQL queries', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const query = "SELECT * FROM users WHERE id = " + userId;`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe(VulnerabilityType.SQL_INJECTION);
      expect(findings[0].severity).toBe(SeverityLevel.CRITICAL);
    });

    it('should detect template literals in SQL queries with query function', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: 'const result = db.query(`SELECT * FROM users WHERE name = ${userName}`);',
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe(VulnerabilityType.SQL_INJECTION);
    });

    it('should include line numbers in findings', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const foo = 'bar';
const query = "SELECT * FROM users WHERE id = " + userId;
const baz = 'qux';`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].line).toBe(2);
    });

    it('should include CWE ID for SQL injection', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const query = "SELECT * FROM users WHERE id = " + userId;`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSQLInjection(context);

      expect(findings[0].cweId).toBeDefined();
      expect(findings[0].cweId).toContain('CWE');
    });

    it('should include recommendation in findings', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const query = "SELECT * FROM users WHERE id = " + userId;`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSQLInjection(context);

      expect(findings[0].recommendation).toBeDefined();
      expect(findings[0].recommendation).toContain('parameterized');
    });

    it('should return empty array for safe parameterized queries', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `const query = db.query("SELECT * FROM users WHERE id = ?", [userId]);`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSQLInjection(context);

      // Parameterized queries should not trigger findings
      expect(
        findings.every(
          f => f.type !== VulnerabilityType.SQL_INJECTION || !f.codeSnippet?.includes('?')
        )
      ).toBe(true);
    });
  });
});

describe('XSS Scanner', () => {
  describe('scanForXSS', () => {
    it('should detect innerHTML usage', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `element.innerHTML = userInput;`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe(VulnerabilityType.XSS);
    });

    it('should detect outerHTML usage', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `element.outerHTML = userContent;`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe(VulnerabilityType.XSS);
    });

    it('should detect dangerouslySetInnerHTML in React', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.jsx',
        content: `<div dangerouslySetInnerHTML={{ __html: userContent }} />`,
        extension: '.jsx',
        size: 100,
      };

      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe(VulnerabilityType.XSS);
    });

    it('should detect document.write usage', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `document.write(userContent);`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe(VulnerabilityType.XSS);
    });

    it('should include OWASP category A03 Injection', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `element.innerHTML = userContent;`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].owaspCategory).toBe(OWASPCategory.A03_INJECTION);
    });

    it('should return empty for safe textContent usage', async () => {
      const context: FileScanContext = {
        filePath: '/test/app.js',
        content: `element.textContent = userInput;`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForXSS(context);

      // textContent is safe and should not trigger XSS
      expect(findings.filter(f => f.type === VulnerabilityType.XSS).length).toBe(0);
    });
  });
});

describe('Secret Scanner', () => {
  describe('scanForSecrets', () => {
    it('should detect AWS access keys', async () => {
      // Use a realistic key that doesn't contain "EXAMPLE" (which is skipped)
      const context: FileScanContext = {
        filePath: '/prod/config.js',
        content: `const awsKey = "AKIAIOSFODNN7REALKEY";`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe(VulnerabilityType.SECRET_EXPOSURE);
    });

    it('should detect private keys', async () => {
      const context: FileScanContext = {
        filePath: '/prod/config.js',
        content: `const key = "-----BEGIN RSA PRIVATE KEY-----";`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe(VulnerabilityType.SECRET_EXPOSURE);
    });

    it('should detect JWT tokens', async () => {
      // JWT pattern: eyJ[base64].[base64].[base64]
      const context: FileScanContext = {
        filePath: '/prod/config.js',
        content: `const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe(VulnerabilityType.SECRET_EXPOSURE);
    });

    it('should include recommendation for secret management', async () => {
      const context: FileScanContext = {
        filePath: '/prod/config.js',
        content: `const awsKey = "AKIAIOSFODNN7REALKEY";`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSecrets(context);

      expect(findings[0].recommendation).toBeDefined();
      expect(findings[0].recommendation).toContain('environment variable');
    });

    it('should skip comment lines', async () => {
      const context: FileScanContext = {
        filePath: '/prod/config.js',
        content: `// const awsKey = "AKIAIOSFODNN7REALKEY";`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSecrets(context);

      // Comments should be skipped
      expect(findings.length).toBe(0);
    });

    it('should include line numbers and column in findings', async () => {
      const context: FileScanContext = {
        filePath: '/prod/config.js',
        content: `const foo = 'bar';
const awsKey = "AKIAIOSFODNN7REALKEY";
const baz = 'qux';`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSecrets(context);

      expect(findings[0].line).toBe(2);
      expect(findings[0].column).toBeDefined();
    });

    it('should support custom patterns', async () => {
      const context: FileScanContext = {
        filePath: '/prod/config.js',
        content: `const customSecret = "CUSTOM_SECRET_12345";`,
        extension: '.js',
        size: 100,
      };

      const customPatterns = [
        {
          name: 'Custom Secret',
          pattern: /CUSTOM_SECRET_\d+/gi,
          description: 'Custom secret pattern',
          severity: SeverityLevel.HIGH as const,
        },
      ];

      const findings = await scanForSecrets(context, customPatterns);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].title).toContain('Custom Secret');
    });

    it('should include metadata with pattern name', async () => {
      const context: FileScanContext = {
        filePath: '/prod/config.js',
        content: `const awsKey = "AKIAIOSFODNN7REALKEY";`,
        extension: '.js',
        size: 100,
      };

      const findings = await scanForSecrets(context);

      expect(findings[0].metadata).toBeDefined();
      expect(findings[0].metadata?.patternName).toBeDefined();
    });
  });
});
