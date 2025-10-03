# Changelog

All notable changes to this project will be documented in this file.

## [1.0.17] - 2025-10-03

### Refactored
- **api-designer**: Major complexity reduction
  - Reduced cyclomatic complexity from 114 → 38 (67% reduction)
  - Reduced lines of code from 733 → 264 (64% reduction)
  - Reduced duplicate code blocks from 39 → 6 (85% reduction)
  - Extracted specialized modules for better maintainability:
    - `generators/client-generator.ts` - API client code generation (151 LOC)
    - `generators/mock-server-generator.ts` - Mock server generation (145 LOC)
    - `validators/api-validator.ts` - API validation logic (94 LOC)
  - Maintained 100% backward compatibility with existing tests

- **Smart Reviewer**: Improved accuracy and reduced false positives
  - Enhanced detection logic to skip JSDoc comments and string literals
  - Fixed false positive for console.log in comments and template strings
  - Fixed false positive for empty catch blocks in string replacements

- **Architecture Analyzer**: Better path resolution and metrics
  - Improved TypeScript ES module import resolution (.js → .ts)
  - Enhanced cohesion calculation to be package-aware
  - More accurate dependency scanning

### Added
- **Type Safety**: Added @types/express and @types/cors to api-designer
- **Module Extraction**: New specialized modules follow single-responsibility principle
- **Test Coverage**: All 37 tests passing with zero breaking changes

### Changed
- **All packages updated to v1.0.17** (unified versioning)
  - api-designer: 1.0.16 → 1.0.17
  - smart-reviewer: 1.0.16 → 1.0.17
  - architecture-analyzer: 1.0.16 → 1.0.17
  - refactor-assistant: 1.0.16 → 1.0.17
  - db-schema: 1.0.16 → 1.0.17
  - doc-generator: 1.0.16 → 1.0.17
  - security-scanner: 1.0.16 → 1.0.17
  - test-generator: 1.0.16 → 1.0.17

### Code Quality
- Overall complexity reduction: 31.8% across refactored packages
- Maintainability index improved significantly
- Zero new security vulnerabilities introduced
- All code quality targets met

---

## [1.0.16] - 2025-10-03

### Updated Dependencies
- **@anthropic-ai/sdk**: 0.27.3 → **0.65.0** (Major update)
  - Updated to latest Anthropic SDK with support for new models
  - Added support for Claude Sonnet 4.5 and Opus 4.1
  - New tool capabilities and context management features
  - No breaking changes affecting MCP implementation

- **@modelcontextprotocol/sdk**: 0.5.0 → **1.19.1** (Major update)
  - Latest MCP protocol implementation
  - Improved performance and stability
  - Enhanced type definitions

- **@types/node**: 20.19.18 → **24.6.2** (Major update)
  - Latest Node.js type definitions
  - Improved TypeScript support

- **vitest**: 1.6.1 → **3.2.4** (Major update)
  - **Security Fix**: Resolved moderate vulnerability in esbuild dependency
  - Better performance and test execution
  - Enhanced coverage reporting

- **jest**: 29.7.0 → **30.2.0** (Major update in shared package)
  - Latest Jest testing framework
  - Improved test runner performance

### Improved
- **Test Infrastructure**
  - Added comprehensive `vitest.config.ts` with:
    - 30-second test timeouts (prevents hanging tests)
    - Parallel test execution (4 threads max)
    - v8 coverage provider
    - Performance monitoring
  - Removed deprecated workspace configuration
  - All tests now run successfully with detailed timing

- **Documentation**
  - Enhanced JSDoc comments in `smart-reviewer` analyzer
  - Added comprehensive class and method documentation
  - Included usage examples in JSDoc

### Security
- **Zero vulnerabilities** - All packages audited clean
- Fixed moderate severity issue in vitest/esbuild dependency chain
- Security score: 100/100

### Changed
- **All packages updated to v1.0.16** (unified versioning)
  - api-designer: 1.0.15 → 1.0.16
  - architecture-analyzer: 1.0.15 → 1.0.16
  - db-schema: 1.0.15 → 1.0.16
  - doc-generator: 1.0.15 → 1.0.16
  - refactor-assistant: 1.0.15 → 1.0.16
  - security-scanner: 1.0.15 → 1.0.16
  - shared: 1.0.16 (unchanged)
  - smart-reviewer: 1.0.15 → 1.0.16
  - test-generator: 1.0.15 → 1.0.16

