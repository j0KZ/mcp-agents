# CLAUDE.md - Universal Starter Template

> Drop this file in any project root to give Claude Code context and best practices.

## Project Context

<!-- CUSTOMIZE: Add your project description -->
**Project:** [Your project name]
**Language:** [Primary language]
**Framework:** [Framework if any]

## Quick Commands

```bash
# Build
npm run build          # or: make build, cargo build, etc.

# Test
npm test               # or: pytest, go test, etc.

# Lint
npm run lint           # or: flake8, golint, etc.

# Start dev
npm run dev            # or: python manage.py runserver, etc.
```

## Code Organization

<!-- CUSTOMIZE: Describe your project structure -->
```
src/           # Main source code
tests/         # Test files
docs/          # Documentation
scripts/       # Build/automation scripts
```

## Conventions

### Naming
- **Files:** kebab-case (`user-service.ts`)
- **Functions:** camelCase (`getUserById`)
- **Classes:** PascalCase (`UserService`)
- **Constants:** UPPER_SNAKE (`MAX_RETRIES`)

### Git
- Conventional commits: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Branch: `feature/`, `fix/`, `docs/`

## Safety Rules

### Never Delete Without Confirmation
When asked to "remove" or "delete" anything:
1. List all files/directories that will be affected
2. Ask for explicit `YES DELETE` confirmation
3. Suggest alternatives (archive, gitignore, move)

### Before Major Changes
- Read existing code first
- Understand the full context
- Check for related files
- Run tests after changes

## Task Completion

### The "Audit → Fix → Document" Pattern
When you find issues during any task:
1. Fix obvious/safe issues immediately
2. Update related documentation
3. Don't wait to be asked multiple times

### Feature Audit Checklist
Before implementing anything:
- [ ] Does this solve a real problem?
- [ ] Does something similar already exist?
- [ ] Is this the simplest solution?
- [ ] Will it be easy to maintain?

## Available Skills

<!-- Skills are in .claude/skills/ - Claude will use them automatically -->

| Skill | Use When |
|-------|----------|
| quick-pr-review | Before creating PRs |
| debug-detective | Hunting bugs |
| performance-hunter | Finding bottlenecks |
| security-first | Security audit |
| test-coverage-boost | Improving coverage |
| zero-to-hero | Learning new codebase |
| legacy-modernizer | Updating old code |
| tech-debt-tracker | Managing debt |
| dependency-doctor | Package issues |
| api-integration | Connecting APIs |

## Notes

<!-- CUSTOMIZE: Add project-specific notes -->
-
