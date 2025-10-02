# Setting Up the Wiki

This directory contains the wiki content for the MCP Agents repository.

## 📚 Publishing to GitHub Wiki

GitHub wikis are separate git repositories. To publish this wiki:

### Method 1: Clone and Push (Recommended)

```bash
# 1. Clone the wiki repository
git clone https://github.com/j0kz/mcp-agents.wiki.git

# 2. Copy wiki files
cp -r wiki/* mcp-agents.wiki/

# 3. Commit and push
cd mcp-agents.wiki
git add .
git commit -m "Add comprehensive wiki documentation"
git push origin master
```

### Method 2: Manual Creation

1. Go to your GitHub repository
2. Click on "Wiki" tab
3. Click "Create the first page"
4. Copy content from `wiki/Home.md`
5. Repeat for each wiki page

### Method 3: GitHub CLI

```bash
# Install GitHub CLI if needed
brew install gh  # macOS
# or download from https://cli.github.com/

# Enable wiki
gh repo edit --enable-wiki

# Clone wiki
gh repo clone j0kz/mcp-agents.wiki

# Copy and push
cp -r wiki/* mcp-agents.wiki/
cd mcp-agents.wiki
git add .
git commit -m "Add wiki"
git push
```

## 📋 Wiki Structure

```
wiki/
├── Home.md                      # Main landing page
├── Quick-Start.md               # Getting started guide
├── Smart-Reviewer.md            # Smart Reviewer documentation
├── Integration-Patterns.md      # Tool integration guide
├── Troubleshooting.md           # Common issues and solutions
├── Configuration.md             # Configuration guide (TODO)
├── Architecture-Analyzer.md     # Architecture Analyzer docs (TODO)
├── Test-Generator.md            # Test Generator docs (TODO)
├── Security-Scanner.md          # Security Scanner docs (TODO)
├── API-Designer.md              # API Designer docs (TODO)
├── DB-Schema-Designer.md        # DB Schema docs (TODO)
├── Doc-Generator.md             # Doc Generator docs (TODO)
├── Refactor-Assistant.md        # Refactor Assistant docs (TODO)
├── Shared-Utilities.md          # Shared package docs (TODO)
├── Performance-Optimization.md  # Performance guide (TODO)
├── Custom-Workflows.md          # Custom workflows (TODO)
├── Examples.md                  # Usage examples (TODO)
├── API-Reference.md             # Complete API docs (TODO)
├── Contributing.md              # Contribution guide (TODO)
├── Common-Issues.md             # FAQ (TODO)
└── README.md                    # This file
```

## ✅ Completed Pages

- ✅ Home.md - Main wiki landing page with overview
- ✅ Quick-Start.md - 5-minute setup guide
- ✅ Smart-Reviewer.md - Complete Smart Reviewer documentation
- ✅ Integration-Patterns.md - Tool integration and workflows
- ✅ Troubleshooting.md - Common issues and solutions

## 📝 TODO Pages

Create these pages next:

1. **Configuration.md** - Detailed configuration for all editors
2. **Architecture-Analyzer.md** - Full Architecture Analyzer docs
3. **Test-Generator.md** - Test generation documentation
4. **Security-Scanner.md** - Security scanning guide
5. **API-Designer.md** - API design documentation
6. **DB-Schema-Designer.md** - Database schema guide
7. **Doc-Generator.md** - Documentation generation
8. **Refactor-Assistant.md** - Refactoring guide
9. **Shared-Utilities.md** - @mcp-tools/shared documentation
10. **Performance-Optimization.md** - Caching and optimization
11. **Custom-Workflows.md** - Building custom pipelines
12. **Examples.md** - Real-world examples
13. **API-Reference.md** - Complete API documentation
14. **Contributing.md** - How to contribute
15. **Common-Issues.md** - FAQ and solutions

## 🎨 Wiki Formatting

### Internal Links

Link to other wiki pages:
```markdown
[Quick Start](Quick-Start)
[Smart Reviewer](Smart-Reviewer)
```

### External Links

Link to GitHub:
```markdown
[Repository](https://github.com/j0kz/mcp-agents)
[Issues](https://github.com/j0kz/mcp-agents/issues)
```

