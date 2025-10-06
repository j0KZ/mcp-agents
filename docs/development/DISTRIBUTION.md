# Distribution Guide - Share Your MCPs with Others

## Option 1: Publish to NPM (Recommended)

### Benefits

- ✅ Users install with one command: `npx @your-name/smart-reviewer`
- ✅ Automatic updates
- ✅ Version management
- ✅ Easy discovery on npmjs.com

### Steps to Publish

#### 1. Prepare Packages

First, remove `"private": true` from root package.json and update package names:

```bash
cd D:\Users\j0KZ\Documents\Coding\my-claude-agents
```

Update each package's `package.json`:

**packages/smart-reviewer/package.json:**

```json
{
  "name": "@YOUR-NPM-USERNAME/smart-reviewer-mcp",
  "version": "1.0.0",
  "description": "Smart Code Reviewer MCP for Claude Code",
  "type": "module",
  "main": "./dist/index.js",
  "bin": {
    "smart-reviewer-mcp": "./dist/mcp-server.js"
  },
  "files": ["dist", "README.md", "LICENSE"],
  "keywords": ["mcp", "claude-code", "code-review", "ai"],
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR-USERNAME/my-claude-agents"
  },
  "license": "MIT"
}
```

#### 2. Publish to NPM

```bash
# Login to NPM (create account at npmjs.com if needed)
npm login

# Publish each package
npm publish -w packages/smart-reviewer --access public
npm publish -w packages/test-generator --access public
npm publish -w packages/architecture-analyzer --access public
```

#### 3. Users Install Like This

```bash
# Global installation for all projects
claude mcp add smart-reviewer "npx @YOUR-USERNAME/smart-reviewer-mcp" --scope user
claude mcp add test-generator "npx @YOUR-USERNAME/test-generator-mcp" --scope user
claude mcp add architecture-analyzer "npx @YOUR-USERNAME/architecture-analyzer-mcp" --scope user
```

---

## Option 2: GitHub Repository (Good for Open Source)

### Benefits

- ✅ Free hosting
- ✅ Version control
- ✅ Community contributions
- ✅ Issue tracking

### Steps

#### 1. Push to GitHub

```bash
cd D:\Users\j0KZ\Documents\Coding\my-claude-agents
git init
git add .
git commit -m "Initial commit: MCP agents"
git remote add origin https://github.com/YOUR-USERNAME/my-claude-agents.git
git push -u origin main
```

#### 2. Create Installation Instructions

Add to your README.md:

````markdown
## Installation

### For Users

1. Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/my-claude-agents.git
cd my-claude-agents
```
````

2. Install dependencies and build:

```bash
npm install
npm run build
```

3. Add to Claude Code (user-wide):

```bash
# Get your absolute path
AGENTS_PATH=$(pwd)

# Add MCPs globally
claude mcp add smart-reviewer node "$AGENTS_PATH/packages/smart-reviewer/dist/mcp-server.js" --scope user
claude mcp add test-generator node "$AGENTS_PATH/packages/test-generator/dist/mcp-server.js" --scope user
claude mcp add architecture-analyzer node "$AGENTS_PATH/packages/architecture-analyzer/dist/mcp-server.js" --scope user
```

4. Verify:

```bash
claude mcp list
```

````

#### 3. Users Install From Your Repo

```bash
# Clone and setup
git clone https://github.com/YOUR-USERNAME/my-claude-agents.git ~/my-claude-agents
cd ~/my-claude-agents
npm install && npm run build

# Add to Claude Code
claude mcp add smart-reviewer node "~/my-claude-agents/packages/smart-reviewer/dist/mcp-server.js" --scope user
````

---

## Option 3: One-Line Installer Script (Easiest for Users)

### Benefits

- ✅ Zero configuration
- ✅ Automatic path detection
- ✅ Cross-platform

### Create Auto-Installer

**scripts/auto-install.sh:**