### Testing
- ✅ All tests passing
- ✅ Build verification successful
- ✅ Coverage reports generated

---

## [1.0.15] - 2025-10-03

### Added
- **Comprehensive Examples & Tutorials** (19 files, 3,840+ lines)
  - Tool-specific examples for all 8 MCP tools
  - 4 detailed tutorials: Getting Started, Common Workflows, Advanced Usage, Best Practices
  - Real-world code samples and expected outputs
  - Complete usage documentation

- **Performance Benchmarking Infrastructure**
  - Benchmark.js integration
  - Performance targets for all tools
  - Test data for varying file sizes
  - CI/CD ready for continuous monitoring

- **Improved Error Handling & Validation**
  - Error codes for all error types (TEST_GEN_001, REFACTOR_001, etc.)
  - User-friendly error messages with actionable suggestions
  - Input validation with clear feedback
  - Shared validation utilities in @mcp-tools/shared

### Improved
- **test-generator**: Added comprehensive input validation
  - File path validation
  - Framework validation
  - File size limits (1MB)
  - Empty file detection
  - Better error messages with codes

- **refactor-assistant**: Enhanced error handling
  - Input validation for code and options
  - Function name validation (identifier rules)
  - Line range validation with clear messages
  - Code size limits (100KB)

- **shared package**: New validation utilities
  - `validateFilePathInput()` - Path validation
  - `validateFileContent()` - Content validation
  - `validateIdentifier()` - Variable/function name validation
  - `validateLineRange()` - Line number validation
  - `validateEnum()` - Enum value validation
  - `validatePercentage()` - Percentage validation (0-100)
  - `createError()` - User-friendly error creation

### Changed
- **All packages updated to v1.0.15** (unified versioning)
  - api-designer: 1.0.11 → 1.0.15
  - architecture-analyzer: 1.0.11 → 1.0.15
  - db-schema: 1.0.11 → 1.0.15
  - doc-generator: 1.0.11 → 1.0.15
  - refactor-assistant: 1.0.12 → 1.0.15
  - security-scanner: 1.0.11 → 1.0.15
  - shared: 1.0.11 → 1.0.15
  - smart-reviewer: 1.0.11 → 1.0.15
  - test-generator: 1.0.13 → 1.0.15

### Documentation
- Examples directory with practical use cases
- Tutorial series from beginner to advanced
- Best practices and team guidelines
- Benchmark documentation

## [1.0.14] - 2025-10-03

### Security
- **HIGH**: Fixed ReDoS vulnerability in refactor-assistant import detection
  - Added bounded quantifiers {1,500} and {1,200} to prevent unbounded backtracking
  - Added 1000-character line length validation
  - Location: `packages/refactor-assistant/src/refactorer.ts:695`

### Changed
- refactor-assistant updated to v1.0.12
- test-generator remains at v1.0.13

## [1.0.13] - 2025-10-03

### Security
- **HIGH**: Added input length validation to prevent ReDoS in parser
  - Lines longer than 1000 characters are now skipped during parsing
  - Prevents exponential backtracking from multiple optional regex groups
  - Follows CodeQL recommendation for complex regex patterns
  - Location: `packages/test-generator/src/parser.ts:25,94`

### Changed
- test-generator updated to v1.0.13

## [1.0.12] - 2025-10-03

### Security
- **HIGH**: Fixed final ReDoS vulnerability in test-generator parser
  - Removed optional whitespace quantifiers after `\w+` to prevent backtracking
  - Affected patterns: function and method extraction (lines 25, 91)
  - Location: `packages/test-generator/src/parser.ts`

### Changed
- test-generator updated to v1.0.12

## [1.0.11] - 2025-10-03

### Security
- **HIGH**: Fixed additional ReDoS vulnerabilities in test-generator parser (2 regex patterns)
  - Replaced unbounded quantifiers with bounded {0,500} limits
  - Affected patterns: function extraction and method extraction
  - Location: `packages/test-generator/src/parser.ts:25,91`
