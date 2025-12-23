# URL & Link Standards Guide

## Critical Casing Rules

### GitHub URLs (Capital K, Z)
```
✅ https://github.com/j0KZ/mcp-agents
❌ https://github.com/j0kz/mcp-agents
```

### npm Packages (Lowercase)
```
✅ @j0kz/smart-reviewer-mcp
✅ npx @j0kz/mcp-agents@latest
❌ @j0KZ/smart-reviewer-mcp
```

**Rationale:**
- GitHub username: j0KZ (capital K, Z)
- npm scope: @j0kz (lowercase required by npm)
- Mixing these breaks links and installations

## Link Standards by Platform

### GitHub Links

**Repository URLs:**
```markdown
✅ https://github.com/j0KZ/mcp-agents
✅ https://github.com/j0KZ/mcp-agents/tree/main/packages/smart-reviewer
```

**Issue/PR Links:**
```markdown
✅ https://github.com/j0KZ/mcp-agents/issues/42
✅ https://github.com/j0KZ/mcp-agents/pulls/15
```

### npm Links

**Package Pages:**
```markdown
✅ https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp
✅ https://www.npmjs.com/~j0kz (author page)
```

**Installation Commands:**
```bash
✅ npx @j0kz/mcp-agents@latest
✅ npm install @j0kz/shared
```

### Wiki Links

**Internal wiki:**
```markdown
✅ [Smart Reviewer](Smart-Reviewer)
✅ [Test Generator](Test-Generator)
```

**External wiki:**
```markdown
✅ https://github.com/j0KZ/mcp-agents/wiki/Smart-Reviewer
```

## @latest in Documentation

**❌ WRONG:**
```bash
npx @j0kz/mcp-agents@1.0.36
npx @j0kz/smart-reviewer-mcp@1.0.35
```

**✅ CORRECT:**
```bash
npx @j0kz/mcp-agents@latest
npx @j0kz/smart-reviewer-mcp@latest
```

**Why:**
- Users always get latest version
- No documentation updates needed on release
- Prevents outdated installation commands

## Common URL Mistakes and Fixes

### Mistake: Wrong URL Casing
**❌ Wrong:**
```markdown
https://github.com/j0kz/mcp-agents  (lowercase)
@j0KZ/smart-reviewer-mcp            (uppercase)
```

**✅ Fix:**
```markdown
https://github.com/j0KZ/mcp-agents  (GitHub: caps)
@j0kz/smart-reviewer-mcp            (npm: lowercase)
```

### Mistake: Hardcoded Version in Commands
**❌ Wrong in README:**
```bash
npx @j0kz/mcp-agents@1.0.36
```

**✅ Fix:**
```bash
npx @j0kz/mcp-agents@latest
```

## Quick Reference Cheatsheet

| Platform | Format | Example |
|----------|--------|---------|
| GitHub repo | Capital K,Z | `https://github.com/j0KZ/mcp-agents` |
| GitHub wiki | Capital K,Z | `https://github.com/j0KZ/mcp-agents/wiki` |
| npm package | Lowercase | `@j0kz/smart-reviewer-mcp` |
| npm install | Lowercase | `npm install @j0kz/shared` |
| npx command | Lowercase + @latest | `npx @j0kz/mcp-agents@latest` |