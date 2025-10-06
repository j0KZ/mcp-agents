import { describe, it, expect } from 'vitest';
import { calculateEntropy } from './utils.js';

describe('Security Scanner Utils', () => {
  describe('calculateEntropy', () => {
    it('should return 0 for empty string', () => {
      expect(calculateEntropy('')).toBe(0);
    });

    it('should return 0 for single character repeated', () => {
      const entropy = calculateEntropy('aaaaaaa');
      expect(entropy).toBe(0);
    });

    it('should calculate high entropy for random strings', () => {
      const entropy = calculateEntropy('a1B2c3D4e5F6');
      expect(entropy).toBeGreaterThan(3);
    });

    it('should calculate low entropy for patterns', () => {
      const entropy = calculateEntropy('abcabcabcabc');
      expect(entropy).toBeLessThan(2);
    });

    it('should handle special characters', () => {
      const entropy = calculateEntropy('!@#$%^&*()');
      expect(entropy).toBeGreaterThan(0);
    });

    it('should be deterministic', () => {
      const str = 'test123ABC!@#';
      const entropy1 = calculateEntropy(str);
      const entropy2 = calculateEntropy(str);

      expect(entropy1).toBe(entropy2);
    });

    it('should handle unicode characters', () => {
      const entropy = calculateEntropy('Hello🎉World');
      expect(entropy).toBeGreaterThan(0);
    });

    it('should calculate higher entropy for diverse strings', () => {
      const lowEntropy = calculateEntropy('aaabbbccc');
      const highEntropy = calculateEntropy('aBc123!@#');

      expect(highEntropy).toBeGreaterThan(lowEntropy);
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000) + 'b'.repeat(1000);
      const entropy = calculateEntropy(longString);

      expect(entropy).toBeGreaterThan(0);
      expect(entropy).toBeLessThan(2);
    });

    it('should handle single character', () => {
      const entropy = calculateEntropy('a');
      expect(entropy).toBe(0);
    });

    it('should handle two different characters', () => {
      const entropy = calculateEntropy('ab');
      expect(entropy).toBeGreaterThan(0);
    });

    it('should handle all same characters', () => {
      const entropy = calculateEntropy('xxxxxxxxxx');
      expect(entropy).toBe(0);
    });

    it('should calculate entropy for binary strings', () => {
      const entropy = calculateEntropy('010101010101');
      expect(entropy).toBeGreaterThan(0);
    });

    it('should calculate entropy for hex strings', () => {
      const entropy = calculateEntropy('0123456789ABCDEF');
      expect(entropy).toBeGreaterThan(3);
    });

    it('should calculate entropy for base64-like strings', () => {
      const entropy = calculateEntropy(
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
      );
      expect(entropy).toBeGreaterThan(5);
    });
  });
});
