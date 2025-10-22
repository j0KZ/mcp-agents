# Quickstart: Create Your First Skill in 5 Minutes

**Learn by doing: Build a simple but functional skill from scratch.**

---

## What You'll Build

A **git-commit-helper** skill that teaches Claude to write structured, conventional commit messages.

**Result:** Claude will consistently generate commit messages like:

```
feat(auth): add OAuth2 authentication flow

- Implement Google OAuth2 provider
- Add user session management
- Create protected route middleware

Closes #42
```

---

## Step 1: Create the Skill Directory

```bash
mkdir -p skills/git-commit-helper
cd skills/git-commit-helper
```

---

## Step 2: Write the SKILL.md File

Create `SKILL.md` with this content:

```markdown
---
name: git-commit-helper
description: Generates conventional commit messages following Angular/Conventional Commits format. Use when creating git commits or reviewing commit message quality.
---

# Git Commit Helper

Generate structured commit messages following the Conventional Commits specification.

## Commit Message Format
```

<type>(<scope>): <subject>

<body>

<footer>
```

### Type (Required)

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc.
- **refactor**: Code restructuring without feature/fix
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, tooling

### Scope (Optional)

Component or module affected: `auth`, `api`, `ui`, `db`

### Subject (Required)

- Imperative mood: "add feature" not "added feature"
- Lowercase first letter
- No period at end
- Max 50 characters

### Body (Optional)

- Explain what and why (not how)
- Wrap at 72 characters
- Separate from subject with blank line

### Footer (Optional)

- Breaking changes: `BREAKING CHANGE: description`
- Issue references: `Closes #123` or `Fixes #456`

## Workflow

When generating commit messages:

1. Analyze staged changes (if provided)
2. Determine appropriate type and scope
3. Write concise subject in imperative mood
4. Add body if changes need explanation
5. Include footer for issues or breaking changes

## Examples

### Simple Feature

```
feat(auth): add user registration endpoint
```

### Bug Fix with Details

```
fix(api): prevent race condition in user creation

- Add database transaction wrapper
- Implement pessimistic locking for user table
- Add retry logic for conflict resolution

Fixes #234
```

### Breaking Change

```
refactor(api): change authentication response structure

BREAKING CHANGE: Auth endpoints now return nested user object
instead of flat structure. Update client code accordingly.

Migration guide: https://docs.example.com/v2-auth
```

## Validation Checklist

Before finalizing commit message:

- [ ] Type is one of the allowed values
- [ ] Subject is imperative mood, lowercase, <50 chars
- [ ] Body lines wrap at 72 characters
- [ ] Footer properly formatted (issues, breaking changes)

```

Save the file.

---

## Step 3: Test the Skill (Claude.ai or Claude Code)

### Option A: Claude.ai

1. Upload the `git-commit-helper` folder to your conversation
2. Ask Claude:
```

I made these changes:

- Added OAuth2 login with Google
- Created new auth routes
- Updated user model

Generate a commit message

```

3. Claude loads the skill and produces:
```

feat(auth): add OAuth2 authentication with Google

- Implement Google OAuth2 provider integration
- Create /auth/login and /auth/callback routes
- Extend user model with OAuth fields (provider, providerId)

Closes #42

```

### Option B: Claude Code (VSCode)

1. Place skill in your project's `skills/` directory
2. Ask Claude in the chat:
```

Review my staged changes and create a conventional commit message

````

3. Claude uses `git diff --staged`, loads the skill, and generates appropriate message

---

## Step 4: Enhance the Skill (Optional)

### Add a Validation Script

Create `scripts/validate_commit.py`:

```python
#!/usr/bin/env python3
"""Validate commit message follows conventional format."""

import re
import sys

TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']
SUBJECT_MAX_LENGTH = 50

def validate(message: str) -> tuple[bool, list[str]]:
 """Validate commit message format."""
 errors = []
 lines = message.strip().split('\n')

 if not lines:
     return False, ["Empty commit message"]

 # Validate header
 header = lines[0]
 pattern = r'^(\w+)(\([a-z0-9-]+\))?: (.+)$'
 match = re.match(pattern, header)

 if not match:
     errors.append("Invalid header format. Expected: type(scope): subject")
     return False, errors

 type_, scope, subject = match.groups()

 # Validate type
 if type_ not in TYPES:
     errors.append(f"Invalid type '{type_}'. Must be one of: {', '.join(TYPES)}")

 # Validate subject
 if len(subject) > SUBJECT_MAX_LENGTH:
     errors.append(f"Subject too long ({len(subject)} chars). Max {SUBJECT_MAX_LENGTH}")

 if subject[0].isupper():
     errors.append("Subject should start with lowercase letter")

 if subject.endswith('.'):
     errors.append("Subject should not end with period")

 # Validate blank line after subject (if body exists)
 if len(lines) > 1 and lines[1] != '':
     errors.append("Missing blank line between subject and body")

 return len(errors) == 0, errors

if __name__ == "__main__":
 message = sys.stdin.read()
 valid, errors = validate(message)

 if valid:
     print("✓ Commit message is valid")
     sys.exit(0)
 else:
     print("✗ Commit message has errors:")
     for error in errors:
         print(f"  - {error}")
     sys.exit(1)
````

Make it executable:

```bash
chmod +x scripts/validate_commit.py
```

### Update SKILL.md to Reference Script

Add to the end of SKILL.md:

````markdown
## Validation

Validate generated commit message:

```bash
echo "<commit-message>" | python scripts/validate_commit.py
```
````

This script checks:

- Header format (type, scope, subject)
- Type is valid
- Subject length and formatting
- Proper blank lines

```

