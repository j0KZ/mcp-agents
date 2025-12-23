# Conventional Commits - Complete Guide

Complete reference for conventional commit format used in @j0kz/mcp-agents.

---

## Format Specification

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

---

## All Commit Types (Complete)

### 1. feat - New Features

**When to use:** Adding new functionality for users

**Format:** `feat(<scope>): <what user can now do>`

**Examples:**
```bash
feat(smart-reviewer): add Pareto 80/20 auto-fix principle

feat(orchestrator): add bilingual support (English/Spanish)

feat(test-generator): add smart assertion patterns

feat: add new MCP tool for database schema design

feat(api): add OAuth2 authentication endpoints
```

**Scope examples:** Package name or feature area

---

### 2. fix - Bug Fixes

**When to use:** Fixing bugs that affect users

**Format:** `fix(<scope>): <what no longer breaks>`

**Examples:**
```bash
fix(test-generator): resolve absolute path import bug

fix(smart-reviewer): preserve used imports during auto-fix

fix: correct version badge in README

fix(api): handle null values in user profile

fix(db): prevent race condition in migrations
```

**Pro tip:** Add Problem/Solution/Result in body for critical fixes

**Multi-line example:**
```bash
git commit -m "fix(test-generator): resolve absolute path import bug

**Problem**: Generated broken imports: import * as target from './D:\Users\...\file'
**Solution**: Calculate relative paths using path.relative() and path.basename()
**Result**: Now generates correct relative imports: import * as target from './file'
**Impact**: Test Generator now produces working tests out-of-the-box"
```

---

### 3. docs - Documentation

**When to use:** Documentation-only changes (no code changes)

**Format:** `docs: <what documentation changed>`

**Examples:**
```bash
docs: update README with bilingual support examples

docs: add troubleshooting section for MCP installation

docs(api-designer): document OpenAPI spec generation

docs: fix typos in CHANGELOG.md

docs: add architecture decision record for caching
```

**Note:** Includes README, CHANGELOG, wiki, code comments, API docs

---

### 4. refactor - Code Refactoring

**When to use:** Code changes that neither fix bugs nor add features

**Format:** `refactor(<scope>): <what was restructured>`

**Examples:**
```bash
refactor(security-scanner): extract constants to modular files

refactor: move shared utilities to @j0kz/shared package

refactor(analyzer): reduce complexity from 82 to 45

refactor: apply modular architecture pattern to 4 packages

refactor(db): simplify query builder API
```

**Pro tip:** Include metrics in body (LOC reduction, complexity)

**Multi-line example:**
```bash
git commit -m "refactor(security-scanner): extract constants to modular files

- Created constants/security-thresholds.ts
- Created constants/secret-patterns.ts
- Reduced main file from 395 to 209 LOC (-47%)
- Estimated +15% maintainability score"
```

---

### 5. test - Tests

**When to use:** Adding or correcting tests (no production code changes)

**Format:** `test(<scope>): <what is now tested>`

**Examples:**
```bash
test(orchestrator): add 15 bilingual workflow tests

test: add edge case tests for empty arrays

test(smart-reviewer): add mocking tests for file operations

test: increase coverage from 65% to 75%

test(api): add integration tests for auth flow
```

**Note:** Test-only changes, not fixes that include tests

---

### 6. chore - Build/Tooling

**When to use:** Changes to build process, dependencies, tooling

**Format:** `chore: <what tooling/build changed>`

**Examples:**
```bash
chore: upgrade vitest from 3.0.5 to 3.2.4

chore: update all dependencies to latest

chore: add pre-commit hook for linting

chore(ci): configure GitHub Actions for Windows

chore: migrate from Jest to Vitest
```

**Includes:** Dependencies, CI/CD, build scripts, linting, formatting

---

## Optional Scopes

**Package names:**
- `smart-reviewer`, `test-generator`, `orchestrator`
- `architecture-analyzer`, `security-scanner`
- `api-designer`, `db-schema`, `doc-generator`
- `refactor-assistant`, `shared`

**Feature areas:**
- `api`, `cli`, `config`, `cache`
- `auth`, `db`, `ui`, `docs`

**Omit scope if change affects multiple packages or is project-wide.**

---

## Multi-line Commit Body

### When to Use Body

**Use body for:**
- ✅ Breaking changes (MUST explain)
- ✅ Complex bug fixes (Problem/Solution/Result)
- ✅ Major refactorings (metrics, impact)
- ✅ Feature context (why this was added)

**Skip body for:**
- ❌ Trivial changes (typo fixes, formatting)
- ❌ Self-explanatory commits (obvious from diff)

### Body Format

