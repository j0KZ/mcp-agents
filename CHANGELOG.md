# Changelog

All notable changes to this project will be documented in this file.

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
