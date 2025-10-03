/**
 * Security Scanner Tests
 */

import { describe, it, expect } from 'vitest';
import { scanFile } from './scanner.js';
import { calculateEntropy } from './utils.js';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

describe('Security Scanner', () => {
  describe('scanFile', () => {
    it('should scan file without errors', async () => {
      const testCode = `
        function safeCode() {
          console.log('hello world');
        }
      `;

      const testFile = path.join(tmpdir(), 'test-safe-' + Date.now() + '.js');
      fs.writeFileSync(testFile, testCode);

      try {
        const findings = await scanFile(testFile);
        expect(Array.isArray(findings)).toBe(true);
      } finally {
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
    });

    it('should detect SQL injection vulnerability', async () => {
      const testCode = `
        const query = 'SELECT * FROM users WHERE id = ' + userId;
        db.execute(query);
      `;

      const testFile = path.join(tmpdir(), 'test-sql-' + Date.now() + '.js');
      fs.writeFileSync(testFile, testCode);

      try {
        const findings = await scanFile(testFile, { scanSQLInjection: true });
        expect(findings.some(f => f.type === 'sql_injection')).toBe(true);
      } finally {
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
    });

    it('should detect XSS vulnerability', async () => {
      const testCode = `
        element.innerHTML = userInput;
      `;

      const testFile = path.join(tmpdir(), 'test-xss-' + Date.now() + '.js');
      fs.writeFileSync(testFile, testCode);

      try {
        const findings = await scanFile(testFile, { scanXSS: true });
        expect(findings.some(f => f.type === 'xss')).toBe(true);
      } finally {
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
    });

    it('should run secret scanning without errors', async () => {
      const testCode = 'const key = "AKIAIOSFODNN7EXAMPLE"; const password = "test123";';
      const testFile = path.join(tmpdir(), 'test-secrets-' + Date.now() + '.js');
      fs.writeFileSync(testFile, testCode);

      try {
        const findings = await scanFile(testFile, { scanSecrets: true });
        expect(Array.isArray(findings)).toBe(true);
      } finally {
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
    });
  });

  describe('calculateEntropy', () => {
    it('should calculate entropy for random string', () => {
      const entropy = calculateEntropy('abcdefghijklmnop');
      expect(entropy).toBeGreaterThan(0);
    });

    it('should return 0 for empty string', () => {
      expect(calculateEntropy('')).toBe(0);
    });

    it('should calculate higher entropy for random data', () => {
      const lowEntropy = calculateEntropy('aaaaaaaaaa');
      const highEntropy = calculateEntropy('a1b2c3d4e5');
      expect(highEntropy).toBeGreaterThan(lowEntropy);
    });

    it('should detect high entropy strings', () => {
      const highEntropyString = 'X9k2mP8qL5nR3jT7wY4bV6cZ1sD0fG';
      const entropy = calculateEntropy(highEntropyString);
      expect(entropy).toBeGreaterThan(4.0);
    });
  });
});