**Problem/Solution/Result pattern (for bugs):**
```bash
fix(component): description

**Problem**: What was broken
**Solution**: How it was fixed
**Result**: What now works
**Impact**: Benefit to users
```

**Metrics pattern (for refactoring):**
```bash
refactor(component): description

- Changed file structure: X → Y
- Reduced LOC: 500 → 350 (-30%)
- Reduced complexity: 75 → 45 (-40%)
- Estimated maintainability: +20%
```

**Context pattern (for features):**
```bash
feat(component): description

Adds [feature] to solve [problem].

**Use case**: Users can now [action]
**Implementation**: [brief technical approach]
**Testing**: [how it was validated]
```

---

## Commit Footers

### Co-Authorship

**Always add for Claude Code:**
```bash
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Breaking Changes

**MUST include for major versions:**
```bash
BREAKING CHANGE: API signature changed from X to Y

Migration guide:
- Replace foo(a, b) with foo({a, b})
- Update all call sites
```

### Issue References

**Link to GitHub issues:**
```bash
Fixes #123
Closes #456
Resolves #789

Related to #100, #200
```

---

## Real Examples from CHANGELOG

### v1.0.36 - Bug Fix with Problem/Solution/Result

```bash
git commit -m "fix(test-generator): resolve absolute path import bug

**Problem**: Generated broken imports: import * as target from './D:\Users\...\file'
**Solution**: Calculate relative paths using path.relative() and path.basename()
**Result**: Now generates correct relative imports: import * as target from './file'
**Impact**: Test Generator now produces working tests out-of-the-box

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### v1.0.35 - Refactoring with Metrics

```bash
git commit -m "refactor: apply modular architecture pattern to 4 packages

Refactored packages:
- architecture-analyzer (382 → 287 LOC, -25%)
- doc-generator (363 → 232 LOC, -36%)
- security-scanner (395 → 209 LOC, -47%)
- refactor-assistant (344 → 221 LOC, -36%)

Total LOC removed: 672 lines (-36%)
New modular files: 24 helpers + 8 constants
Tests passing: 365/365 (100%)

Estimated quality improvements:
- Maintainability: +25%
- Complexity reduction: -38% average
- Test coverage: +5%

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Unreleased - Feature with Context

```bash
git commit -m "feat(orchestrator): add ambiguity detection and bilingual support

Implemented smart ambiguity detection and bilingual support (English/Spanish).

**Key Features:**
- Two-iteration clarification pattern for vague requests
- Focus areas: Security, Quality, Performance, Comprehensive
- Bilingual messages with natural translations
- 3x faster execution with targeted workflows
- Zero breaking changes (backward compatible)

**Implementation:**
- packages/orchestrator-mcp/src/helpers/workflow-selector.ts (77 LOC)
- packages/orchestrator-mcp/src/helpers/response-builder.ts (88 LOC)
- packages/shared/src/i18n/messages.ts (261 LOC)

**Testing:**
- 388 passing tests (366 → 388, +22 tests)
- 15 new bilingual workflow tests
- 100% pass rate maintained

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Common Mistakes

### ❌ Wrong

```bash
# Missing type
"update readme"

# Wrong type (use docs, not chore)
"chore: update documentation"

# Not descriptive
"fix: bug"

# Wrong scope format
"feat [api]: new endpoint"

# Capitalized description
"feat: Add new feature"

# Past tense
"fix: fixed the bug"

# No colon
"feat add feature"
```

### ✅ Correct

```bash
docs: update README with examples

fix(api): handle null user profile

feat(api): add user authentication endpoint

refactor: reduce complexity in analyzer
```

---

## Quick Reference Table

| Type | When | Example |
|------|------|---------|
| **feat** | New user feature | `feat: add OAuth2 support` |
| **fix** | User bug fix | `fix: handle null values` |
| **docs** | Documentation only | `docs: update README` |
| **refactor** | Code restructure | `refactor: extract helper` |
| **test** | Test changes | `test: add edge cases` |
| **chore** | Build/tooling | `chore: upgrade vitest` |

---

## Validation Checklist

Before committing, verify:
- [ ] Type is one of: feat, fix, docs, refactor, test, chore
- [ ] Scope matches package or feature area (or omitted)
- [ ] Description is lowercase, imperative mood ("add" not "added")
- [ ] Description is concise (≤50 chars if possible)
- [ ] No period at end of description
- [ ] Body uses Problem/Solution/Result for complex fixes
- [ ] Footer includes Claude Code co-authorship
- [ ] Breaking changes noted in footer (if any)

---

**Reference:** Used throughout 25+ releases in CHANGELOG.md
**Standard:** Conventional Commits 1.0.0
**Project:** @j0kz/mcp-agents
