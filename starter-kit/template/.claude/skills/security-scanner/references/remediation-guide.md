# Security Vulnerability Remediation Guide

## Overview

Step-by-step guide for remediating common security vulnerabilities found during code scanning.

## Remediation Workflow

### Standard Process

1. **Triage** - Assess severity and impact
2. **Investigate** - Understand the vulnerability
3. **Plan** - Design the fix
4. **Implement** - Apply the fix
5. **Test** - Verify fix works
6. **Review** - Security review of changes
7. **Deploy** - Push to production
8. **Monitor** - Watch for related issues

### Priority Matrix

| Severity | Exploitability | Priority | SLA |
|----------|----------------|----------|-----|
| Critical | Easy | P0 | Hours |
| Critical | Hard | P1 | 24h |
| High | Easy | P1 | 24h |
| High | Hard | P2 | 1 week |
| Medium | Any | P3 | 2 weeks |
| Low | Any | P4 | Next sprint |

## XSS (Cross-Site Scripting)

### Reflected XSS

**Vulnerability:**
```javascript
// User input directly rendered
app.get('/search', (req, res) => {
  res.send(`<h1>Results for: ${req.query.q}</h1>`);
});
```

**Remediation:**
```javascript
const escapeHtml = require('escape-html');

app.get('/search', (req, res) => {
  const safeQuery = escapeHtml(req.query.q);
  res.send(`<h1>Results for: ${safeQuery}</h1>`);
});

// Or use a templating engine with auto-escaping
app.get('/search', (req, res) => {
  res.render('search', { query: req.query.q }); // Auto-escaped
});
```

### Stored XSS

**Vulnerability:**
```javascript
// Storing and rendering user content without sanitization
const comment = await Comment.create({ text: req.body.comment });
// Later rendered as HTML
```

**Remediation:**
```javascript
const DOMPurify = require('isomorphic-dompurify');

// Sanitize on input
const cleanComment = DOMPurify.sanitize(req.body.comment);
await Comment.create({ text: cleanComment });

// Or sanitize on output
const comment = await Comment.findById(id);
res.send(DOMPurify.sanitize(comment.text));
```

### DOM XSS

**Vulnerability:**
```javascript
// Unsafe innerHTML
element.innerHTML = userInput;

// Unsafe eval
eval(userInput);
```

**Remediation:**
```javascript
// Use textContent for text
element.textContent = userInput;

// Use safe DOM methods
const node = document.createTextNode(userInput);
element.appendChild(node);

// For HTML, sanitize first
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

## SQL Injection

### Basic SQLi

**Vulnerability:**
```javascript
const query = `SELECT * FROM users WHERE id = ${userId}`;
await db.query(query);
```

**Remediation:**
```javascript
// Parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
await db.query(query, [userId]);

// Using ORM
const user = await User.findByPk(userId);

// Named parameters
const query = 'SELECT * FROM users WHERE id = :userId';
await db.query(query, { replacements: { userId } });
```

### Second-Order SQLi

**Vulnerability:**
```javascript
// Data stored then used unsafely later
const username = await User.findOne({ where: { id } }).username;
const query = `SELECT * FROM logs WHERE user = '${username}'`;
```

**Remediation:**
```javascript
// Always use parameters, even for "trusted" data
const query = 'SELECT * FROM logs WHERE user = ?';
await db.query(query, [username]);
```

## Command Injection

### OS Command Injection

**Vulnerability:**
```javascript
const { exec } = require('child_process');
exec(`convert ${inputFile} ${outputFile}`);
```

**Remediation:**
```javascript
const { spawn } = require('child_process');

// Use spawn with array arguments (no shell interpretation)
spawn('convert', [inputFile, outputFile], { shell: false });

// Validate inputs
const path = require('path');
const safeInput = path.basename(inputFile); // Remove path traversal

// Use allowlists
const ALLOWED_EXTENSIONS = ['.jpg', '.png', '.gif'];
if (!ALLOWED_EXTENSIONS.includes(path.extname(inputFile))) {
  throw new Error('Invalid file type');
}
```

## Path Traversal

### Directory Traversal

**Vulnerability:**
```javascript
const filePath = `./uploads/${req.params.filename}`;
res.sendFile(filePath);
// Attack: filename = ../../../etc/passwd
```

**Remediation:**
```javascript
const path = require('path');

