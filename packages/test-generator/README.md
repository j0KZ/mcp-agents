# @j0kz/test-generator-mcp

**Automated comprehensive test generation with edge cases and coverage analysis.**

[![NPM Version](https://img.shields.io/npm/v/@j0kz/test-generator-mcp)](https://www.npmjs.com/package/@j0kz/test-generator-mcp)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

Part of the [@j0kz MCP Agents](https://github.com/j0kz/mcp-agents) collection.

---

## ✨ Features

- 🧪 **Comprehensive Test Generation** - Unit, integration, and end-to-end tests
- 🎯 **Edge Case Detection** - Automatically identifies and tests boundary conditions
- 📊 **Coverage Analysis** - Estimates test coverage before running tests
- 🔧 **Multi-Framework Support** - Jest, Vitest, Mocha, AVA
- ⚡ **Smart Mocking** - Generates appropriate mocks and stubs
- 🎨 **Custom Test Patterns** - Learns your testing style

---

## 🚀 Quick Start

### Claude Code

```bash
# Install globally (recommended)
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user

# Verify installation
claude mcp list
```

### Cursor

Add to `~/.cursor/mcp_config.json`:

```json
{
  "mcpServers": {
    "test-generator": {
      "command": "npx",
      "args": ["@j0kz/test-generator-mcp"]
    }
  }
}
```

### Windsurf

Add to Windsurf settings:

```json
{
  "mcp": {
    "servers": {
      "test-generator": {
        "command": "npx @j0kz/test-generator-mcp"
      }
    }
  }
}
```

### Roo Code / Continue / Other MCP Editors

See [full compatibility guide](https://github.com/j0kz/mcp-agents/blob/main/EDITOR_COMPATIBILITY.md).

---

## 🎯 Usage

Once installed, use through your AI editor's chat:

### Generate Tests for a File
```
"Generate unit tests for src/utils.js"
"Create test cases for this function"
"Generate tests with edge cases for the auth module"
```

### Framework-Specific
```
"Generate Jest tests for src/api.js"
"Create Vitest tests with 90% coverage"
"Generate Mocha tests for the database layer"
```

### Advanced Generation
```
"Generate integration tests for the entire auth flow"
"Create tests for all edge cases and error scenarios"
"Generate E2E tests for the checkout process"
```

---

## 🛠️ Available MCP Tools

### `mcp__test-generator__generate_tests`

Generate comprehensive test suite for a source file.

**Parameters:**
- `sourceFile` (required): Path to source file
- `config` (optional): Test generation configuration
  - `framework`: "jest" | "mocha" | "vitest" | "ava" (default: "jest")
  - `coverage`: Target coverage percentage (default: 80)
  - `includeEdgeCases`: boolean (default: true)
  - `includeErrorCases`: boolean (default: true)

**Example:**
```typescript
{
  "sourceFile": "src/utils.js",
  "config": {
    "framework": "jest",
    "coverage": 90,
    "includeEdgeCases": true
  }
}
```

### `mcp__test-generator__write_test_file`

Generate tests and write directly to a test file.

**Parameters:**
- `sourceFile` (required): Path to source file
- `testFile` (optional): Output path (auto-generated if not provided)
- `config` (optional): Same as generate_tests

**Example:**
```typescript
{
  "sourceFile": "src/api.js",
  "testFile": "tests/api.test.js",
  "config": {
    "framework": "vitest",
    "coverage": 95
  }
}
```

### `mcp__test-generator__batch_generate`

Generate tests for multiple files at once.

**Parameters:**
- `sourceFiles` (required): Array of source file paths
- `config` (optional): Same as generate_tests

**Example:**
```typescript
{
  "sourceFiles": [
    "src/utils.js",
    "src/api.js",
    "src/auth.js"
  ],
  "config": {
    "framework": "jest",
    "includeEdgeCases": true
  }
}
```

---

## ⚙️ Configuration

### Test Frameworks

**Jest (default):**
```json
{
  "framework": "jest",
  "coverage": 80
}
```

**Vitest:**
```json
{
  "framework": "vitest",
  "coverage": 90
}
```

**Mocha:**
```json
{
  "framework": "mocha",
  "coverage": 85
}
```

**AVA:**
```json
{
  "framework": "ava",
  "coverage": 80
}
```

### Custom Configuration

Create `.test-generator.json` in your project root:

```json
{
  "framework": "jest",
  "coverage": 90,
  "includeEdgeCases": true,
  "includeErrorCases": true,
  "testPattern": "**/*.test.js",
  "mockStrategy": "auto",
  "assertions": {
    "style": "expect",
    "strict": true
  },
  "timeout": 5000,
  "exclude": [
    "**/*.spec.js",
    "dist/**",
    "node_modules/**"
  ]
}
```

---

## 📊 What Gets Generated

### Unit Tests
- Function behavior validation
- Input/output verification
- Type checking
- Return value assertions

### Edge Cases
- Boundary conditions (0, 1, max values)
- Null/undefined handling
- Empty arrays/objects
- Special characters
- Large datasets

### Error Cases
- Invalid inputs
- Type errors
- Async failures
- Exception handling
- Timeout scenarios

### Integration Tests
- Module interactions
- API calls
- Database operations
- External dependencies

### Test Structure
```javascript
describe('Component/Function Name', () => {
  describe('Happy Path', () => {
    it('should handle normal input correctly', () => {
      // test implementation
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {});
    it('should handle null/undefined', () => {});
    it('should handle boundary values', () => {});
  });

  describe('Error Cases', () => {
    it('should throw error for invalid input', () => {});
    it('should handle async errors', () => {});
  });
});
```

---

## 🎯 Coverage Targets

- **80%** - Good baseline for most projects
- **90%** - High quality, recommended for libraries
- **95%+** - Critical systems, production code

The tool estimates coverage based on:
- Lines covered by generated tests
- Branches tested
- Functions exercised
- Edge cases handled

---

## 🔧 Troubleshooting

### Tests Not Generated

```bash
# Verify package is working
npx @j0kz/test-generator-mcp --version

# Check Node.js version
node --version

# Test directly
npx @modelcontextprotocol/inspector npx @j0kz/test-generator-mcp
```

### Framework Not Detected

- Specify framework explicitly in config
- Ensure framework is installed in your project
- Check package.json for test script

### Coverage Too Low

- Increase `coverage` setting
- Enable `includeEdgeCases` and `includeErrorCases`
- Generate additional integration tests

---

## 📦 Related Packages

Part of the @j0kz MCP Agents suite:

- **[@j0kz/smart-reviewer-mcp](https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp)** - AI-powered code review
- **[@j0kz/architecture-analyzer-mcp](https://www.npmjs.com/package/@j0kz/architecture-analyzer-mcp)** - Architecture analysis

Install all at once:
```bash
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user
claude mcp add architecture-analyzer "npx @j0kz/architecture-analyzer-mcp" --scope user
```

---

## 🤝 Contributing

Contributions welcome! Please visit the [main repository](https://github.com/j0kz/mcp-agents).

---

## 📝 License

MIT © [j0kz](https://www.npmjs.com/~j0kz)

---

## 🔗 Links

- **NPM Package**: https://www.npmjs.com/package/@j0kz/test-generator-mcp
- **GitHub**: https://github.com/j0kz/mcp-agents
- **Issues**: https://github.com/j0kz/mcp-agents/issues
- **All Packages**: https://www.npmjs.com/~j0kz
- **MCP Specification**: https://modelcontextprotocol.io/