```bash
#!/bin/bash
set -e

echo "🚀 Installing My Claude Agents..."

# Clone repo to ~/.claude-agents
INSTALL_DIR="$HOME/.claude-agents"
if [ -d "$INSTALL_DIR" ]; then
  echo "📦 Updating existing installation..."
  cd "$INSTALL_DIR"
  git pull
else
  echo "📦 Cloning repository..."
  git clone https://github.com/YOUR-USERNAME/my-claude-agents.git "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# Build
echo "🔨 Building agents..."
npm install
npm run build

# Add to Claude Code
echo "🔗 Adding to Claude Code..."
claude mcp add smart-reviewer node "$INSTALL_DIR/packages/smart-reviewer/dist/mcp-server.js" --scope user
claude mcp add test-generator node "$INSTALL_DIR/packages/test-generator/dist/mcp-server.js" --scope user
claude mcp add architecture-analyzer node "$INSTALL_DIR/packages/architecture-analyzer/dist/mcp-server.js" --scope user

echo ""
echo "✅ Installation complete!"
echo "📊 Verifying..."
claude mcp list
```

### Users Run One Command

```bash
# Unix/Mac/Linux
curl -fsSL https://raw.githubusercontent.com/YOUR-USERNAME/my-claude-agents/main/scripts/auto-install.sh | bash

# Or with wget
wget -qO- https://raw.githubusercontent.com/YOUR-USERNAME/my-claude-agents/main/scripts/auto-install.sh | bash
```

**Windows PowerShell version** (scripts/auto-install.ps1):

```powershell
# Auto-install script for Windows
$ErrorActionPreference = "Stop"

Write-Host "🚀 Installing My Claude Agents..." -ForegroundColor Cyan

# Install to user profile
$InstallDir = "$env:USERPROFILE\.claude-agents"

if (Test-Path $InstallDir) {
    Write-Host "📦 Updating existing installation..." -ForegroundColor Yellow
    Set-Location $InstallDir
    git pull
} else {
    Write-Host "📦 Cloning repository..." -ForegroundColor Yellow
    git clone https://github.com/YOUR-USERNAME/my-claude-agents.git $InstallDir
    Set-Location $InstallDir
}

# Build
Write-Host "🔨 Building agents..." -ForegroundColor Yellow
npm install
npm run build

# Add to Claude Code
Write-Host "🔗 Adding to Claude Code..." -ForegroundColor Yellow
claude mcp add smart-reviewer node "$InstallDir/packages/smart-reviewer/dist/mcp-server.js" --scope user
claude mcp add test-generator node "$InstallDir/packages/test-generator/dist/mcp-server.js" --scope user
claude mcp add architecture-analyzer node "$InstallDir/packages/architecture-analyzer/dist/mcp-server.js" --scope user

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host "📊 Verifying..." -ForegroundColor Cyan
claude mcp list
```

Users run:

```powershell
# Windows
iwr https://raw.githubusercontent.com/YOUR-USERNAME/my-claude-agents/main/scripts/auto-install.ps1 | iex
```

---

## Option 4: Docker Distribution (Advanced)

For enterprise or isolated environments:

```dockerfile
FROM node:20-slim

WORKDIR /app
COPY . .
RUN npm install && npm run build

# Expose MCP stdio
CMD ["node", "packages/smart-reviewer/dist/mcp-server.js"]
```

---

## Comparison

| Method    | Ease (Users) | Ease (You) | Updates | Best For            |
| --------- | ------------ | ---------- | ------- | ------------------- |
| NPM       | ⭐⭐⭐⭐⭐   | ⭐⭐⭐     | Auto    | Public distribution |
| GitHub    | ⭐⭐⭐       | ⭐⭐⭐⭐⭐ | Manual  | Open source         |
| One-liner | ⭐⭐⭐⭐     | ⭐⭐⭐⭐   | Manual  | Quick sharing       |
| Docker    | ⭐⭐         | ⭐⭐       | Manual  | Enterprise          |

---

## Recommended: NPM + GitHub

**Best practice**: Combine both:

1. **Publish to NPM** for easy installation
2. **Host on GitHub** for development/issues
3. **Provide one-liner** as alternative

Your README would show:

````markdown
## Quick Install

### Option A: NPM (Recommended)

```bash
claude mcp add smart-reviewer "npx @YOUR-NAME/smart-reviewer-mcp" --scope user
```
````

### Option B: One-Liner

```bash
curl -fsSL https://your-url/install.sh | bash
```

### Option C: Manual

See [Installation Guide](INSTALLATION.md)

```

---

## Next Steps

1. Choose your distribution method
2. Update package.json files
3. Create installation scripts
4. Test on fresh machine
5. Document in README.md
6. Share with community!
```
