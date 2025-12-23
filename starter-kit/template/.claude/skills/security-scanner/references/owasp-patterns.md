# OWASP Security Patterns

## Overview

Reference guide for detecting and preventing OWASP Top 10 vulnerabilities in JavaScript/TypeScript applications.

## A01: Broken Access Control

### Vulnerable Patterns

```javascript
// Direct object reference without authorization
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id); // No auth check!
  res.json(user);
});

// Exposing admin functionality without role check
app.post('/api/admin/delete-user', async (req, res) => {
  await User.deleteOne({ id: req.body.userId }); // No role verification!
});
```

### Secure Patterns

```javascript
// Proper authorization
app.get('/api/users/:id', authenticate, async (req, res) => {
  // Check ownership or admin role
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = await User.findById(req.params.id);
  res.json(user);
});

// Role-based access control middleware
const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};
```

## A02: Cryptographic Failures

### Vulnerable Patterns

```javascript
// Weak hashing
const hash = crypto.createHash('md5').update(password).digest('hex');

// Hardcoded secrets
const JWT_SECRET = 'my-secret-key';

// Insecure random
const token = Math.random().toString(36);
```

### Secure Patterns

```javascript
// Strong password hashing
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);

// Secrets from environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

// Cryptographically secure random
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');
```

## A03: Injection

### SQL Injection

```javascript
// Vulnerable
const query = `SELECT * FROM users WHERE name = '${userInput}'`;
await db.query(query);

// Secure - Parameterized queries
const query = 'SELECT * FROM users WHERE name = ?';
await db.query(query, [userInput]);

// Secure - ORM with proper escaping
await User.findOne({ where: { name: userInput } });
```

### Command Injection

```javascript
// Vulnerable
const { exec } = require('child_process');
exec(`ls ${userInput}`);

// Secure - Use spawn with array args
const { spawn } = require('child_process');
spawn('ls', [userInput], { shell: false });

// Secure - Validate input
const allowedDirs = ['docs', 'public', 'uploads'];
if (!allowedDirs.includes(userInput)) {
  throw new Error('Invalid directory');
}
```

### NoSQL Injection

```javascript
// Vulnerable - Object injection
const user = await User.findOne({ username: req.body.username });
// Attacker sends: { "$gt": "" } as username

// Secure - Ensure string type
const username = String(req.body.username);
const user = await User.findOne({ username });

// Secure - Schema validation
const schema = Joi.object({
  username: Joi.string().alphanum().required()
});
```

## A04: Insecure Design

### Security Controls

```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');
app.use('/api/login', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts'
}));

// Account lockout
async function handleLogin(username, password) {
  const user = await User.findOne({ username });

  if (user.lockoutUntil > Date.now()) {
    throw new Error('Account temporarily locked');
  }

  if (!await bcrypt.compare(password, user.password)) {
    user.failedAttempts++;
    if (user.failedAttempts >= 5) {
      user.lockoutUntil = Date.now() + 30 * 60 * 1000; // 30 min
    }
    await user.save();
    throw new Error('Invalid credentials');
  }

  user.failedAttempts = 0;
  await user.save();
}
```

## A05: Security Misconfiguration

### Secure Headers

```javascript
const helmet = require('helmet');
app.use(helmet());

// Custom configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Error Handling

```javascript
// Don't expose stack traces in production
app.use((err, req, res, next) => {
  console.error(err); // Log full error

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});
```

## A06: Vulnerable Components

See dependency-analyzer references for mitigation strategies.

## A07: Authentication Failures

### Session Security

```javascript
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId', // Don't use default name
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // No JS access
    sameSite: 'strict', // CSRF protection
    maxAge: 3600000 // 1 hour
  }
}));
```

### JWT Best Practices

```javascript
const jwt = require('jsonwebtoken');

// Sign with strong algorithm
const token = jwt.sign(payload, secret, {
  algorithm: 'HS256',
  expiresIn: '1h',
  issuer: 'your-app'
});

// Verify properly
try {
  const decoded = jwt.verify(token, secret, {
    algorithms: ['HS256'], // Prevent algorithm confusion
    issuer: 'your-app'
  });
} catch (err) {
  // Handle invalid token
}
```

## A08: Software and Data Integrity

### Subresource Integrity

```html
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous">
</script>
```

### Secure Deserialization

```javascript
// Avoid eval and Function constructor
// Bad
eval(userInput);
new Function(userInput);

// Bad - Arbitrary code execution
const obj = serialize.unserialize(userInput);

// Good - Use JSON
const obj = JSON.parse(userInput);

// Good - Validate schema after parsing
const parsed = JSON.parse(userInput);
const validated = schema.validate(parsed);
```

## A09: Security Logging

```javascript
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Log security events
function logSecurityEvent(event, details) {
  securityLogger.info({
    timestamp: new Date().toISOString(),
    event,
    ...details,
    // Don't log sensitive data
    password: undefined,
    token: undefined
  });
}

// Usage
logSecurityEvent('LOGIN_FAILED', {
  username: req.body.username,
  ip: req.ip,
  userAgent: req.get('User-Agent')
});
```

## A10: Server-Side Request Forgery (SSRF)

### Vulnerable Pattern

```javascript
// User controls URL
const response = await axios.get(req.query.url);
// Attacker uses: http://169.254.169.254/metadata (AWS)
```

### Secure Pattern

```javascript
const { URL } = require('url');

const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com'];
const BLOCKED_IPS = ['127.0.0.1', 'localhost', '169.254.169.254'];

async function secureFetch(urlString) {
  const url = new URL(urlString);

  // Check allowed hosts
  if (!ALLOWED_HOSTS.includes(url.hostname)) {
    throw new Error('Host not allowed');
  }

  // Block internal IPs
  const ip = await dns.lookup(url.hostname);
  if (BLOCKED_IPS.includes(ip) || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    throw new Error('Internal addresses not allowed');
  }

  return axios.get(urlString);
}
```
