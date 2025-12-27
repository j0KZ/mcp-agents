# Development Workflow & Best Practices

**Universal development workflow guide for any project**

---

## Proactive Problem-Solving Mindset

**CRITICAL: Complete the entire job, don't wait to be asked multiple times**

When given a task, think through the COMPLETE workflow and execute all logical follow-up steps.

### The "Audit → Fix → Document" Pattern

**❌ BAD (Requires Multiple Prompts):**
```
User: "audit the project"
You: [runs audit, finds issue] "Found an issue"
User: "fix it"
You: [fixes issue] "Fixed"
User: "update the docs"
You: [updates docs] "Done"
```

**✅ GOOD (Complete Job in One Go):**
```
User: "audit the project"
You:
1. [runs audit, finds issue]
2. [fixes issue]
3. [updates documentation]
4. [runs verification]
5. [commits everything]
"Audit complete! Found and fixed [issue]. Updated docs and committed."
```

---

## Before Starting Any Task

### 1. Understand Current State FIRST
- Read relevant existing code
- Check for existing automation/scripts
- Search for existing utilities
- Review documentation for accuracy

### 2. Identify Real Gaps AND Fixable Issues
- What's actually missing vs what already exists?
- What's wrong that you can fix immediately?
- Is this solving a real problem or adding complexity?
- Can existing code be enhanced instead of adding new code?

### 3. Design Complete Solution (Not Just First Step)
- Think: "What are ALL the steps to truly complete this?"
- Example: Audit → Fix Issues → Update Docs → Commit
- Don't stop halfway and wait for the user to prompt you again
- Start with the smallest change that solves the ENTIRE problem

### 4. Execute Thoroughly
- Fix what you find during analysis
- Update all related documentation
- Run verification steps
- Commit everything together
- Present complete results, not partial work

---

## Feature Development Checklist

Before implementing any feature, validate:

| Question | Check |
|----------|-------|
| **Does this solve a real problem?** | Not "might be nice" - actual pain point |
| **Does something already solve this?** | Search codebase for existing solutions |
| **Is this the right place?** | Right module/package? |
| **What's the minimum version?** | Can it be simpler? Smaller? Reuse more? |
| **Will users understand it?** | Simple API? Not too many options? |

---

## Anti-Patterns to Avoid

### ❌ Don't Do This:
1. Design solutions before understanding the problem
2. Add features without checking what already exists
3. Create abstractions for one-time operations
4. Add "nice to have" features that create complexity
5. Create backups/rollback for read-only operations
6. Build validation that already exists elsewhere

### ✅ Do This Instead:
1. Audit codebase first, design second
2. Reuse existing utilities and patterns
3. Understand requirements thoroughly
4. Only add features that solve actual problems
5. Only backup when actually modifying critical files
6. Check for existing validation/automation first

---

## Code Quality Standards

### General Guidelines
- **File size:** Keep files focused and modular
- **Complexity:** Refactor complex functions into smaller units
- **Testing:** Add tests for new functionality
- **Documentation:** Update docs when behavior changes

### Documentation Standards
- **Code comments:** Explain "why", not "what"
- **README:** Keep up-to-date with changes
- **CHANGELOG:** Document user-facing changes
- **Examples:** Include usage examples

---

## Git Workflow

### Commit Message Format
```
type(scope): description

Examples:
feat(auth): add password reset
fix(api): handle timeout errors
docs(readme): update installation steps
chore(deps): upgrade dependencies
```

### Pull Request Process
1. **Before PR:** Run tests and build
2. **PR Description:** Explain what, why, and how
3. **Link Issues:** Reference related issues
4. **Review:** Address all feedback before merging

---

## Debugging & Troubleshooting

### Systematic Approach
1. **Reproduce:** Ensure you can reproduce the issue
2. **Isolate:** Narrow down the problematic code
3. **Investigate:** Use logs, debuggers, tests
4. **Fix:** Make the minimal change that fixes it
5. **Verify:** Confirm the fix works and doesn't break anything
6. **Document:** Update docs/tests if needed

### Common Issues
- **Build errors:** Check dependencies, clean build
- **Test failures:** Run tests locally, check logs
- **Type errors:** Review types, check imports
- **Runtime errors:** Check logs, add debugging

---

## Summary: The Complete Job Mindset

When given ANY task:

1. ✅ **Understand** - Read existing code, check for existing solutions
2. ✅ **Identify** - Find real gaps AND fixable issues
3. ✅ **Design** - Plan complete solution (not just first step)
4. ✅ **Execute** - Fix, document, verify, commit
5. ✅ **Complete** - Present full results, not partial work

**Goal:** User says "do X" → You complete X + logical follow-ups in one session

**Only ask before:** Destructive actions (delete, force push, publish)

---

## Project-Specific Workflow

For project-specific development commands, patterns, and conventions, see [project-specifics.md](./project-specifics.md)
