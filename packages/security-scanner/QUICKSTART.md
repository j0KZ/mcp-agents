# Security Scanner MCP - Quick Start Guide

## Installation Verification

The package has been successfully built. You should see these files:

```
security-scanner/
├── src/
│   ├── types.ts          ✅ Type definitions
│   ├── scanner.ts        ✅ Core scanning logic
│   ├── index.ts          ✅ Public API
│   └── mcp-server.ts     ✅ MCP server
├── dist/                 ✅ Compiled output
├── package.json          ✅ Package configuration
├── tsconfig.json         ✅ TypeScript config
├── LICENSE               ✅ MIT license
└── README.md             ✅ Documentation
```

## Quick Test

### 1. Create a test file with vulnerabilities

```bash
cd D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/security-scanner
```

Create `test-vulnerable.js`:

```javascript
// Hardcoded secrets (CRITICAL)
const apiKey = 'sk_live_abc123xyz789';
const awsKey = 'AKIAIOSFODNN7EXAMPLE';
const password = 'admin123';

// SQL Injection (CRITICAL)
function getUser(userId) {
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  return db.query(query);
}

// XSS vulnerability (HIGH)
function renderUserContent(content) {
  document.getElementById('output').innerHTML = content;
  eval(content);
}

// Weak crypto (MEDIUM)
const hash = crypto.createHash('md5').update('password').digest('hex');
```

### 2. Test the scanner programmatically

Create `test-scan.js`:

```javascript
import { scanFile } from './dist/index.js';

const findings = await scanFile('./test-vulnerable.js');

console.log(`Found ${findings.length} vulnerabilities:\n`);

findings.forEach(finding => {
  console.log(`[${finding.severity.toUpperCase()}] ${finding.title}`);
  console.log(`  Line ${finding.line}: ${finding.codeSnippet.trim()}`);
  console.log(`  Fix: ${finding.recommendation}\n`);
});
```

Run it:

```bash
node test-scan.js
```

### 3. Test as MCP Server

Start the MCP server:

```bash
npm start
```

The server will run on stdio and wait for MCP protocol messages.

### 4. Add to Claude Desktop

Add to your Claude config file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "security-scanner": {
      "command": "node",
      "args": [
        "D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/security-scanner/dist/mcp-server.js"
      ]
    }
  }
}
```

Or use npx (after publishing):

```json
{
  "mcpServers": {
    "security-scanner": {
      "command": "npx",
      "args": ["-y", "@j0kz/security-scanner-mcp"]
    }
  }
}
```

### 5. Test MCP Tools in Claude

Once configured, you can ask Claude:

> "Scan the file D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/security-scanner/test-vulnerable.js for security vulnerabilities"

Or:

> "Generate a security report for my project at D:/path/to/your/project"

## Available MCP Tools

1. **scan_file** - Scan a single file
2. **scan_project** - Scan entire project directory
3. **scan_secrets** - Specifically scan for secrets
4. **scan_vulnerabilities** - Scan for specific vulnerability types
5. **generate_security_report** - Generate markdown report

## Expected Output

When scanning the test file above, you should find:

- 🔴 **3 CRITICAL**: AWS key, API key, Password
- 🔴 **1 CRITICAL**: SQL injection vulnerability
- 🟠 **2 HIGH**: XSS via innerHTML and eval
- 🟡 **1 MEDIUM**: Weak cryptography (MD5)

## Security Score

The scanner calculates a security score (0-100):

- Critical: -10 points each
- High: -5 points each
- Medium: -2 points each
- Low: -1 point each

With the vulnerabilities above:

- Criticals: 4 × -10 = -40
- Highs: 2 × -5 = -10
- Mediums: 1 × -2 = -2
- **Total: 100 - 52 = 48/100** (needs improvement!)

## Scan Configuration

Customize scanning behavior:

```javascript
import { scanProject } from './dist/index.js';

const config = {
  scanSecrets: true,
  scanSQLInjection: true,
  scanXSS: true,
  scanOWASP: true,
  scanDependencies: true,
  minSeverity: 'medium',
  excludePatterns: ['node_modules', '.git', 'dist', 'test'],
  maxFileSize: 1048576, // 1MB
  verbose: true,
};

const results = await scanProject('./your-project', config);
console.log(`Security Score: ${results.securityScore}/100`);
```

## Publishing to npm

When ready to publish:

```bash
# Login to npm
npm login

# Publish the package
npm publish --access public
```

## Next Steps

1. ✅ Test the scanner on real projects
2. ✅ Customize secret patterns for your use case
3. ✅ Integrate into CI/CD pipeline
4. ✅ Generate security reports regularly
5. ✅ Train your team on findings

## Troubleshooting

### "Module not found" errors

Make sure you've built the project:

```bash
npm run build
```

### Permission errors on Windows

Run as administrator or check file permissions.

### MCP server not connecting

1. Check Claude config file syntax (must be valid JSON)
2. Verify file paths are absolute
3. Restart Claude Desktop after config changes
4. Check Claude logs for errors

## Features Implemented

✅ Secret detection (9 default patterns)
✅ SQL injection detection
✅ XSS vulnerability detection
✅ OWASP Top 10 checks
✅ Weak cryptography detection
✅ Path traversal detection
✅ Insecure deserialization detection
✅ Dependency vulnerability scanning
✅ Custom pattern support
✅ Security report generation
✅ MCP server integration
✅ Full TypeScript support
✅ Production-ready error handling

## Support

For issues or questions, check the README.md or open an issue on GitHub.

---

**Happy Security Scanning!** 🔒
