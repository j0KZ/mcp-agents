# Changelog

All notable changes to this project will be documented in this file.

## [1.0.27] - 2025-10-04

### 🎯 Major Refactoring - Code Quality Improvements

Completed systematic refactoring of 3 MCP packages with **validated improvements** using Smart Reviewer and Security Scanner MCPs.

#### Security Scanner Package
- **Score**: 57/100 → **100/100** ⭐ (+75% improvement)
- **Complexity**: 71 → 33 (-54% reduction)
- **Maintainability**: 11 → 38 (+245% improvement)
- **Duplicate Blocks**: 35 → 2 (-94% reduction)
- **Lines of Code**: 395 → 209 (-47% reduction)
- **Security Issues**: 0 vulnerabilities ✅

**Changes:**
- Extracted 30+ magic numbers into `constants/security-thresholds.ts` and `constants/secret-patterns.ts`
- Modularized scanners: created `scanners/owasp-scanner.ts`, `scanners/dependency-scanner.ts`
- Updated existing scanners to use centralized constants
- Expanded secret detection from 9 to 20 patterns (Google API, Stripe, Twilio, SendGrid, NPM, Azure, etc.)
- Added 6 utility functions to eliminate code duplication

#### DB Schema Designer Package
- **Score**: 75/100 → **97/100** ⭐ (+29% improvement)
- **Complexity**: 83 → 42 (-49% reduction)
- **Maintainability**: 14 → 31 (+121% improvement)
- **Duplicate Blocks**: 22 → 13 (-41% reduction)
- **Lines of Code**: 411 → 262 (-36% reduction)
- **Security Issues**: 0 vulnerabilities ✅

**Changes:**
- Extracted 27 magic numbers into `constants/schema-limits.ts` (8 organized categories)
- Created `helpers/index-optimizer.ts` - 5 index suggestion functions (146 lines)
- Created `helpers/normalization-helper.ts` - 5 normalization detection functions (119 lines)
- Created `helpers/sql-builder.ts` - SQL generation utilities (46 lines)
- Removed 12 duplicate code blocks across generators and validators

#### Refactor Assistant Package
- **Score**: 67/100 → 67/100 (stable)
- **Complexity**: 84 → 78 (-7% reduction)
- **Maintainability**: 12 → 13 (+8% improvement)
- **Lines of Code**: 456 → 407 (-11% reduction)
- **Security Issues**: 0 vulnerabilities ✅

**Changes:**
- Extracted 30 magic numbers into `constants/refactoring-limits.ts` (5 organized categories)
- Created `utils/error-helpers.ts` - eliminated 6 duplicate error handling blocks
- Improved semantic clarity for index conversions and maintainability formulas
- Already well-modularized from previous refactoring work

### 📊 Overall Impact
- **Average Score**: +33% improvement (66 → 88)
- **Total Complexity**: -36% reduction (79 → 51)
- **Maintainability**: +122% improvement (12 → 27)
- **Duplicate Blocks**: -52% reduction (81 → 39 blocks)
- **Code Size**: -30% reduction (1,262 → 878 lines in main files)
- **Security**: 0 vulnerabilities across all packages

### 🔒 Security
- Removed `.mcp.json` containing GitHub PAT token
- Added `.mcp.json` to `.gitignore`
- All packages passed comprehensive security scans (SQL injection, XSS, secrets, OWASP Top 10)

### ✅ Testing
- All 68 tests passing (100% pass rate)
- Zero breaking changes
- Backward compatible public APIs maintained

### 📦 Files Created (10 total)
- 3 comprehensive constants files (365 lines)
- 7 helper/scanner modules (672 lines)

### 🎓 Validated By
- Smart Reviewer MCP: Confirmed score improvements and complexity reductions
- Security Scanner MCP: Verified zero vulnerabilities
- All existing test suites: 100% pass rate maintained

---

## [1.0.26] - 2025-10-04

### Added
- **Global Version Management**: Single source of truth for all package versions
  - Added `version.json` - global version file at root
  - Added `scripts/sync-versions.js` - auto-sync script
  - Added `npm run version:sync` command
  - Perfect for adding new MCPs - they auto-inherit the global version

### Benefits
- One file to update instead of 10+
- Impossible to have version mismatches
- Scalable for future MCP packages
- Simplified release process

---

## [1.0.25] - 2025-10-04

### Changed
- **Version Sync**: Unified all packages to v1.0.25 for consistency
  - All 8 MCP tools now at same version
  - Installer updated to v1.0.25
  - Eliminates version confusion across packages
  - Easier to track releases and compatibility

### Fixed
- **Trae Support**: Fixed installer to use correct config path for Trae editor
  - Changed from Cline-style path to `AppData/Roaming/Trae/User/mcp.json`
  - Updated installer with proper Trae detection
- **Package Corruption**: Removed corrupted `package.json.tmp` files from all packages
  - Fixed npm lockfile errors in smart-reviewer and other packages
  - Cleaned package structure across all tools
- **Repository Cleanup**: Removed package-lock.json from repo (saves 260KB)
  - Added to .gitignore for cleaner commits
  - Users generate their own lockfiles on install

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
