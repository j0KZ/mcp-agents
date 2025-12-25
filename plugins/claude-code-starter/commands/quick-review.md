---
description: Quick pre-commit review (30 seconds)
allowed-tools: ["Read", "Bash", "Glob", "Grep"]
argument-hint: "[file-pattern]"
---

# Quick Review

Fast pre-commit review for: $ARGUMENTS

## Checklist (30 seconds max)

1. **Syntax Check**
   - No syntax errors
   - No TypeScript/ESLint errors

2. **Security Quick Scan**
   - No hardcoded secrets (API keys, passwords)
   - No eval/exec usage
   - No SQL injection patterns

3. **Quality Gates**
   - No console.log in production code
   - No debugger statements
   - No commented-out code blocks

4. **Import Check**
   - No unused imports
   - No circular dependencies

## Output Format

```
[PASS/FAIL] filename.ts
  - Issue 1 (if any)
  - Issue 2 (if any)
```

Only report issues. Silent = good.
