# NPM Publishing Guide

## 🚀 Ready to Publish!

Your packages are configured and ready for NPM. Follow these steps:

---

## Step 1: Login to NPM

```bash
cd D:\Users\j0KZ\Documents\Coding\my-claude-agents
npm login
```

Enter your credentials for https://www.npmjs.com/~j0kz

---

## Step 2: Verify Everything is Ready

```bash
# Check that build succeeded
npm run build

# Verify package names
npm ls --depth=0 --workspaces

# Should show:
# @j0kz/smart-reviewer-mcp@1.0.0
# @j0kz/test-generator-mcp@1.0.0
# @j0kz/architecture-analyzer-mcp@1.0.0
```

---

## Step 3: Publish All Packages

### Option A: Publish All at Once (Recommended)

```bash
npm publish --workspaces --access public
```

### Option B: Publish One by One

```bash
npm publish -w packages/smart-reviewer --access public
npm publish -w packages/test-generator --access public
npm publish -w packages/architecture-analyzer --access public
```

---

## Step 4: Verify Publication

Check your packages are live:
- https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp
- https://www.npmjs.com/package/@j0kz/test-generator-mcp
- https://www.npmjs.com/package/@j0kz/architecture-analyzer-mcp

---

## Step 5: Test Installation

In a different directory, test the published packages:

```bash
# Test with Claude Code
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user

# Verify it works
claude mcp list
```

---

## 📦 What Gets Published

For each package, NPM will upload:
- ✅ `dist/` - Compiled JavaScript
- ✅ `README.md` - Package documentation
- ✅ `LICENSE` - MIT License
- ✅ `package.json` - Metadata

**NOT included** (as per `.gitignore` and `files` in package.json):
- ❌ `src/` - TypeScript source (users don't need it)
- ❌ `node_modules/`
- ❌ `.ts` config files

---

## 🔄 Publishing Updates

When you make changes:

1. **Update version** in each package's `package.json`:
   ```json
   {
     "version": "1.0.1"  // Increment version
   }
   ```

2. **Rebuild and publish:**
   ```bash
   npm run build
   npm publish --workspaces --access public
   ```

### Semantic Versioning

- `1.0.0` → `1.0.1` - Bug fixes (patch)
- `1.0.0` → `1.1.0` - New features (minor)
- `1.0.0` → `2.0.0` - Breaking changes (major)

---

## 🎯 After Publishing

### Share Your Packages!

```markdown
## Install My MCP Agents

### All at once (Claude Code):
```bash
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user
claude mcp add architecture-analyzer "npx @j0kz/architecture-analyzer-mcp" --scope user
```

### Or use the auto-installer:
```bash
npx @j0kz/mcp-agents install-all
```

### Works with:
- ✅ Claude Code
- ✅ Cursor
- ✅ Windsurf
- ✅ Roo Code
- ✅ Continue
- ✅ Any MCP-compatible editor
```

---

## 🛡️ Best Practices

1. **Always test locally** before publishing
2. **Use semantic versioning** for updates
3. **Update README.md** with new features
4. **Create Git tags** for releases:
   ```bash
   git tag v1.0.0
   git push --tags
   ```
5. **Check npm stats** periodically: https://www.npmjs.com/~j0kz

---

## 🔧 Troubleshooting

### "Package already exists"
You already published this version. Increment version number.

### "Must be logged in"
```bash
npm logout
npm login
```

### "403 Forbidden"
Your account doesn't have permission. Verify you're logged in as `j0kz`.

### "Invalid package name"
Package names must start with `@j0kz/` for scoped packages.

---

## 📊 NPM Dashboard

After publishing, manage your packages at:
- **Profile**: https://www.npmjs.com/~j0kz
- **Downloads stats**: Click any package → "Stats" tab
- **Versions**: Click package → "Versions" tab

---

## 🎉 Success!

Once published, anyone can install your MCPs with:

```bash
npx @j0kz/smart-reviewer-mcp
npx @j0kz/test-generator-mcp
npx @j0kz/architecture-analyzer-mcp
```

Your packages will show up in:
- NPM search: https://www.npmjs.com/search?q=%40j0kz
- Your profile: https://www.npmjs.com/~j0kz