### Code Blocks

Use triple backticks with language:
```markdown
​```typescript
const analyzer = new CodeAnalyzer();
​```

​```bash
npm install -g @j0kz/smart-reviewer-mcp
​```
```

### Tables

Use Markdown tables:
```markdown
| Tool | Description |
|------|-------------|
| Smart Reviewer | Code review |
| Test Generator | Test generation |
```

### Badges

Add badges for visual appeal:
```markdown
![npm](https://img.shields.io/npm/v/@j0kz/smart-reviewer-mcp)
![license](https://img.shields.io/badge/license-MIT-green)
```

## 🔧 Local Preview

Preview wiki locally before publishing:

### Using grip (GitHub Readme Instant Preview)

```bash
# Install grip
pip install grip

# Preview a page
grip wiki/Home.md
# Open http://localhost:6419
```

### Using VS Code

Install "Markdown Preview Enhanced" extension:
1. Open wiki file
2. Press `Cmd+K V` (Mac) or `Ctrl+K V` (Windows)
3. Preview appears side-by-side

### Using mdbook

```bash
# Install mdbook
cargo install mdbook

# Create book.toml
cat > book.toml <<EOF
[book]
title = "MCP Agents Wiki"
authors = ["j0kz"]

[build]
build-dir = "book"
EOF

# Build and serve
mdbook serve
# Open http://localhost:3000
```

## 📊 Wiki Maintenance

### Keeping Wiki Updated

1. **Update version numbers** when releasing new versions
2. **Add new features** to relevant documentation pages
3. **Update examples** with latest API changes
4. **Fix broken links** regularly
5. **Add screenshots** for visual clarity

### Wiki Checklist

When adding a new wiki page:

- [ ] Create markdown file in `wiki/` directory
- [ ] Add link to `Home.md` table of contents
- [ ] Add navigation links (← Back, Next →)
- [ ] Include code examples
- [ ] Add troubleshooting section
- [ ] Link to related pages
- [ ] Preview locally
- [ ] Commit and push to wiki repo

## 🚀 Automation

### Auto-deploy Wiki

Create `.github/workflows/wiki.yml`:

```yaml
name: Deploy Wiki

on:
  push:
    paths:
      - 'wiki/**'
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Clone wiki
        run: |
          git clone https://github.com/j0kz/mcp-agents.wiki.git wiki-repo

      - name: Copy files
        run: |
          cp -r wiki/* wiki-repo/

      - name: Push changes
        run: |
          cd wiki-repo
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git diff --quiet && git diff --staged --quiet || git commit -m "Auto-update wiki"
          git push
```

### Wiki Link Checker

Create `scripts/check-wiki-links.sh`:

```bash
#!/bin/bash

echo "Checking wiki links..."

# Find all markdown files
for file in wiki/*.md; do
  echo "Checking $file..."

  # Extract wiki links [text](Link)
  grep -oE '\[.*\]\([A-Z][a-zA-Z-]*\)' "$file" | \
    grep -oE '\([A-Z][a-zA-Z-]*\)' | \
    tr -d '()' | \
    while read link; do
      if [ ! -f "wiki/$link.md" ]; then
        echo "  ❌ Broken link: $link in $file"
      fi
    done
done

echo "Done!"
```

## 📝 Content Guidelines

### Writing Style

- **Be concise**: Get to the point quickly
- **Use examples**: Show, don't just tell
- **Add context**: Explain why, not just how
- **Include errors**: Show common mistakes
- **Link related**: Connect to other pages

### Structure Template

Each MCP documentation page should have:

```markdown
# Tool Name

Brief description

## 📦 Installation

## 🎯 Features

## 🚀 Usage

## 🔧 Available Tools

## 📊 Configuration

## 🎨 Examples

## 🛠️ Integration

## 📚 Best Practices

## 🆘 Troubleshooting

## 📖 See Also

---

[← Back to Home](Home) | [Next Tool →](Next-Tool)
```

## 🔗 Resources

- [GitHub Wiki Documentation](https://docs.github.com/en/communities/documenting-your-project-with-wikis)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)

---

**Ready to publish?** Follow the "Publishing to GitHub Wiki" steps above!
