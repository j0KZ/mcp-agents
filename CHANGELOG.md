# Changelog

All notable changes to this project will be documented in this file.

## [1.0.24] - 2025-10-04

### Fixed
- **Trae Support**: Fixed installer to use correct config path for Trae editor
  - Changed from Cline-style path to `AppData/Roaming/Trae/User/mcp.json`
  - Updated installer v1.0.24 with proper Trae detection
- **Package Corruption**: Removed corrupted `package.json.tmp` files from all packages
  - Fixed npm lockfile errors in smart-reviewer and other packages
  - Republished smart-reviewer v1.0.21 with clean package structure

### Changed
- Installer now properly detects and configures Trae editor
- Cleaned up temporary files across all packages

---

## [1.0.20] - 2025-10-03

### Added
- **🚀 One-Command Installer**: New `@j0kz/mcp-agents` package
  - Install all 8 tools with: `npx @j0kz/mcp-agents`
  - Supports Claude Code, Cursor, and Windsurf
  - Auto-configures MCP settings
  - Built-in cache clearing and troubleshooting
- **📖 Installer Commands**:
  - `npx @j0kz/mcp-agents` - Install for Claude Code
  - `npx @j0kz/mcp-agents cursor` - Install for Cursor
  - `npx @j0kz/mcp-agents windsurf` - Install for Windsurf
  - `npx @j0kz/mcp-agents list` - List all tools
  - `npx @j0kz/mcp-agents clear-cache` - Clear npm cache

### Changed
- Updated README with Quick Install section
- Simplified installation process significantly

---

## [1.0.19] - 2025-10-03

### Fixed
- **Critical**: Rebuilt all packages with correct compiled imports
  - Compiled JavaScript files in `dist/` now correctly import `@j0kz/shared`
  - Fixed remaining `@mcp-tools/shared` references in built files
  - All packages now fully functional when installed via npx

### Changed
- **All packages updated to v1.0.19**
  - api-designer: 1.0.18 → 1.0.19
  - smart-reviewer: 1.0.18 → 1.0.19
  - architecture-analyzer: 1.0.18 → 1.0.19
  - refactor-assistant: 1.0.18 → 1.0.19
  - db-schema: 1.0.18 → 1.0.19
  - doc-generator: 1.0.18 → 1.0.19
  - security-scanner: 1.0.18 → 1.0.19
  - test-generator: 1.0.18 → 1.0.19

---

## [1.0.18] - 2025-10-03

### Fixed
- **Critical**: Published `@j0kz/shared` package to npm
  - Resolved `ERR_MODULE_NOT_FOUND` error when installing packages via npx
  - Changed package name from `@mcp-tools/shared` → `@j0kz/shared`
  - Removed `"private": true` to allow npm publishing
  - All 8 MCP packages now correctly depend on `@j0kz/shared@^1.0.16`

### Changed
- **All packages updated to v1.0.18**
  - api-designer: 1.0.17 → 1.0.18
  - smart-reviewer: 1.0.17 → 1.0.18
  - architecture-analyzer: 1.0.17 → 1.0.18
  - refactor-assistant: 1.0.17 → 1.0.18
  - db-schema: 1.0.17 → 1.0.18
  - doc-generator: 1.0.17 → 1.0.18
  - security-scanner: 1.0.17 → 1.0.18
  - test-generator: 1.0.17 → 1.0.18

### Added
- **Published package**: `@j0kz/shared@1.0.16` now available on npm
  - Contains shared utilities, caching, performance monitoring, and file system helpers
  - Used by all 8 MCP tools for better code reuse
  - Reduces bundle size for individual packages

---

## [1.0.17] - 2025-10-03

### Changed
- **🔧 Major Code Quality Improvements**: Significant complexity reduction across 3 packages
  - **API Designer**: Complexity reduced by 67% (114 → 38), LOC reduced by 64% (733 → 264)
  - **Refactor Assistant**: Better organization with extracted pattern implementations
  - **Smart Reviewer**: Modular analyzers for quality, metrics, and patterns
- **📦 Improved Architecture**: Single-responsibility modules for better maintainability
  - Extracted specialized modules for generation, patterns, and analysis
  - Clean separation between orchestration and implementation
- **✅ Zero Breaking Changes**: All 23 tests passing, 100% backward compatible

### Fixed
- **🎯 Enhanced Accuracy**: Smart Reviewer false positives eliminated
  - Smarter detection logic for JSDoc, comments, and string literals
  - Context-aware analysis for better results

---

## [1.0.16] - 2025-01-28

### Changed
- **Updated dependencies** to latest stable versions:
  - `@anthropic-ai/sdk`: 0.64.0 → 0.65.0
  - `@modelcontextprotocol/sdk`: 1.18.2 → 1.19.1
  - `vitest`: 3.0.5 → 3.2.4
- **Test infrastructure improvements**:
  - All 23 tests passing
  - Enhanced test coverage
- **Zero vulnerabilities** in all dependencies

---

## [1.0.15] - 2025-01-26

### Added
- **📚 Comprehensive Examples**: 19 detailed example files across all tools
  - Step-by-step tutorials for each MCP tool
  - Real-world use cases and workflows
  - Integration pattern demonstrations
- **🔒 Security Hardening**: Fixed ReDoS vulnerabilities
  - Bounded quantifiers in regex patterns
  - Input size validation (100KB limit)
  - Line length checks (1000 char limit)
- **📊 Performance Benchmarking**: New baseline metrics system
  - Complexity baseline: 8,947 total (avg 68.8 per file)
  - LOC baseline: 11,604 total (avg 89.3 per file)
  - Duplicate code: 254 blocks (avg 2.0 per file)

### Changed
- **Structured Error Codes**: Better error handling across all tools
- **Production Ready**: Enhanced validation and error messages

---

## [1.0.0] - 2024-12-15

### Added
- **Initial Release**: 8 MCP development tools
  - smart-reviewer - Code review and quality analysis
  - test-generator - Test suite generation
  - architecture-analyzer - Dependency and architecture analysis
  - refactor-assistant - Code refactoring tools
  - api-designer - REST/GraphQL API design
  - db-schema - Database schema design
  - doc-generator - Documentation generation
  - security-scanner - Security vulnerability scanning
- **Shared Package**: Common utilities and types
- **MCP Protocol Support**: Full compatibility with Claude Code, Cursor, Windsurf
- **Cross-Platform**: Windows, macOS, and Linux support
