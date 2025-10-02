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
    it('should detect XSS vulnerability', async () => {
      const testCode = `
        function render(userInput) {
          element.innerHTML = userInput;
        }
      `;

      const testFile = path.join(tmpdir(), 'test-xss-' + Date.now() + '.js');
      fs.writeFileSync(testFile, testCode);

      try {
        const findings = await scanFile(testFile);
        expect(findings.some(f => f.type === 'XSS')).toBe(true);
      } finally {
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
    });

    it('should detect SQL injection', async () => {
      const testCode = `
        const query = "SELECT * FROM users WHERE id = " + userId;
        database.query(query);
      `;

      const testFile = path.join(tmpdir(), 'test-sql-' + Date.now() + '.js');
      fs.writeFileSync(testFile, testCode);

      try {
        const findings = await scanFile(testFile);
        expect(findings.some(f => f.type === 'SQL_INJECTION')).toBe(true);
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
  });
});
