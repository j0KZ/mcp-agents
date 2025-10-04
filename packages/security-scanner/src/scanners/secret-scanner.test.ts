import { describe, it, expect } from 'vitest';
import { scanForSecrets } from './secret-scanner.js';
import type { FileScanContext } from '../types.js';

describe('Secret Scanner', () => {
  const createContext = (content: string, filePath = 'test.js'): FileScanContext => ({
    filePath,
    content,
    extension: '.js',
    size: content.length
  });

  describe('AWS Credentials Detection', () => {
    it('should detect AWS access key', async () => {
      const context = createContext('const key = "AKIAIOSFODNN7EXAMPLE";');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe('secret_exposure');
    });

    it('should detect AWS secret key in config', async () => {
      const context = createContext('aws_secret_access_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('GitHub Tokens Detection', () => {
    it('should detect GitHub personal access token', async () => {
      const context = createContext('const token = "ghp_1234567890abcdefghijklmnopqrstu";');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect GitHub secret token', async () => {
      const context = createContext('GH_TOKEN=ghs_abcdefghijklmnopqrstuvwxyz123456');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('API Keys Detection', () => {
    it('should detect generic API key', async () => {
      const context = createContext('api_key: "abc123def456ghi789jkl012mno345pqr"');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect Google/Firebase API key', async () => {
      const context = createContext('const apiKey = "AIzaSyD1234567890abcdefghijklmnopqr";');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect Stripe secret key', async () => {
      const context = createContext('STRIPE_KEY=sk_live_abcd1234567890efghij');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('Private Keys Detection', () => {
    it('should detect RSA private key', async () => {
      const context = createContext('-----BEGIN RSA PRIVATE KEY-----');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect EC private key', async () => {
      const context = createContext('-----BEGIN EC PRIVATE KEY-----');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('JWT Tokens Detection', () => {
    it('should detect valid JWT token', async () => {
      const context = createContext(
        'const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";'
      );
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('Password Detection', () => {
    it('should detect hardcoded password', async () => {
      const context = createContext('password: "mySecurePassword123"');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('Database Connection Strings', () => {
    it('should detect MongoDB connection string', async () => {
      const context = createContext('mongodb://user:pass@localhost:27017/db');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect PostgreSQL connection string', async () => {
      const context = createContext('postgresql://admin:secret@db.example.com/mydb');
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const context = createContext('');
      const findings = await scanForSecrets(context);

      expect(findings).toHaveLength(0);
    });

    it('should handle multiline secrets', async () => {
      const context = createContext(`
        const config = {
          awsKey: "AKIAIOSFODNN7EXAMPLE",
          stripeKey: "sk_live_abcd1234567890efghij"
        };
      `);
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle code without secrets', async () => {
      const context = createContext('const message = "Hello World"; console.log(message);');
      const findings = await scanForSecrets(context);

      expect(findings).toHaveLength(0);
    });
  });

  describe('Multiple Findings', () => {
    it('should detect multiple secrets in same file', async () => {
      const context = createContext(`
        const aws = "AKIAIOSFODNN7EXAMPLE";
        const github = "ghp_1234567890abcdefghijklmnopqrstu";
        const stripe = "sk_live_abcd1234567890efghij";
      `);
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThanOrEqual(3);
    });
  });
});
