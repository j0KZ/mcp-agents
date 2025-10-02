# How to Publish the Wiki - Step by Step

The wiki repository doesn't exist yet because the Wiki feature needs to be enabled on GitHub first.

## ✅ Quick Steps (5 minutes)

### Step 1: Enable Wiki Feature

1. Go to: https://github.com/j0kz/mcp-agents/settings
2. Scroll to **"Features"** section
3. Check the box: ✓ **Wikis**
4. Click **"Save"**

### Step 2: Create First Wiki Page (This initializes the wiki repo)

1. Go to: https://github.com/j0kz/mcp-agents/wiki
2. Click **"Create the first page"**
3. Enter:
   - **Title**: `Home`
   - **Content**: Copy from `wiki/Home.md` (or just type "Home page")
4. Click **"Save Page"**

✨ **This creates the wiki repository!**

### Step 3: Clone Wiki Repository

```powershell
# Now the wiki repo exists, you can clone it
git clone https://github.com/j0kz/mcp-agents.wiki.git
```

### Step 4: Copy Wiki Files

```powershell
# Copy all wiki markdown files
Copy-Item wiki\*.md mcp-agents.wiki\ -Force
```

### Step 5: Push to GitHub

```powershell
cd mcp-agents.wiki
git add .
git commit -m "Add comprehensive MCP Agents documentation"
git push origin master
```

### Step 6: Verify

Visit: https://github.com/j0kz/mcp-agents/wiki

---

## 🚀 Automated Script (After Step 2)

After you've created the first page, run this:

```powershell
.\publish-wiki.ps1
```

The script will:
1. Clone wiki repo
2. Copy all files
3. Commit changes
4. Push to GitHub
5. Clean up

---

## 🎯 Alternative: Manual Page-by-Page

If you prefer to create pages manually:

### 1. Home Page
- Go to https://github.com/j0kz/mcp-agents/wiki
- Click "Edit" on Home page
- Copy content from `wiki/Home.md`
- Save

### 2. Quick Start
- Click "New Page"
- Title: `Quick-Start`
- Copy content from `wiki/Quick-Start.md`
- Save

### 3. Smart Reviewer
- Click "New Page"
- Title: `Smart-Reviewer`
- Copy content from `wiki/Smart-Reviewer.md`
- Save

### 4. Integration Patterns
- Click "New Page"
- Title: `Integration-Patterns`
- Copy content from `wiki/Integration-Patterns.md`
- Save

### 5. Troubleshooting
- Click "New Page"
- Title: `Troubleshooting`
- Copy content from `wiki/Troubleshooting.md`
- Save

---

## 📋 Wiki Files to Publish

You have 6 wiki pages ready:

| File | Size | Description |
|------|------|-------------|
| Home.md | 7.9KB | Main landing page |
| Quick-Start.md | 6.4KB | Getting started guide |
| Smart-Reviewer.md | 8.9KB | Smart Reviewer docs |
| Integration-Patterns.md | 16KB | Integration guide |
| Troubleshooting.md | 11KB | Troubleshooting guide |
| README.md | 7.8KB | Wiki setup instructions |

**Total**: 2,554 lines of documentation

---

## 🔧 Troubleshooting

### Error: "Repository not found"

**Cause**: Wiki feature not enabled or first page not created

**Solution**:
1. Enable Wiki in repo settings
2. Create the first page manually on GitHub
3. Then clone the wiki repo

### Error: "src refspec master does not match any"

**Cause**: Trying to push to wrong repo (main repo instead of wiki)

**Solution**:
```powershell
# Make sure you're in the wiki directory
cd mcp-agents.wiki
git push origin master
```

### Wiki Repo Still Not Found?

Some repositories need the wiki to be accessed first:

1. Go to https://github.com/j0kz/mcp-agents/wiki
2. If you see "Welcome to the wiki!", click **"Create the first page"**
3. Add any content (will be replaced)
4. Save
5. Now clone: `git clone https://github.com/j0kz/mcp-agents.wiki.git`

---

## 📝 Next Steps After Publishing

1. **Verify all pages** work: https://github.com/j0kz/mcp-agents/wiki
2. **Test internal links** between pages
3. **Check formatting** renders correctly
4. **Add remaining pages** (see wiki/README.md for TODO list)
5. **Enable wiki edits** or protect pages in settings

---

## 🎉 Success Checklist

After publishing, verify:

- [ ] Home page loads with table of contents
- [ ] Quick Start page has all installation methods
- [ ] Smart Reviewer page has complete documentation
- [ ] Integration Patterns page has workflow examples
- [ ] Troubleshooting page has all solutions
- [ ] Internal links work (e.g., `[Quick Start](Quick-Start)`)
- [ ] Code blocks render with syntax highlighting
- [ ] Tables display correctly
- [ ] Emojis and badges show up

---

## 💡 Pro Tips

1. **Wiki Pages = File Names**: `wiki/Quick-Start.md` → GitHub wiki page `Quick-Start`
2. **Spaces in Links**: Use hyphens (e.g., `[Integration Patterns](Integration-Patterns)`)
3. **Home Page**: Must be named exactly `Home.md` to be the wiki homepage
4. **Edit Permissions**: Set in Settings > Features > Wikis > Restrict editing
5. **Custom Sidebar**: Create `_Sidebar.md` for custom navigation

---

## 🔄 Updating Wiki Later

To update the wiki after initial publish:

```powershell
# 1. Clone or pull latest
git clone https://github.com/j0kz/mcp-agents.wiki.git
# or: cd mcp-agents.wiki && git pull

# 2. Update files from main repo
Copy-Item ..\wiki\*.md . -Force

# 3. Commit and push
git add .
git commit -m "Update wiki documentation"
git push origin master
```

Or use the automation workflow in `.github/workflows/wiki.yml` (see WIKI_SETUP.md)

---

**Ready?** Start with Step 1: Enable Wiki feature on GitHub! 🚀
