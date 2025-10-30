# 🚀 Auto-Pilot

> **Zero-effort automation for lazy developers** - Just run it and forget about code quality forever!

[![npm version](https://badge.fury.io/js/@j0kz%2Fauto-pilot.svg)](https://www.npmjs.com/package/@j0kz/auto-pilot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🦥 For the Laziest Developers

Tired of:
- Running linters? ✅ **Auto-Pilot fixes everything automatically**
- Writing tests? ✅ **Auto-Pilot generates them for you**
- Fixing security issues? ✅ **Auto-Pilot patches them instantly**
- Setting up git hooks? ✅ **Auto-Pilot installs everything**
- Reviewing code? ✅ **Auto-Pilot does it before you commit**
- Thinking? ✅ **Auto-Pilot thinks for you**

## 🎯 One Command to Rule Them All

```bash
npx @j0kz/auto-pilot
```

That's it. Seriously. Auto-Pilot will:

1. 🔍 **Detect** your project type automatically (TypeScript, React, Node, etc.)
2. 📦 **Install** git hooks to fix code before commits
3. 👀 **Watch** files and fix issues as you type
4. 🧪 **Generate** tests for untested code
5. 🔒 **Fix** security vulnerabilities
6. 📊 **Optimize** code complexity
7. 🧹 **Clean** console.logs, debugger statements, etc.
8. ✨ **Format** everything perfectly

## 🛠️ Installation

### Global (Recommended for Maximum Laziness)

```bash
npm install -g @j0kz/auto-pilot
```

Then just run `auto-pilot` in any project!

### Per Project

```bash
npm install --save-dev @j0kz/auto-pilot
```

Add to package.json:

```json
{
  "scripts": {
    "dev": "auto-pilot watch",
    "fix": "auto-pilot fix",
    "postinstall": "auto-pilot hooks"
  }
}
```

## 📚 Commands (If You're Not Too Lazy to Read)

### Start Everything (Default)

```bash
auto-pilot
```

Starts file watching, installs hooks, runs initial analysis and fixes.

### Fix Everything

```bash
auto-pilot fix
# or specific files
auto-pilot fix src/index.ts src/utils.ts
```

### Watch Mode (Auto-fix on Save)

```bash
auto-pilot watch
```

### Analyze Project

```bash
auto-pilot analyze
# or specific file
auto-pilot analyze src/index.ts
# or full scan
auto-pilot analyze --full
```

### Detect Project Type

```bash
auto-pilot detect
```

Shows what Auto-Pilot detected about your project.

### Install Git Hooks

```bash
auto-pilot hooks
# or use Husky
auto-pilot hooks --husky
```

### Health Check

```bash
auto-pilot doctor
```

### Ultra Lazy Mode 🦥

```bash
auto-pilot lazy
```

## 🎣 Git Hooks

Auto-Pilot installs these hooks automatically:

### Pre-commit
- ✅ Auto-fixes all staged files
- ✅ Removes console.log statements
- ✅ Fixes linting issues
- ✅ Applies prettier formatting
- ✅ Runs security scans
- ✅ Generates missing tests

### Pre-push
- ✅ Runs full test suite
- ✅ Checks test coverage (>55%)
- ✅ Security audit
- ✅ Build verification
- ✅ Architecture analysis

### Commit-msg
- ✅ Enforces conventional commits
- ✅ Auto-fixes commit messages

## 🧠 Smart Features

### Context Detection

Auto-Pilot automatically detects:
- Programming language (TypeScript, JavaScript, Python, etc.)
- Framework (React, Vue, Next.js, Express, etc.)
- Package manager (npm, yarn, pnpm)
- Test runner (Jest, Vitest, Mocha)
- Build tools (Webpack, Vite, Rollup)
- Linters (ESLint, Biome)
- CI/CD setup

### Intelligent Auto-Fix

Safe fixes applied automatically:
- `console.log` removal
- `var` → `let/const`
- `==` → `===`
- Missing semicolons
- Trailing whitespace
- `any` → `unknown`
- Optional chaining for null checks
- And much more!

### Smart File Watching

Watches your files and:
- Fixes issues as you type
- Generates tests for new functions
- Adds JSDoc comments
- Removes debug statements
- Suggests refactoring for complex code

## 🤝 Integration with MCP Tools

Auto-Pilot integrates with all @j0kz MCP tools:
- **@j0kz/smart-reviewer** - Code review and auto-fix
- **@j0kz/test-generator** - Automatic test generation
- **@j0kz/security-scanner** - Security vulnerability detection
- **@j0kz/architecture-analyzer** - Architecture analysis
- **@j0kz/refactor-assistant** - Refactoring suggestions

## ⚙️ Configuration

Auto-Pilot works with **zero configuration**, but you can customize it:

### .autopilotrc.json

```json
{
  "watch": true,
  "autoFix": true,
  "gitHooks": true,
  "testGeneration": true,
  "securityScan": true,
  "complexity": {
    "maxComplexity": 20,
    "maxFileLines": 300
  }
}
```

### VS Code Integration

Auto-Pilot automatically creates VS Code tasks for you:
- **Cmd+Shift+F** - Fix current file
- Auto-fix on save

## 🎮 CLI Shortcuts

For the truly lazy:

```bash
# Short alias
ap

# Fix everything
ap fix

# Start watcher
ap watch

# Quick health check
ap doctor
```

## 📊 What It Actually Does

When you run Auto-Pilot, here's what happens:

1. **Scans** your entire codebase
2. **Identifies** all issues (bugs, security, complexity)
3. **Fixes** everything it can safely fix
4. **Generates** tests for untested code
5. **Installs** git hooks for continuous quality
6. **Watches** files for real-time fixes
7. **Blocks** bad code from being committed

## 🚦 Exit Codes

- `0` - Everything is perfect (or fixed)
- `1` - Critical issues that need manual intervention
- `2` - Configuration or setup error

## 🤔 FAQ

**Q: Is this really for lazy developers?**
A: Yes. The lazier, the better.

**Q: Will it break my code?**
A: No. Only safe, non-breaking fixes are applied automatically.

**Q: Can I trust it with production code?**
A: Auto-Pilot is smart enough to detect production projects and be extra careful.

**Q: What if I don't want certain fixes?**
A: You can configure what to fix, but why would you?

**Q: Does it actually work?**
A: Try it. Run `npx @j0kz/auto-pilot` and see your code transform.

## 🏆 The Laziness Scale

- **Level 1**: You run tests manually → *Amateur*
- **Level 2**: You have CI/CD → *Getting there*
- **Level 3**: You use linters → *Decent*
- **Level 4**: You have pre-commit hooks → *Good*
- **Level 5**: You use Auto-Pilot → ***LEGENDARY LAZY*** 🦥

## 📜 License

MIT - Because we're too lazy to write a custom license.

## 🤝 Contributing

Just run Auto-Pilot on your contribution. It'll fix everything.

## 🐛 Bugs

If you find a bug, Auto-Pilot probably already fixed it. If not, it will.

---

**Remember**: The best code is code you don't have to think about. Let Auto-Pilot handle it.

```bash
npx @j0kz/auto-pilot
```

*Now go take a nap. Auto-Pilot's got this.* 🦥