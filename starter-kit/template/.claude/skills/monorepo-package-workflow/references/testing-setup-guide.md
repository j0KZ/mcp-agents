# Testing Setup Guide

## Vitest Configuration

### Basic vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'dist/**',
        'tests/**',
        '*.config.ts',
        'src/mcp-server.ts' // Thin layer, test logic instead
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
});
```

## Test Structure

### Directory Layout
```
tests/
├── main-logic.test.ts       # Core logic tests
├── helpers/
│   ├── analyzer.test.ts     # Helper function tests
│   └── validator.test.ts
├── constants/
│   └── patterns.test.ts     # Pattern validation
├── integration/
│   └── mcp-server.test.ts   # Integration tests
└── fixtures/                # Test data
    ├── valid-input.json
    ├── invalid-input.json
    └── sample-code.ts
```

## Test Patterns

### Basic Unit Test

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeCode } from '../src/helpers/analyzer.js';

describe('Code Analyzer', () => {
  describe('analyzeCode', () => {
    it('should analyze valid TypeScript code', async () => {
      const code = 'const x = 5;';
      const result = await analyzeCode(code);

      expect(result.success).toBe(true);
      expect(result.metrics).toBeDefined();
      expect(result.metrics.complexity).toBeLessThan(10);
    });

    it('should handle empty input', async () => {
      const result = await analyzeCode('');

      expect(result.success).toBe(true);
      expect(result.metrics.linesOfCode).toBe(0);
    });

    it('should detect high complexity', async () => {
      const complexCode = generateComplexCode();
      const result = await analyzeCode(complexCode);

      expect(result.warnings).toContain('High complexity detected');
      expect(result.metrics.complexity).toBeGreaterThan(50);
    });
  });
});
```

### Testing with Mocks

```typescript
import { vi } from 'vitest';
import { FileSystemManager } from '@j0kz/shared';

// Mock shared utilities
vi.mock('@j0kz/shared', () => ({
  FileSystemManager: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    fileExists: vi.fn()
  },
  AnalysisCache: {
    get: vi.fn(),
    set: vi.fn()
  }
}));

describe('Main Logic with Mocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use cache when available', async () => {
    // Setup
    const cachedData = { result: 'cached' };
    AnalysisCache.get.mockResolvedValue(cachedData);

    // Execute
    const result = await handleAnalysis({ filePath: 'test.ts' });

    // Verify
    expect(AnalysisCache.get).toHaveBeenCalledWith('analysis:test.ts');
    expect(result.data).toBe(cachedData);
    expect(FileSystemManager.readFile).not.toHaveBeenCalled();
  });

  it('should read file when cache miss', async () => {
    // Setup
    AnalysisCache.get.mockResolvedValue(null);
    FileSystemManager.readFile.mockResolvedValue('file content');

    // Execute
    const result = await handleAnalysis({ filePath: 'test.ts' });

    // Verify
    expect(FileSystemManager.readFile).toHaveBeenCalledWith('test.ts');
    expect(AnalysisCache.set).toHaveBeenCalled();
  });
});
```

### Testing Error Handling

```typescript
describe('Error Handling', () => {
  it('should handle file not found gracefully', async () => {
    FileSystemManager.readFile.mockRejectedValue(
      new Error('ENOENT: no such file')
    );

    const result = await handleAnalysis({ filePath: 'missing.ts' });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('File not found');
    expect(result.errors).toHaveLength(1);
  });

  it('should validate input paths', async () => {
    const maliciousPath = '../../../etc/passwd';

    const result = await handleAnalysis({ filePath: maliciousPath });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatch(/invalid.*path/i);
  });

  it('should handle timeout', async () => {
    // Simulate slow operation
    const slowPromise = new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });

    FileSystemManager.readFile.mockReturnValue(slowPromise);

    const result = await handleAnalysis(
      { filePath: 'test.ts' },
      { timeout: 100 }
    );

    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatch(/timeout/i);
  });
});
```

### Testing Async Operations

```typescript
describe('Async Operations', () => {
  it('should process files in parallel', async () => {
    const files = ['file1.ts', 'file2.ts', 'file3.ts'];

    const startTime = Date.now();
    const results = await Promise.all(
      files.map(f => handleAnalysis({ filePath: f }))
    );
    const duration = Date.now() - startTime;

    expect(results).toHaveLength(3);
    expect(results.every(r => r.success)).toBe(true);
    expect(duration).toBeLessThan(1000); // Should be parallel
  });

  it('should handle promise rejection', async () => {
    const promise = analyzeWithTimeout('test.ts', 100);

    await expect(promise).rejects.toThrow('Operation timed out');
  });
});
```

