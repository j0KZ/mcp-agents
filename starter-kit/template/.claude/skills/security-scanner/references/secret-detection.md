# Secret Detection Guide

## Overview

Comprehensive guide for detecting, preventing, and remediating hardcoded secrets in codebases.

## Common Secret Patterns

### API Keys and Tokens

```javascript
// Pattern: Fixed-length alphanumeric
const API_KEY = '<your-api-key-here>';

// AWS Access Keys
// Pattern: AKIA[A-Z0-9]{16}
const AWS_ACCESS = 'AKIAIOSFODNN7EXAMPLE';

// AWS Secret Keys
// Pattern: [A-Za-z0-9/+=]{40}
const AWS_SECRET = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

// GitHub Tokens
// Pattern: ghp_[A-Za-z0-9]{36}
const GITHUB_TOKEN = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// Stripe Keys
// Pattern: sk_test_[A-Za-z0-9]{24}
const STRIPE_KEY = '<stripe-secret-key>';
```

### Database Credentials

```javascript
// Connection strings
const MONGO_URI = 'mongodb://user:password@localhost:27017/db';
const POSTGRES_URI = 'postgresql://user:secret@localhost/mydb';
const MYSQL_URI = 'mysql://root:password123@localhost:3306/app';

// Direct credentials
const DB_PASSWORD = 'super_secret_password';
```

### OAuth and Auth Secrets

```javascript
// JWT Secrets
const JWT_SECRET = 'my-secret-signing-key';

// OAuth Client Secrets
const CLIENT_SECRET = 'abc123def456ghi789';

// Private Keys
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----`;
```

## Detection Regex Patterns

### High-Confidence Patterns

```javascript
const SECRET_PATTERNS = [
  // AWS
  { name: 'AWS Access Key', pattern: /AKIA[A-Z0-9]{16}/ },
  { name: 'AWS Secret Key', pattern: /[A-Za-z0-9/+=]{40}/ },

  // GitHub
  { name: 'GitHub Token', pattern: /ghp_[A-Za-z0-9]{36}/ },
  { name: 'GitHub OAuth', pattern: /gho_[A-Za-z0-9]{36}/ },

  // Stripe
  { name: 'Stripe Live Key', pattern: /sk_test_[A-Za-z0-9]{24,}/ },
  { name: 'Stripe Test Key', pattern: /sk_test_[A-Za-z0-9]{24,}/ },

  // Google
  { name: 'Google API Key', pattern: /AIza[A-Za-z0-9_-]{35}/ },

  // Slack
  { name: 'Slack Token', pattern: /xox[baprs]-[A-Za-z0-9-]+/ },

  // Private Keys
  { name: 'RSA Private Key', pattern: /-----BEGIN RSA PRIVATE KEY-----/ },
  { name: 'SSH Private Key', pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/ },
  { name: 'PGP Private Key', pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/ },

  // Generic patterns
  { name: 'Generic API Key', pattern: /api[_-]?key['\"]?\s*[:=]\s*['\"][A-Za-z0-9]{20,}['\"]/i },
  { name: 'Generic Secret', pattern: /secret['\"]?\s*[:=]\s*['\"][A-Za-z0-9]{8,}['\"]/i },
  { name: 'Password Assignment', pattern: /password['\"]?\s*[:=]\s*['\"][^'\"]{8,}['\"]/i },
];
```

### Entropy-Based Detection

```javascript
function calculateEntropy(string) {
  const len = string.length;
  const frequencies = {};

  for (const char of string) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

function isHighEntropy(string, threshold = 4.5) {
  // High entropy suggests random/encrypted content
  return calculateEntropy(string) > threshold;
}

// Check suspicious strings
const suspiciousAssignment = /['\"]([A-Za-z0-9+/=]{20,})['\"]/g;
for (const match of code.matchAll(suspiciousAssignment)) {
  if (isHighEntropy(match[1])) {
    console.warn(`Potential secret: ${match[1].substring(0, 10)}...`);
  }
}
```

## Prevention Strategies

### Environment Variables

```javascript
// .env (never commit)
DATABASE_URL=postgresql://user:pass@localhost/db
API_KEY=sk_test_xxxxx
JWT_SECRET=your-secure-random-secret

// Code
const config = {
  dbUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
  jwtSecret: process.env.JWT_SECRET,
};

// Validate at startup
function validateEnv() {
  const required = ['DATABASE_URL', 'API_KEY', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
}
```

### Secret Managers

```javascript
// AWS Secrets Manager
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

async function getSecret(secretName) {
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return JSON.parse(response.SecretString);
}

// HashiCorp Vault
const vault = require('node-vault')({ endpoint: 'http://vault:8200' });
const secrets = await vault.read('secret/data/myapp');
```

### Git Hooks

```bash
#!/bin/sh
# .husky/pre-commit

# Check for secrets
npx secretlint "**/*"
if [ $? -ne 0 ]; then
  echo "❌ Secrets detected! Please remove before committing."
  exit 1
fi
```

## Remediation Steps

### When Secret Is Committed

1. **Immediate Actions**
   ```bash
   # Don't just remove - rotate the secret!
   # The secret is already in git history

   # Remove from current code
   git rm --cached .env

   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Rotate the Secret**
   - Generate new API key/password
   - Update in secret manager
   - Revoke old credential
   - Update deployed applications

3. **Clean Git History (if needed)**
   ```bash
   # Using git-filter-repo (recommended)
   pip install git-filter-repo
   git filter-repo --path .env --invert-paths

   # Or BFG Repo-Cleaner
   java -jar bfg.jar --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

4. **Force Push (with team coordination)**
   ```bash
   git push --force-with-lease
   ```

### .gitignore Template

```gitignore
# Secrets and credentials
.env
.env.local
.env.*.local
*.pem
*.key
*.p12
*.pfx
credentials.json
secrets.json
config/secrets.yml

# IDE settings that may contain secrets
.idea/
.vscode/settings.json

# Build artifacts that may contain secrets
dist/
build/
*.log
```

## Automated Scanning

### Pre-commit Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']

  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.16.1
    hooks:
      - id: gitleaks
```

### CI/CD Integration

```yaml
# GitHub Actions
name: Secret Scan
on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Gitleaks scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### IDE Integration

```json
// .vscode/settings.json
{
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": "string.quoted",
        "settings": {
          "fontStyle": "underline"
        }
      }
    ]
  }
}
```

## False Positive Handling

```yaml
# .secretlintrc.json
{
  "rules": [
    {
      "id": "@secretlint/secretlint-rule-preset-recommend",
      "options": {
        "allows": [
          "/test/",
          "example-api-key",
          "placeholder"
        ]
      }
    }
  ]
}
```

```yaml
# .gitleaks.toml
[allowlist]
paths = [
  '''test/.*''',
  '''\.example$''',
]
regexes = [
  '''example''',
  '''placeholder''',
  '''dummy''',
]
```