---

## Step 5: Share or Use

### Use Locally

Place in your project:
```

your-project/
├── skills/
│ └── git-commit-helper/
│ ├── SKILL.md
│ └── scripts/
│ └── validate_commit.py
└── ...

````

Claude Code will discover it automatically.

### Share with Team

```bash
# Create shareable archive
cd skills
zip -r git-commit-helper.zip git-commit-helper/

# Team members extract to their skills/ directory
unzip git-commit-helper.zip -d skills/
````

### Publish to GitHub

```bash
# Create repository
gh repo create my-claude-skills --public

# Push skills
git add skills/git-commit-helper
git commit -m "feat(skills): add git-commit-helper skill"
git push

# Team members can clone
git clone https://github.com/username/my-claude-skills.git
```

---

## What You Learned

✅ **Skill Structure**

- YAML frontmatter (name, description)
- Markdown body with instructions
- Optional scripts for validation

✅ **Writing Effective Descriptions**

- What the skill does
- When to use it
- Third-person perspective

✅ **Imperative Instructions**

- Clear, actionable procedures
- Examples and templates
- Validation checklists

✅ **Progressive Disclosure**

- Core logic in SKILL.md (<500 lines)
- Helper scripts in separate files
- Keeps context usage low

---

## Next Steps

### Beginner

- **Try variations:** Create commit-message style for your team
- **Add features:** Include emoji support (🎨, 🐛, ✨)
- **Explore examples:** [Minimal Example](../08-examples/minimal-example.md)

### Intermediate

- **Add references:** Create `references/EXAMPLES.md` with 50+ commit samples
- **Create templates:** Add `assets/commit-templates.json` with presets
- **Learn patterns:** [Best Practices](../04-best-practices/progressive-disclosure.md)

### Advanced

- **Build composition:** Combine with `code-review` skill for complete PR workflow
- **Integrate APIs:** Connect to GitHub/GitLab APIs for auto-linking
- **Study architecture:** [Multi-Skill Composition](../07-advanced-topics/multi-skill-composition.md)

---

## Common Issues

### "Claude isn't using my skill"

**Check:**

1. Is `SKILL.md` in the correct location?
2. Does the description clearly state when to use it?
3. Is your request relevant to the skill's domain?

**Fix:** Make description more specific:

```yaml
# Vague
description: Helps with git commits

# Specific
description: Generates conventional commit messages following Angular format. Use when creating git commits or reviewing commit quality.
```

### "Skill loads but doesn't follow instructions"

**Check:**

1. Are instructions clear and imperative? ("Do X" not "You could do X")
2. Is there conflicting guidance in the skill?
3. Are examples consistent with instructions?

**Fix:** Use numbered steps, checklists, and consistent examples.

### "Skill is too slow"

**Check:**

1. Is SKILL.md over 500 lines?
2. Are you embedding large references directly?

**Fix:** Move detailed content to `references/` folder and reference it:

```markdown
For comprehensive examples, see references/EXAMPLES.md
```

---

## Congratulations!

You've created a functional Claude Skill. You now understand:

- Basic skill structure (YAML + markdown)
- Effective descriptions that trigger activation
- Imperative instruction writing
- Progressive disclosure with scripts

**Continue learning:**

- [Skill Anatomy](../03-skill-structure/anatomy.md)
- [Writing Style Guide](../04-best-practices/writing-style.md)
- [Development Workflow](../06-development-workflow/creation-process.md)

---

**Related Documentation:**

- [What Are Skills?](../01-overview/what-are-skills.md)
- [First Skill Tutorial](first-skill.md) (more detailed walkthrough)
- [Examples](../08-examples/)
