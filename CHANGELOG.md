# Changelog

All notable changes to this project will be documented in this file.

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