const UPLOAD_DIR = path.resolve('./uploads');

app.get('/files/:filename', (req, res) => {
  const filename = path.basename(req.params.filename); // Strip path
  const filePath = path.join(UPLOAD_DIR, filename);

  // Verify resolved path is within allowed directory
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return res.status(403).send('Access denied');
  }

  res.sendFile(filePath);
});
```

## SSRF (Server-Side Request Forgery)

**Vulnerability:**
```javascript
const response = await fetch(req.query.url);
// Attack: url = http://169.254.169.254/metadata
```

**Remediation:**
```javascript
const { URL } = require('url');
const dns = require('dns').promises;

const ALLOWED_HOSTS = ['api.example.com'];
const BLOCKED_CIDRS = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '169.254.0.0/16'];

async function safeFetch(urlString) {
  const url = new URL(urlString);

  // Protocol allowlist
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Invalid protocol');
  }

  // Host allowlist
  if (!ALLOWED_HOSTS.includes(url.hostname)) {
    throw new Error('Host not allowed');
  }

  // Resolve and check IP
  const { address } = await dns.lookup(url.hostname);
  if (isPrivateIP(address)) {
    throw new Error('Private IP not allowed');
  }

  return fetch(urlString);
}
```

## Insecure Deserialization

**Vulnerability:**
```javascript
const obj = require('node-serialize').unserialize(userInput);
// Can execute arbitrary code
```

**Remediation:**
```javascript
// Use JSON only
const obj = JSON.parse(userInput);

// Validate schema
const Joi = require('joi');
const schema = Joi.object({
  name: Joi.string().required(),
  value: Joi.number()
});
const validated = schema.validate(obj);

// Type checking
if (typeof obj.callback === 'function') {
  throw new Error('Functions not allowed');
}
```

## Cryptographic Issues

### Weak Algorithms

**Vulnerability:**
```javascript
const hash = crypto.createHash('md5').update(password).digest('hex');
```

**Remediation:**
```javascript
// For passwords - use bcrypt/argon2
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);

// For general hashing - use SHA-256+
const hash = crypto.createHash('sha256').update(data).digest('hex');

// For HMAC
const hmac = crypto.createHmac('sha256', key).update(data).digest('hex');
```

### Insecure Random

**Vulnerability:**
```javascript
const token = Math.random().toString(36);
```

**Remediation:**
```javascript
const crypto = require('crypto');

// Secure random token
const token = crypto.randomBytes(32).toString('hex');

// Secure random number
const randomInt = crypto.randomInt(0, 1000000);

// UUID
const { v4: uuidv4 } = require('uuid');
const id = uuidv4();
```

## Testing Fixes

### Verification Checklist

- [ ] Original exploit no longer works
- [ ] Fix doesn't break functionality
- [ ] Similar variations tested
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Regression tests added

### Security Test Template

```javascript
describe('XSS Prevention', () => {
  const payloads = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    '<svg onload=alert(1)>',
  ];

  payloads.forEach((payload) => {
    it(`should sanitize: ${payload.substring(0, 20)}...`, async () => {
      const response = await request(app)
        .post('/comment')
        .send({ text: payload });

      expect(response.body.text).not.toContain('<script');
      expect(response.body.text).not.toContain('onerror');
      expect(response.body.text).not.toContain('javascript:');
    });
  });
});
```

## Documentation Template

```markdown
## Security Fix: [CVE/Issue ID]

### Vulnerability
- **Type:** [XSS/SQLi/etc]
- **Severity:** [Critical/High/Medium/Low]
- **Location:** `src/controllers/user.js:45`
- **Discovered:** [Date]
- **Fixed:** [Date]

### Description
[Brief description of the vulnerability]

### Impact
[What could an attacker do]

### Root Cause
[Why the vulnerability existed]

### Fix Applied
[What was changed]

### Files Modified
- `src/controllers/user.js`
- `tests/security/xss.test.js`

### Verification
- [x] Manual testing
- [x] Automated tests added
- [x] Security review passed
```
