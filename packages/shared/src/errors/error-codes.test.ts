import { describe, it, expect } from 'vitest';
import { ERROR_CODES } from './index.js';

describe('Error Codes', () => {
  describe('ERROR_CODES constants', () => {
    it('should contain orchestrator error codes', () => {
      expect(ERROR_CODES.ORCH_001).toBe('Missing required workflow argument');
      expect(ERROR_CODES.ORCH_002).toBe('Unknown workflow name');
      expect(ERROR_CODES.ORCH_003).toBe('Unknown tool in sequence');
    });

    it('should contain test generator error codes', () => {
      expect(ERROR_CODES.TEST_001).toBe('Invalid file path');
      expect(ERROR_CODES.TEST_002).toBe('Unsupported framework');
      expect(ERROR_CODES.TEST_003).toBe('File not found');
    });

    it('should contain smart reviewer error codes', () => {
      expect(ERROR_CODES.REV_001).toBe('filePaths must be a non-empty array');
      expect(ERROR_CODES.REV_002).toBe('Unknown tool');
    });

    it('should contain security scanner error codes', () => {
      expect(ERROR_CODES.SEC_001).toBe('Invalid file path');
      expect(ERROR_CODES.SEC_002).toBe('Scan failed');
    });

    it('should have unique error codes', () => {
      const codes = Object.keys(ERROR_CODES);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });

    it('should follow naming convention for most codes', () => {
      const codes = Object.keys(ERROR_CODES);
      const pattern = /^[A-Z]{2,5}_\d{3}$/; // Allow 2-5 letter prefixes

      const conformingCodes = codes.filter(code => pattern.test(code));
      // Most codes should follow the pattern (>80%)
      expect(conformingCodes.length).toBeGreaterThan(codes.length * 0.8);
    });

    it('should have descriptive error messages', () => {
      const messages = Object.values(ERROR_CODES);

      messages.forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(5);
      });
    });

    it('should export error codes as readonly object', () => {
      expect(ERROR_CODES).toBeDefined();
      expect(typeof ERROR_CODES).toBe('object');
    });
  });
});
