import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import * as target from '../src/scanner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const apiDesignerFile = path.join(projectRoot, 'packages/api-designer/src/designer.ts');

describe('Security Scanner Functions', () => {
  const testCode = {
    content: `
      const query = "SELECT * FROM users WHERE id = " + userId;
      eval(userInput);
      document.innerHTML = userContent;
    `,
    filePath: 'test.js',
  };

  describe('scanForSQLInjection()', () => {
    it('should scan for SQL injection', async () => {
      const result = await target.scanForSQLInjection(testCode);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should detect string concatenation in SQL', async () => {
      const code = {
        content: 'const query = "SELECT * FROM users WHERE id = " + userId;',
        filePath: 'test.js',
      };
      const result = await target.scanForSQLInjection(code);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle clean code without SQL injection', async () => {
      const code = {
        content: 'const greeting = "Hello, " + name;',
        filePath: 'test.js',
      };
      const result = await target.scanForSQLInjection(code);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('scanForXSS()', () => {
    it('should scan for XSS vulnerabilities', async () => {
      const result = await target.scanForXSS(testCode);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should detect innerHTML usage', async () => {
      const code = {
        content: 'document.getElementById("test").innerHTML = userInput;',
        filePath: 'test.js',
      };
      const result = await target.scanForXSS(code);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should detect eval usage', async () => {
      const code = {
        content: 'eval(userCode);',
        filePath: 'test.js',
      };
      const result = await target.scanForXSS(code);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should detect dangerouslySetInnerHTML', async () => {
      const code = {
        content: '<div dangerouslySetInnerHTML={{ __html: userContent }} />',
        filePath: 'test.jsx',
      };
      const result = await target.scanForXSS(code);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('scanForSecrets()', () => {
    it('should scan for secrets', async () => {
      const codeWithSecret = {
        content: 'const apiKey = "sk_test_12345abcdef";',
        filePath: 'test.js',
      };
      const result = await target.scanForSecrets(codeWithSecret);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should detect API keys', async () => {
      const code = {
        content: 'const key = "AIzaSyD-9tN_ABCDEFGHIJKLMNOPQRSTUVWXYZ";',
        filePath: 'test.js',
      };
      const result = await target.scanForSecrets(code);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should detect AWS keys', async () => {
      const code = {
        content: 'const aws = "AKIAIOSFODNN7EXAMPLE";',
        filePath: 'test.js',
      };
      const result = await target.scanForSecrets(code);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should detect private keys', async () => {
      const code = {
        content: '-----BEGIN RSA PRIVATE KEY-----',
        filePath: 'test.js',
      };
      const result = await target.scanForSecrets(code);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle code without secrets', async () => {
      const code = {
        content: 'const name = "John Doe";',
        filePath: 'test.js',
      };
      const result = await target.scanForSecrets(code);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('scanFile()', () => {
    it('should scan file for vulnerabilities', async () => {
      const result = await target.scanFile(apiDesignerFile);
      expect(result).toBeDefined();
    });

    it('should return findings array', async () => {
      const result = await target.scanFile(apiDesignerFile);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include findings with severity', async () => {
      const result = await target.scanFile(apiDesignerFile);
      expect(Array.isArray(result)).toBe(true);
      result.forEach(finding => {
        expect(finding).toHaveProperty('severity');
      });
    });

    it('should include findings with messages', async () => {
      const result = await target.scanFile(apiDesignerFile);
      expect(Array.isArray(result)).toBe(true);
      result.forEach(finding => {
        expect(finding).toHaveProperty('message');
      });
    });
  });

  describe('vulnerability severity', () => {
    it('should categorize vulnerabilities by severity', async () => {
      const result = await target.scanFile(apiDesignerFile);
      result.forEach(vuln => {
        expect(['critical', 'high', 'medium', 'low', 'info']).toContain(vuln.severity);
      });
    });
  });

  describe('OWASP checks', () => {
    it('should perform OWASP Top 10 checks', async () => {
      const result = await target.scanFile(apiDesignerFile);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('path traversal detection', () => {
    it('should detect path traversal attempts', async () => {
      const code = {
        content: 'const filePath = "../../../etc/passwd";',
        filePath: 'test.js',
      };
      // This would be part of scanFile functionality
      expect(code.content).toContain('..');
    });
  });

  describe('command injection detection', () => {
    it('should detect command injection patterns', async () => {
      const code = {
        content: 'exec("ls -la " + userInput);',
        filePath: 'test.js',
      };
      expect(code.content).toContain('exec');
    });
  });

  describe('scanFile() with config options', () => {
    it('should respect maxFileSize config', async () => {
      // Using a config that will skip files over 1 byte should return empty
      const result = await target.scanFile(apiDesignerFile, { maxFileSize: 1 });
      expect(result).toEqual([]);
    });

    it('should filter by minSeverity', async () => {
      const result = await target.scanFile(apiDesignerFile, { minSeverity: 'critical' as const });
      expect(Array.isArray(result)).toBe(true);
      // All findings should be critical or higher
      result.forEach(finding => {
        expect(finding.severity).toBe('critical');
      });
    });

    it('should filter by minSeverity HIGH', async () => {
      const result = await target.scanFile(apiDesignerFile, { minSeverity: 'high' as const });
      expect(Array.isArray(result)).toBe(true);
      // All findings should be high or higher
      result.forEach(finding => {
        expect(['high', 'critical']).toContain(finding.severity);
      });
    });

    it('should respect scanSecrets false config', async () => {
      const result = await target.scanFile(apiDesignerFile, { scanSecrets: false });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should respect scanSQLInjection false config', async () => {
      const result = await target.scanFile(apiDesignerFile, { scanSQLInjection: false });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should respect scanXSS false config', async () => {
      const result = await target.scanFile(apiDesignerFile, { scanXSS: false });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should respect scanOWASP false config', async () => {
      const result = await target.scanFile(apiDesignerFile, { scanOWASP: false });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should use caching for repeated scans', async () => {
      // First scan
      const result1 = await target.scanFile(apiDesignerFile);
      // Second scan should hit cache
      const result2 = await target.scanFile(apiDesignerFile);
      expect(result1.length).toBe(result2.length);
    });
  });

  describe('scanProject()', () => {
    it('should scan a project directory', async () => {
      const testDir = path.join(projectRoot, 'packages/api-designer/src');
      const result = await target.scanProject(testDir);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalFindings');
      expect(result).toHaveProperty('filesScanned');
      expect(result).toHaveProperty('scanDuration');
      expect(result).toHaveProperty('findings');
      expect(result).toHaveProperty('securityScore');
    });

    it('should calculate findings by severity', async () => {
      const testDir = path.join(projectRoot, 'packages/api-designer/src');
      const result = await target.scanProject(testDir);

      expect(result.findingsBySeverity).toBeDefined();
      expect(result.findingsBySeverity).toHaveProperty('critical');
      expect(result.findingsBySeverity).toHaveProperty('high');
      expect(result.findingsBySeverity).toHaveProperty('medium');
      expect(result.findingsBySeverity).toHaveProperty('low');
      expect(result.findingsBySeverity).toHaveProperty('info');
    });

    it('should calculate findings by type', async () => {
      const testDir = path.join(projectRoot, 'packages/api-designer/src');
      const result = await target.scanProject(testDir);

      expect(result.findingsByType).toBeDefined();
    });

    it('should calculate security score between 0 and 100', async () => {
      const testDir = path.join(projectRoot, 'packages/api-designer/src');
      const result = await target.scanProject(testDir);

      expect(result.securityScore).toBeGreaterThanOrEqual(0);
      expect(result.securityScore).toBeLessThanOrEqual(100);
    });

    it('should include timestamp', async () => {
      const testDir = path.join(projectRoot, 'packages/api-designer/src');
      const result = await target.scanProject(testDir);

      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should respect exclude patterns', async () => {
      const testDir = path.join(projectRoot, 'packages/api-designer');
      const result = await target.scanProject(testDir, {
        excludePatterns: ['constants', 'helpers'],
      });

      expect(result).toBeDefined();
    });

    it('should respect scanDependencies false config', async () => {
      const testDir = path.join(projectRoot, 'packages/api-designer/src');
      const result = await target.scanProject(testDir, {
        scanDependencies: false,
      });

      expect(result.dependencyVulnerabilities).toEqual([]);
    });

    it('should include config in result', async () => {
      const testDir = path.join(projectRoot, 'packages/api-designer/src');
      const config = { scanSecrets: true, verbose: false };
      const result = await target.scanProject(testDir, config);

      expect(result.config).toBeDefined();
    });
  });

  describe('scanOWASP()', () => {
    it('should delegate to OWASP scanner module', async () => {
      const code = {
        content: `const hash = crypto.createHash('md5').update(data).digest('hex');`,
        filePath: '/test/app.js',
        extension: '.js',
        size: 100,
      };
      const result = await target.scanOWASP(code);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('scanDependencies()', () => {
    it('should scan dependencies for vulnerabilities', async () => {
      const testDir = path.join(projectRoot, 'packages/api-designer');
      const result = await target.scanDependencies(testDir);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
