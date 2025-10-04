/**
 * Secret Detection Patterns
 * Common patterns for detecting hardcoded secrets and credentials
 */

import { SecretPattern, SeverityLevel } from '../types.js';

/**
 * Default secret detection patterns
 * These patterns are used to identify common types of hardcoded secrets
 */
export const DEFAULT_SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: SeverityLevel.CRITICAL,
    description: 'AWS Access Key ID detected'
  },
  {
    name: 'AWS Secret Key',
    pattern: /aws_secret_access_key\s*=\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi,
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
    pattern: /api[_-]?key\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})['"]$/gi,
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
    pattern: /password\s*[:=]\s*['"]([^'"]{8,})['"]$/gi,
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
  },
  {
    name: 'Google/Firebase API Key',
    pattern: /AIza[0-9A-Za-z_-]{35}/g,
    severity: SeverityLevel.CRITICAL,
    description: 'Google or Firebase API key detected'
  },
  {
    name: 'Stripe API Key',
    pattern: /sk_live_[0-9a-zA-Z]{24}/g,
    severity: SeverityLevel.CRITICAL,
    description: 'Stripe secret key detected'
  },
  {
    name: 'Twilio API Key',
    pattern: /SK[a-z0-9]{32}/g,
    severity: SeverityLevel.HIGH,
    description: 'Twilio API key detected'
  },
  {
    name: 'SendGrid API Key',
    pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,
    severity: SeverityLevel.HIGH,
    description: 'SendGrid API key detected'
  },
  {
    name: 'NPM Token',
    pattern: /npm_[a-zA-Z0-9]{36}/g,
    severity: SeverityLevel.HIGH,
    description: 'NPM access token detected'
  },
  {
    name: 'Azure Storage Key',
    pattern: /DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[A-Za-z0-9+/=]{88}/gi,
    severity: SeverityLevel.CRITICAL,
    description: 'Azure Storage connection string detected'
  },
  {
    name: 'Heroku API Key',
    pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    severity: SeverityLevel.HIGH,
    description: 'Heroku API key detected'
  },
  {
    name: 'MailChimp API Key',
    pattern: /[0-9a-f]{32}-us[0-9]{1,2}/gi,
    severity: SeverityLevel.HIGH,
    description: 'MailChimp API key detected'
  },
  {
    name: 'PayPal Braintree Token',
    pattern: /access_token\$production\$[a-z0-9]{16}\$[a-f0-9]{32}/gi,
    severity: SeverityLevel.CRITICAL,
    description: 'PayPal Braintree access token detected'
  },
  {
    name: 'Square Access Token',
    pattern: /sq0atp-[0-9A-Za-z_-]{22}/g,
    severity: SeverityLevel.CRITICAL,
    description: 'Square access token detected'
  }
];

/**
 * Comment patterns to skip (these are likely examples or documentation)
 */
export const SKIP_PATTERNS = {
  COMMENT_PREFIXES: ['//','#', '/*', '*'],
  EXAMPLE_KEYWORDS: ['example', 'EXAMPLE', 'sample', 'SAMPLE', 'test', 'TEST', 'TODO', 'FIXME'],
} as const;
