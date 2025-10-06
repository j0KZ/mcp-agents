# Release Notes - v1.0.33

**Release Date:** October 6, 2025
**Type:** Security Patch & Quality Improvements

## 🔒 Critical Security Fixes

### Path Traversal Vulnerability Fixed

- **CRITICAL**: Fixed path traversal validation in `path-validator.ts`
- Previously allowed dangerous paths like `/var/../../../etc/passwd`
- Now properly rejects ANY path containing `..` sequences
- Added comprehensive tests against OWASP attack patterns

### Sanitization Improvements

- Fixed null byte handling in filename sanitization
- Properly removes null bytes (`\0`) from filenames
- Prevents injection attacks through malformed filenames

## ✨ New Features

### MCP Protocol Validation Layer

Added comprehensive MCP protocol validation to ensure tool compliance:

```typescript
// New validation capabilities in @j0kz/shared
import { MCPProtocolValidator } from '@j0kz/shared';

const validator = new MCPProtocolValidator();
validator.validateToolSchema(tool); // Validate tool definitions
validator.validateRequest(request); // Validate MCP requests
validator.validateResponse(response); // Validate MCP responses
```

**Features:**

- Schema validation against MCP specification
- Request/response validation with type checking
- Tool registration and tracking
- Parameter type validation (string, number, boolean, array, object)
- Best practice warnings (naming conventions, descriptions)

## 🧪 Testing Improvements

### Test Coverage Increased

- **All tests now passing** (700+ tests)
- Fixed 6 failing tests in doc-generator and shared packages
- Added 36 new tests for MCP validation
- Added 12 new tests for orchestrator MCP server

### New Test Categories

1. **MCP Protocol Tests** - Validate tool schemas and requests
2. **Security Tests** - Path traversal and injection prevention
3. **Integration Tests** - Inter-MCP communication validation
4. **Orchestrator Tests** - Workflow execution and error handling

## 📊 Quality Metrics

### Before v1.0.33

- 6 failing tests
- Security vulnerabilities present
- No MCP protocol validation
- Limited orchestrator test coverage

### After v1.0.33

- ✅ 100% test pass rate
- ✅ Security vulnerabilities patched
- ✅ MCP protocol validation implemented
- ✅ Comprehensive orchestrator testing

## 🔧 Technical Improvements

### Dependencies

- Added `zod@^3.23.8` to shared package for schema validation
- All other dependencies remain stable
- No breaking changes

### Code Organization

- New `packages/shared/src/mcp-protocol/` directory
- Validation logic centralized in shared package
- Improved error handling with specific error codes

## 📝 API Changes

### New Exports from @j0kz/shared

```typescript
export {
  MCPProtocolValidator,
  MCPValidationResult,
  MCPToolDefinition,
  MCPProtocolRequest,
  MCPProtocolResponse,
} from './mcp-protocol/validator.js';
```

### Breaking Changes

- None - All changes are backward compatible

## 🚀 Migration Guide

### For MCP Tool Developers

1. **Validate your tools** using the new validator:

```typescript
import { MCPProtocolValidator } from '@j0kz/shared';

const validator = new MCPProtocolValidator();
const result = validator.validateToolSchema(yourTool);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

2. **Update path handling** to use validated paths:

```typescript
import { validateNoTraversal } from '@j0kz/shared';

// Validate before using any user-provided paths
validateNoTraversal(userPath); // Throws if dangerous
```

### For End Users

- No action required - Update is backward compatible
- Run `npm update` to get security fixes

## 🐛 Bug Fixes

1. **path-validator.ts**
   - Fixed: Path traversal sequences not properly detected
   - Fixed: Null bytes in filenames not sanitized

2. **doc-generator/source-parser.ts**
   - Fixed: Parameter parsing returning undefined
   - Fixed: Acronym preservation in descriptions

3. **orchestrator-mcp**
   - Fixed: Missing test coverage for error scenarios
   - Fixed: Workflow validation edge cases

## 📚 Documentation Updates

- Added `REALISTIC_AUDIT_REPORT.md` - Honest security assessment
- Added `MCP_IMPROVEMENTS.md` - Comprehensive improvement plan
- Updated test documentation with new test categories
- Added MCP protocol validation documentation

## ⚡ Performance

- No performance regressions
- MCP validation adds <1ms overhead per request
- Test suite runs in <3 seconds

## 🔍 Security Notes

**This release fixes critical security vulnerabilities. All users should upgrade immediately.**

The path traversal vulnerability could have allowed attackers to access system files outside the intended directory. This has been completely resolved.

## 📈 Next Steps

### Planned for v1.0.34

- Increase test coverage to 80%
- Add real-world performance benchmarks
- Extract remaining code duplicates
- Implement advanced MCP features

### Long-term Roadmap

- Integration test suite
- Memory profiling
- Advanced MCP state management
- Enterprise features

## 🙏 Acknowledgments

- Security issues identified through comprehensive audit
- MCP protocol validation inspired by best practices
- Test improvements based on coverage analysis

## 📦 Installation

```bash
# Update to latest version
npm update @j0kz/smart-reviewer-mcp@latest
npm update @j0kz/test-generator-mcp@latest
npm update @j0kz/architecture-analyzer-mcp@latest
npm update @j0kz/orchestrator-mcp@latest
# ... update all packages
```

## 🔗 Links

- [GitHub Repository](https://github.com/j0KZ/mcp-agents)
- [NPM Package](https://www.npmjs.com/~j0kz)
- [Security Policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

---

**IMPORTANT:** This is a security release. Update immediately to protect your systems.

_For questions or issues, please open a GitHub issue._
