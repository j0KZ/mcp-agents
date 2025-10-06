# Advanced Usage

Take your MCP Agent skills to the next level with advanced techniques and integrations.

## Custom Configuration

### Test Generator Advanced Config

```javascript
// .testgenrc.js
export default {
  framework: 'vitest',
  coverage: 95,
  includeEdgeCases: true,
  includeErrorCases: true,
  mockingStrategy: 'auto',
  naming: {
    testFiles: '{name}.test.{ext}',
    describe: 'should {action}',
  },
  setup: {
    beforeEach: true,
    afterEach: true,
    fixtures: './test/fixtures',
  },
};
```

### Smart Reviewer Custom Rules

```javascript
// .reviewrc.js
export default {
  rules: {
    // Custom rule: All database operations must use transactions
    'require-transactions': {
      pattern: /db\.(insert|update|delete)/,
      message: 'Database operations must use transactions',
      severity: 'error',
    },

    // Custom rule: Async functions must have try/catch
    'async-error-handling': {
      check: node => {
        return node.async && !hasTryCatch(node);
      },
      message: 'Async functions must handle errors',
      severity: 'warning',
    },
  },

  ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.js'],

  severity: {
    security: 'error',
    performance: 'warning',
    style: 'info',
  },
};
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/mcp-tools.yml
name: MCP Tools

on: [push, pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Security Scanner
        run: npm install -g @j0kz/security-scanner-mcp

      - name: Scan for vulnerabilities
        run: |
          security-scanner-mcp scan src/ --format json > security-report.json

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: security-report.json

      - name: Fail on critical issues
        run: |
          CRITICAL=$(cat security-report.json | jq '.critical')
          if [ "$CRITICAL" -gt 0 ]; then
            echo "Found $CRITICAL critical security issues"
            exit 1
          fi

  code-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Smart Reviewer
        run: npm install -g @j0kz/smart-reviewer-mcp

      - name: Review PR
        run: |
          smart-reviewer-mcp review --pr ${{ github.event.pull_request.number }}

  test-generation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Test Generator
        run: npm install -g @j0kz/test-generator-mcp

      - name: Verify test coverage
        run: |
          test-generator-mcp analyze src/ --coverage-threshold 80
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Running security scan..."
security-scanner-mcp scan $(git diff --cached --name-only --diff-filter=ACM | grep '\.js$')

if [ $? -ne 0 ]; then
  echo "Security issues found. Commit aborted."
  exit 1
fi

echo "Running code review..."
smart-reviewer-mcp review $(git diff --cached --name-only)

echo "All checks passed!"
```

## Programmatic API Usage

### Using as Node.js Library

```javascript
import { TestGenerator } from '@j0kz/test-generator-mcp';

const generator = new TestGenerator({
  framework: 'vitest',
  coverage: 90,
});

// Generate tests
const tests = await generator.generateTests('src/calculator.js');
console.log(tests);

// Write to file
await generator.writeTestFile('src/calculator.js', 'src/calculator.test.js');
```

### Batch Processing

```javascript
import { SecurityScanner } from '@j0kz/security-scanner-mcp';
import { glob } from 'glob';

const scanner = new SecurityScanner();

// Scan all files
const files = await glob('src/**/*.js');
const results = await Promise.all(files.map(file => scanner.scanFile(file)));

// Generate report
const report = scanner.generateReport(results);
await fs.writeFile('security-report.md', report);
```

## Advanced Patterns

### Pattern 1: Automated Refactoring Pipeline

```javascript
// refactor-pipeline.js
import { RefactorAssistant } from '@j0kz/refactor-assistant-mcp';
import { TestGenerator } from '@j0kz/test-generator-mcp';
import { SmartReviewer } from '@j0kz/smart-reviewer-mcp';

async function refactorPipeline(file) {
  const refactor = new RefactorAssistant();
  const testGen = new TestGenerator();
  const reviewer = new SmartReviewer();

  // 1. Generate tests for original code
  console.log('Generating baseline tests...');
  const originalTests = await testGen.generateTests(file);

  // 2. Perform refactoring
  console.log('Refactoring code...');
  const refactored = await refactor.convertToAsync(file);
  const simplified = await refactor.simplifyConditionals(refactored);

  // 3. Run original tests against new code
  console.log('Verifying behavior...');
  const testResults = await runTests(originalTests, simplified);

  if (!testResults.passed) {
    throw new Error('Refactoring changed behavior!');
  }

  // 4. Code review
  console.log('Reviewing changes...');
  const review = await reviewer.reviewDiff(file, simplified);

  // 5. Generate additional tests for edge cases
  console.log('Adding edge case tests...');
  const edgeTests = await testGen.generateTests(simplified, {
    includeEdgeCases: true,
  });

  return {
    code: simplified,
    tests: [...originalTests, ...edgeTests],
    review,
  };
}
```

