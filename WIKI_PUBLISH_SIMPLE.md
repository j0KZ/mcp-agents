# Simple Wiki Publishing Guide

## ⚠️ Important: GitHub Wiki Must Be Enabled First

The wiki repository **does not exist yet** because:
1. Wiki feature is not enabled on your GitHub repo
2. You haven't created the first wiki page

## ✅ Step-by-Step Instructions

### Step 1: Enable Wiki on GitHub

1. Open your browser and go to:
   ```
   https://github.com/j0kz/mcp-agents/settings
   ```

2. Scroll down to the **"Features"** section

3. Find **"Wikis"** and check the checkbox ✓

4. Click **"Save changes"** (if there's a save button)

### Step 2: Create the First Wiki Page

1. Go to:
   ```
   https://github.com/j0kz/mcp-agents/wiki
   ```

2. You should see a button **"Create the first page"** - click it

3. Fill in:
   - **Page title**: `Home`
   - **Content**: Copy ALL content from `wiki/Home.md` file
     - Or just type anything for now (you'll replace it in Step 4)

4. Click **"Save Page"** at the bottom

**✨ This creates the wiki git repository!**

### Step 3: Clone Wiki Repository

Now the wiki repository exists, so you can clone it:

```powershell
# Make sure you're in the project directory
cd D:\Users\j0KZ\Documents\Coding\my-claude-agents

# Clone the wiki (this should work now)
git clone https://github.com/j0kz/mcp-agents.wiki.git wiki-repo
```

### Step 4: Copy All Wiki Files

```powershell
# Copy all markdown files to the wiki repo
Copy-Item wiki\*.md wiki-repo\ -Force
```

### Step 5: Commit and Push

```powershell
cd wiki-repo
git add .
git commit -m "Add comprehensive MCP Agents documentation

- Main landing page with overview
- Quick start guide (5 minutes)
- Smart Reviewer documentation
- Integration patterns and workflows
- Troubleshooting guide
- Setup instructions"

git push origin master
```

### Step 6: Verify

Open your browser and go to:
```
https://github.com/j0kz/mcp-agents/wiki
```

You should see all 6 wiki pages! 🎉

---

## 🎯 Quick Commands (After Step 2)

Once you've enabled wiki and created the first page, run these commands all at once:

```powershell
# Navigate to project
cd D:\Users\j0KZ\Documents\Coding\my-claude-agents

# Clone wiki
git clone https://github.com/j0kz/mcp-agents.wiki.git wiki-repo

# Copy files
Copy-Item wiki\*.md wiki-repo\ -Force

# Push to GitHub
cd wiki-repo
git add .
git commit -m "Add comprehensive wiki documentation"
git push origin master

# Cleanup
cd ..
Remove-Item wiki-repo -Recurse -Force

# Done!
Write-Host "✅ Wiki published! Visit: https://github.com/j0kz/mcp-agents/wiki" -ForegroundColor Green
```

---

## 🔧 Troubleshooting

### "Repository not found" when cloning

**Problem**: Wiki repository doesn't exist yet

**Solution**:
1. Make sure you enabled Wikis in Settings
2. Make sure you created the first page (Step 2)
3. Wait 30 seconds and try again

### "destination path already exists"

**Problem**: Old clone attempt left files

**Solution**:
```powershell
Remove-Item mcp-agents.wiki -Recurse -Force
# Then try cloning again
```

### "Failed to push" or "master does not exist"

**Problem**: Trying to push to main repo instead of wiki

**Solution**:
```powershell
# Make sure you're in the wiki-repo directory
cd wiki-repo
git push origin master  # Wiki uses 'master', not 'main'
```

---

## 📝 What Gets Published

6 wiki pages (2,554 lines total):

1. **Home** - Main landing page with navigation
2. **Quick-Start** - 5-minute setup guide
3. **Smart-Reviewer** - Complete tool documentation
4. **Integration-Patterns** - Workflow examples
5. **Troubleshooting** - Common issues and solutions
6. **README** - Wiki maintenance instructions

---

## ✅ Success Checklist

After publishing, verify:

- [ ] Wiki is accessible at `https://github.com/j0kz/mcp-agents/wiki`
- [ ] Home page displays with table of contents
- [ ] All 6 pages are listed in sidebar
- [ ] Internal links work (click "Quick Start" from Home)
- [ ] Code blocks have syntax highlighting
- [ ] Tables render correctly

---

## 🎉 You're Done!

Once published, share your wiki:
- Link in README: `[📚 Wiki](https://github.com/j0kz/mcp-agents/wiki)`
- Link in package.json: `"homepage": "https://github.com/j0kz/mcp-agents/wiki"`
- Tweet about it with screenshots!

---

**Need help?** Open an issue: https://github.com/j0kz/mcp-agents/issues
