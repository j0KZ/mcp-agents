---
description: Generate semantic commit message from staged changes
allowed-tools: ["Bash"]
---

# Smart Commit

Analyze staged changes and generate a semantic commit message.

## Steps

1. Run `git diff --staged` to see changes
2. Run `git log --oneline -5` to see recent commit style
3. Analyze the nature of changes:
   - feat: New feature
   - fix: Bug fix
   - docs: Documentation only
   - style: Formatting, no code change
   - refactor: Code restructuring
   - perf: Performance improvement
   - test: Adding tests
   - chore: Maintenance tasks

## Commit Message Format

```
type(scope): short description

- Bullet point explaining what changed
- Another bullet point if needed

[optional footer]
```

## Rules

- First line max 72 characters
- Use imperative mood ("add" not "added")
- Focus on WHY, not WHAT
- Reference issues if applicable (#123)

Generate the commit message and ask user to confirm before committing.
