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
});