- **HIGH**: Fixed additional ReDoS vulnerabilities in security-scanner (2 regex patterns)
  - Added bounded {0,200} quantifiers for deserialization and path traversal patterns
  - Location: `packages/security-scanner/src/scanner.ts:267,295`
- **MEDIUM**: Added explicit permissions to GitHub Actions workflows
  - Added `contents: read` permissions to CI jobs
  - Added `pull-requests: write` to dependency-review job
  - Follows principle of least privilege for workflow security

### Changed
- All packages updated to v1.0.11

## [1.0.10] - 2025-10-03

### Security
- **CRITICAL**: Fixed ReDoS vulnerabilities in refactor-assistant (6 regex patterns)
  - Added 100KB input size limits to prevent denial of service
  - Replaced unbounded quantifiers with length-limited patterns
  - Affected functions: convertToAsync, simplifyConditionals, helper functions
- **HIGH**: Fixed shell command injection in doc-generator
  - Changed from execSync to execFileSync for safe command execution
  - Prevents arbitrary command injection via git parameters
- **MEDIUM**: Fixed prototype pollution in api-designer
  - Added checks for dangerous keys (__proto__, constructor, prototype)
  - Safe property access using hasOwnProperty.call()

### Changed
- All packages updated to v1.0.10

## [1.0.9] - 2025-10-03

### Changed
- Synchronized all package versions to 1.0.9 for consistency
- All 8 packages updated with latest fixes and improvements
- Unified version management across the monorepo

### Package Versions
- api-designer: 1.0.8 → 1.0.9
- refactor-assistant: 1.0.8 → 1.0.9
- smart-reviewer: 1.0.8 → 1.0.9
- architecture-analyzer: 1.0.8 → 1.0.9
- test-generator: 1.0.7 → 1.0.9
- db-schema: 1.0.7 → 1.0.9
- doc-generator: 1.0.7 → 1.0.9
- security-scanner: 1.0.7 → 1.0.9
- shared: 1.0.0 → 1.0.9

## [1.0.8] - 2025-10-03

### Fixed
- **api-designer (v1.0.8)**: Fixed GraphQL SDL generation to output 'type' instead of 'object' for object types
- **api-designer (v1.0.8)**: Fixed test imports to use correct function names (designRESTEndpoints, generateOpenAPI)
- **refactor-assistant (v1.0.8)**: Fixed convertToAsync regex pattern to properly match callback format
- **refactor-assistant (v1.0.8)**: Fixed regex lastIndex reset issue after test()
- All package tests now passing (100% test suite success)

### Changed
- Bumped api-designer from v1.0.7 to v1.0.8
- Bumped refactor-assistant from v1.0.7 to v1.0.8

## [1.0.7] - 2025-10-02

### Security
- **CRITICAL FIX**: Fixed command injection vulnerability in doc-generator changelog generation
  - Sanitized git tag inputs to prevent shell command injection
  - Added input validation for git references (alphanumeric, dots, hyphens, slashes only)
  - Location: `packages/doc-generator/src/generator.ts:577-596`

### Fixed
- Replaced 20,000+ lines of broken auto-generated tests with functional tests
- Fixed test file imports (added `beforeAll`, `afterAll` from vitest)
- Added LICENSE file to shared package
- Fixed TypeScript compilation errors in utils.ts (CodeContext interface)

### Changed
- Optimized .gitignore for npm publishing (included dist/, removed package-lock.json exclusion)
- Created .npmignore to exclude source files and dev tools from npm packages
- Updated all GitHub URLs from j0KZ to j0kz (lowercase) for consistency
- Improved MCP self-detection filters to prevent false positives

### Added
- PUBLISH.md - Complete publishing guide for npm
- Comprehensive test suites for all 8 MCP packages
- Better error messages and validation

### Documentation
- Updated README with corrected GitHub URLs
- Verified all package.json files are npm-ready
- All packages tested and working via MCP interface

## [1.0.6] - 2025-10-01

### Added
- Comprehensive wiki documentation
- Installation scripts for all platforms
- MCP configuration templates

## [1.0.0] - Initial Release

### Added
- 8 MCP tools: Smart Reviewer, Test Generator, Architecture Analyzer, Doc Generator, Security Scanner, Refactor Assistant, API Designer, DB Schema
- Support for Claude Code, Cursor, Windsurf, Roo Code
- Shared utilities package
- MIT License