### Table-Driven Tests

```typescript
describe('Configuration Validation', () => {
  it.each([
    ['strict', true, 50],
    ['moderate', true, 70],
    ['lenient', false, 100],
  ])(
    'should handle %s severity (metrics: %s, threshold: %d)',
    async (severity, includeMetrics, threshold) => {
      const result = await handleAnalysis({
        filePath: 'test.ts',
        config: { severity, includeMetrics }
      });

      expect(result.success).toBe(true);
      if (includeMetrics) {
        expect(result.data.metrics).toBeDefined();
      }
      expect(result.data.threshold).toBe(threshold);
    }
  );
});
```

### Snapshot Testing

```typescript
describe('Output Formatting', () => {
  it('should match expected output format', () => {
    const input = {
      issues: [
        { line: 10, message: 'Missing semicolon' },
        { line: 25, message: 'Unused variable' }
      ]
    };

    const formatted = formatOutput(input);

    expect(formatted).toMatchSnapshot();
  });

  it('should generate consistent reports', () => {
    const report = generateReport(analysisData);

    expect(report).toMatchInlineSnapshot(`
      "Analysis Report
      ===============
      Files: 5
      Issues: 12
      Coverage: 85%"
    `);
  });
});
```

## Coverage Goals

### Target Coverage by File Type

| File Type | Target | Notes |
|-----------|--------|-------|
| Core Logic | 85% | Critical functionality |
| Helpers | 80% | Business logic |
| Utils | 75% | Utility functions |
| Constants | 60% | Configuration values |
| MCP Server | 50% | Thin layer, test delegation |

### Running Coverage

```bash
# Run with coverage
npm run test:coverage

# Generate HTML report
npm run test:coverage -- --reporter=html

# Check thresholds
npm run test:coverage:check
```

### Coverage Output Example

```
---------------|---------|----------|---------|---------|
File           | % Stmts | % Branch | % Funcs | % Lines |
---------------|---------|----------|---------|---------|
All files      |   82.45 |    76.23 |   79.31 |   82.45 |
 main-logic.ts |   91.23 |    85.71 |   88.89 |   91.23 |
 analyzer.ts   |   88.46 |    81.25 |   85.71 |   88.46 |
 validator.ts  |   75.00 |    70.00 |   75.00 |   75.00 |
 constants.ts  |   65.00 |      100 |     100 |   65.00 |
---------------|---------|----------|---------|---------|
```

## Test Commands

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ci": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:coverage:check": "vitest run --coverage --threshold",
    "test:ui": "vitest --ui"
  }
}
```

### Common Commands

```bash
# Run all tests (watch mode)
npm test

# Run once (CI mode)
npm run test:ci

# Run specific file
npm test main-logic

# Run with coverage
npm run test:coverage

# Debug specific test
npm test -- --grep "should handle timeout"

# Update snapshots
npm test -- -u
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Tests
  run: npm run test:ci

- name: Coverage Report
  run: npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/coverage-final.json
```

## Best Practices

### 1. Test Behavior, Not Implementation
```typescript
// ❌ Bad: Testing internals
expect(analyzer._cache.size).toBe(1);

// ✅ Good: Testing behavior
const result1 = await analyze('file.ts');
const result2 = await analyze('file.ts');
expect(result2.cached).toBe(true);
```

### 2. Clear Test Names
```typescript
// ❌ Bad: Vague
it('should work', () => {});

// ✅ Good: Descriptive
it('should return cached result when analyzing same file twice', () => {});
```

### 3. Arrange-Act-Assert
```typescript
it('should detect security issues', async () => {
  // Arrange
  const codeWithIssue = `
    const query = \`SELECT * FROM users WHERE id = \${userId}\`;
  `;

  // Act
  const result = await scanSecurity(codeWithIssue);

  // Assert
  expect(result.issues).toHaveLength(1);
  expect(result.issues[0].type).toBe('sql-injection');
});
```

### 4. Isolate Tests
```typescript
beforeEach(() => {
  // Reset state
  vi.clearAllMocks();
  cache.clear();
});

afterEach(() => {
  // Cleanup
  vi.restoreAllMocks();
});
```