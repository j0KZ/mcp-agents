# Release Notes - v1.0.15

**Release Date:** October 3, 2025

## 🎉 Major Release Highlights

Version 1.0.15 represents a significant milestone in the maturity and security of the @j0kz MCP Development Toolkit. This release focuses on hardening security, improving user experience, and providing comprehensive documentation to make the toolkit production-ready.

## 🔒 Security Improvements

### ReDoS Vulnerability Fixes

All Regular Expression Denial of Service (ReDoS) vulnerabilities have been resolved across the toolkit:

- **test-generator**: Added line length validation (1000 char limit) and bounded quantifiers `{0,500}` to prevent regex backtracking
- **refactor-assistant**: Implemented bounded quantifiers `{0,200}` and input validation with 100KB code size limits
- **Enhanced Input Validation**: All packages now validate input size, format, and content before processing

### Security Best Practices

- Path traversal validation in all file operations
- Maximum file size limits (1MB for most operations)
- Structured error codes that don't expose sensitive information
- Comprehensive input sanitization

## 📚 Documentation & Examples

### New Examples Directory

Created comprehensive example files for all 8 tools (19 files total):

```
examples/
├── README.md                          # Examples hub
├── test-generator/
│   ├── README.md                      # Test generation examples
│   └── calculator.js                  # Sample code with tests
├── api-designer/
│   ├── README.md                      # API design examples
│   └── user-api-requirements.txt     # Sample requirements
├── db-schema/
│   ├── README.md                      # Schema design examples
│   └── ecommerce-requirements.txt    # E-commerce schema
├── refactor-assistant/
│   ├── README.md                      # Refactoring examples
│   └── legacy-code.js                # Legacy code to refactor
├── security-scanner/
│   ├── README.md                      # Security scanning examples
│   └── vulnerable-app.js             # Sample vulnerable code
├── smart-reviewer/
│   ├── README.md                      # Code review examples
│   └── pull-request.js               # PR code to review
├── doc-generator/
│   └── README.md                      # Documentation examples
├── architecture-analyzer/
│   └── README.md                      # Architecture examples
└── tutorials/
    ├── 01-getting-started.md         # Getting started guide
    ├── 02-common-workflows.md        # Common usage patterns
    ├── 03-advanced-usage.md          # Advanced techniques
    └── 04-best-practices.md          # Best practices guide
```

### Tutorial Series

Four comprehensive tutorials covering:

1. **Getting Started** - First steps with the toolkit
2. **Common Workflows** - Real-world usage patterns
3. **Advanced Usage** - Power user techniques
4. **Best Practices** - Tips for optimal results

## ⚡ Performance Benchmarking

### New Benchmarking Infrastructure

Added performance benchmarking using Benchmark.js:

```
benchmarks/
├── README.md                          # Benchmarking guide
├── package.json                       # Benchmark dependencies
├── test-generator/
│   └── bench.js                       # Test generation benchmarks
└── test-data/
    ├── small.js                       # Small test files
    ├── medium.js                      # Medium test files
    └── large.js                       # Large test files
```

Performance targets:

- Small files (< 100 LOC): > 100 ops/sec
- Medium files (100-500 LOC): > 50 ops/sec
- Large files (500-1000 LOC): > 10 ops/sec

## 🎯 Improved Error Handling

### Structured Error Codes

All tools now use structured error codes with actionable messages:

#### test-generator Error Codes

- `TEST_GEN_001`: Invalid file path
- `TEST_GEN_002`: Unsupported framework
- `TEST_GEN_003`: File not found
- `TEST_GEN_004`: Permission denied
- `TEST_GEN_005`: Failed to read file
- `TEST_GEN_006`: Empty file
- `TEST_GEN_007`: File too large
- `TEST_GEN_008`: No testable code found

#### refactor-assistant Error Codes

- `REFACTOR_001`: Invalid code input
- `REFACTOR_002`: Code too large
- `REFACTOR_003`: Invalid function name
- `REFACTOR_004`: Invalid identifier characters
- `REFACTOR_005`: Invalid line range
- `REFACTOR_006`: Line range out of bounds

### Better User Experience

- Clear, actionable error messages
- Specific suggestions for fixing issues
- Detailed context (file sizes, valid ranges, etc.)
- No stack traces exposed to end users

## 🔧 Shared Utilities

### New Validation Module

Created `packages/shared/src/validation.ts` with reusable validation functions:

- `validateFilePathInput()` - File path validation with security checks
- `validateFileContent()` - Content validation with size limits
- `validateIdentifier()` - JavaScript/TypeScript identifier validation
- `validateLineRange()` - Line number range validation
- `validateEnum()` - Enum value validation
- `validatePercentage()` - Percentage value validation
- `looksLikeCode()` - Heuristic code detection
- `sanitizeErrorMessage()` - Safe error message sanitization
- `createError()` - Structured error object creation

## 📦 Package Updates

### Unified Versioning

All packages updated to v1.0.15 for consistency:

| Package                         | Previous Version | New Version |
| ------------------------------- | ---------------- | ----------- |
| @j0kz/api-designer-mcp          | 1.0.11           | **1.0.15**  |
| @j0kz/architecture-analyzer-mcp | 1.0.11           | **1.0.15**  |
| @j0kz/db-schema-mcp             | 1.0.11           | **1.0.15**  |
| @j0kz/doc-generator-mcp         | 1.0.11           | **1.0.15**  |
| @j0kz/refactor-assistant-mcp    | 1.0.12           | **1.0.15**  |
| @j0kz/security-scanner-mcp      | 1.0.11           | **1.0.15**  |
| @j0kz/shared                    | 1.0.11           | **1.0.15**  |
| @j0kz/smart-reviewer-mcp        | 1.0.11           | **1.0.15**  |
| @j0kz/test-generator-mcp        | 1.0.13           | **1.0.15**  |

### Updated Documentation

All package READMEs now include:

- Version 1.0.15 badge
- "What's New in v1.0.15" section
- Links to examples and tutorials
- Updated installation instructions

## 🚀 Installation

All packages are now available on npm:

```bash
# Install all 8 tools at once
curl -fsSL https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.sh | bash

# Or install individually
npm install -g @j0kz/test-generator-mcp
npm install -g @j0kz/refactor-assistant-mcp
npm install -g @j0kz/api-designer-mcp
npm install -g @j0kz/db-schema-mcp
npm install -g @j0kz/security-scanner-mcp
npm install -g @j0kz/smart-reviewer-mcp
npm install -g @j0kz/doc-generator-mcp
npm install -g @j0kz/architecture-analyzer-mcp
```

## 🔗 Links

- **GitHub Repository**: https://github.com/j0KZ/mcp-agents
- **npm Profile**: https://www.npmjs.com/~j0kz
- **Examples**: https://github.com/j0KZ/mcp-agents/tree/main/examples
- **Tutorials**: https://github.com/j0KZ/mcp-agents/tree/main/examples/tutorials

## 🙏 Acknowledgments

Special thanks to:

- CodeQL security analysis for identifying vulnerabilities
- The Model Context Protocol community
- All users who provided feedback and bug reports

## 📋 Full Changelog

See [CHANGELOG.md](CHANGELOG.md#1015---2025-01-03) for detailed changes.

---

**This release is production-ready and recommended for all users.**