### Pattern 2: API-First Development Automation

```javascript
// api-first.js
import { APIDesigner } from '@j0kz/api-designer-mcp';
import { DBSchema } from '@j0kz/db-schema-mcp';
import { DocGenerator } from '@j0kz/doc-generator-mcp';

async function apiFirst(requirements) {
  const api = new APIDesigner();
  const db = new DBSchema();
  const docs = new DocGenerator();

  // 1. Design API from requirements
  const endpoints = await api.designRESTAPI(requirements);

  // 2. Generate OpenAPI spec
  const spec = await api.generateOpenAPI(endpoints);

  // 3. Design database schema
  const schema = await db.designFromAPI(spec);

  // 4. Generate client SDKs
  const tsClient = await api.generateClient(spec, {
    language: 'typescript',
    outputFormat: 'axios',
  });

  const pyClient = await api.generateClient(spec, {
    language: 'python',
    outputFormat: 'requests',
  });

  // 5. Generate documentation
  const apiDocs = await docs.generateAPIDocs(spec);
  const dbDocs = await docs.generateSchemaDocs(schema);

  // 6. Generate mock server
  const mockServer = await api.generateMockServer(spec);

  return {
    spec,
    schema,
    clients: { typescript: tsClient, python: pyClient },
    docs: { api: apiDocs, database: dbDocs },
    mockServer,
  };
}
```

### Pattern 3: Security-Hardened Development

```javascript
// secure-dev.js
import { SecurityScanner } from '@j0kz/security-scanner-mcp';
import { RefactorAssistant } from '@j0kz/refactor-assistant-mcp';

async function secureCode(file) {
  const scanner = new SecurityScanner();
  const refactor = new RefactorAssistant();

  // 1. Initial scan
  const vulnerabilities = await scanner.scanFile(file);

  // 2. Auto-fix common issues
  let code = await fs.readFile(file, 'utf8');

  for (const vuln of vulnerabilities) {
    if (vuln.autoFixable) {
      code = await refactor.applyFix(code, vuln.fix);
    }
  }

  // 3. Rescan to verify fixes
  const recheck = await scanner.scanCode(code);

  // 4. Generate security tests
  const testGen = new TestGenerator();
  const securityTests = await testGen.generateSecurityTests(code, recheck);

  return {
    code,
    remaining: recheck.filter(v => !v.fixed),
    tests: securityTests,
  };
}
```

## Performance Optimization

### Parallel Processing

```javascript
import pLimit from 'p-limit';

const limit = pLimit(10); // Max 10 concurrent operations

const files = await glob('src/**/*.js');
const results = await Promise.all(files.map(file => limit(() => scanner.scanFile(file))));
```

### Caching Results

```javascript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

async function cachedScan(file) {
  const hash = await getFileHash(file);

  if (cache.has(hash)) {
    return cache.get(hash);
  }

  const result = await scanner.scanFile(file);
  cache.set(hash, result);
  return result;
}
```

## Integration with IDEs

### VSCode Extension Example

```javascript
// extension.js
import * as vscode from 'vscode';
import { SmartReviewer } from '@j0kz/smart-reviewer-mcp';

export function activate(context) {
  const reviewer = new SmartReviewer();

  // Command: Review current file
  const reviewCommand = vscode.commands.registerCommand('mcp.reviewFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    const code = document.getText();

    const review = await reviewer.reviewCode(code);

    // Show results in panel
    const panel = vscode.window.createWebviewPanel(
      'codeReview',
      'Code Review',
      vscode.ViewColumn.Beside,
      {}
    );

    panel.webview.html = formatReview(review);
  });

  context.subscriptions.push(reviewCommand);
}
```

## Custom Tool Development

### Creating Your Own MCP Tool

```javascript
// my-custom-tool/index.js
import { MCPServer } from '@modelcontextprotocol/sdk';

export class MyCustomTool {
  constructor() {
    this.server = new MCPServer({
      name: 'my-custom-tool',
      version: '1.0.0',
    });

    this.registerTools();
  }

  registerTools() {
    this.server.tool(
      'my_function',
      {
        description: 'Does something cool',
        parameters: {
          input: {
            type: 'string',
            description: 'Input data',
          },
        },
      },
      async params => {
        // Your logic here
        return {
          result: processInput(params.input),
        };
      }
    );
  }

  start() {
    this.server.start();
  }
}
```

## Next Steps

- ✨ Master [Best Practices](./04-best-practices.md)
- 📖 Read individual tool documentation
- 🔧 Contribute to the project
