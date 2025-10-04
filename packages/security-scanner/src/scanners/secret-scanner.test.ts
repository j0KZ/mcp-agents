import { describe, it, expect } from 'vitest';
import { scanForSecrets } from './secret-scanner.js';
import type { FileScanContext } from '../types.js';

describe('Secret Scanner', () => {
  const createContext = (content: string, filePath = 'app.js'): FileScanContext => ({
    filePath,
    content,
    extension: '.js',
    size: content.length
  });

  describe('AWS Credentials Detection', () => {
    it('should detect AWS access key', async () => {
      // Using AKIA + 16 chars (valid format, fake key)
      const fakeKey = 'AKIA' + 'X'.repeat(16);
      const context = createContext(`const key = "${fakeKey}";`);
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe('secret_exposure');
    });

    it('should detect AWS secret key in config', async () => {
      // Valid format: 40 base64-like chars
      const fakeSecret = 'X'.repeat(40);
      const context = createContext(`aws_secret_access_key = ${fakeSecret}`);
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('GitHub Tokens Detection', () => {
    it('should detect GitHub personal access token', async () => {
      // ghp_ + 36 chars = 40 total (using all X's to avoid real pattern)
      const fakeToken = 'ghp_' + 'X'.repeat(36);
      const context = createContext(`const tok = "${fakeToken}";`);
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect GitHub secret token', async () => {
      // ghs_ + 36 chars = 40 total
      const fakeToken = 'ghs_' + 'Y'.repeat(36);
      const context = createContext(`GH_TOK=${fakeToken}`);
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('API Keys Detection', () => {
    it('should detect generic API key', async () => {
      // Generic API key: 20+ chars (using repeated pattern)
      const fakeApiKey = 'A'.repeat(32);
      const context = createContext(`api_key: "${fakeApiKey}"`);
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect Google/Firebase API key', async () => {
      // AIza + 35 chars = 39 total (using Z's to avoid real pattern)
      const fakeKey = 'AIza' + 'Z'.repeat(35);
      const context = createContext(`const apiKey = "${fakeKey}";`);
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect Stripe secret key', async () => {
      // sk_live_ + 24 chars (using all Z's)
      const fakeKey = 'sk_live_' + 'Z'.repeat(24);
      const context = createContext(`STRIPE_KEY=${fakeKey}`);
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
      // JWT format: eyJ[base64].eyJ[base64].[signature] - using fake base64
      const fakeJwt = 'eyJ' + 'X'.repeat(20) + '.eyJ' + 'Y'.repeat(20) + '.' + 'Z'.repeat(30);
      const context = createContext(`const jwt = "${fakeJwt}";`);
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
      const context = createContext('postgresql://admin:secret@db.production.com/mydb');
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
      const fakeAws = 'AKIA' + 'X'.repeat(16);
      const fakeStripe = 'sk_live_' + 'Z'.repeat(24);
      const context = createContext(`
        const config = {
          awsKey: "${fakeAws}",
          stripeKey: "${fakeStripe}"
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
      const fakeAws = 'AKIA' + 'X'.repeat(16);
      const fakeGithub = 'ghp_' + 'X'.repeat(36);
      const fakeStripe = 'sk_live_' + 'Z'.repeat(24);
      const context = createContext(`
        const aws = "${fakeAws}";
        const github = "${fakeGithub}";
        const stripe = "${fakeStripe}";
      `);
      const findings = await scanForSecrets(context);

      expect(findings.length).toBeGreaterThanOrEqual(3);
    });
  });
});
