# PowerShell script to publish wiki

Write-Host "Publishing MCP Agents Wiki..." -ForegroundColor Green

# Step 1: Clone wiki (after you've created the first page on GitHub)
Write-Host "`n1. Cloning wiki repository..." -ForegroundColor Yellow
git clone https://github.com/j0kz/mcp-agents.wiki.git wiki-temp

# Step 2: Copy all wiki files
Write-Host "`n2. Copying wiki files..." -ForegroundColor Yellow
Copy-Item wiki\*.md wiki-temp\ -Force

# Step 3: Commit and push
Write-Host "`n3. Committing changes..." -ForegroundColor Yellow
cd wiki-temp
git add .
git commit -m "refactor: Streamline wiki - bilingual support, remove redundancy

🎯 Major Wiki Overhaul:

**Home.md**: Added bilingual support, instant health check, removed redundancy
**Quick-Start.md**: Cut from 198 to 126 lines (-36%), added Spanish examples
**All 9 Tool Pages**: Refactored from 3,538 to 1,946 lines (-45%)

**Key Improvements:**
✅ Bilingual examples (English/Spanish) for all tools
✅ Natural language commands throughout
✅ Realistic 'What You Get' output examples
✅ Removed duplicate installation sections
✅ Added Qoder support mentions
✅ Consistent structure across all pages

Before: 3,845 lines (English-only, verbose, redundant)
After: 2,192 lines (bilingual, concise, action-oriented)

See full changes: https://github.com/j0KZ/mcp-agents/commit/[HASH]"

Write-Host "`n4. Pushing to GitHub..." -ForegroundColor Yellow
git push origin master

# Step 4: Cleanup
cd ..
Remove-Item wiki-temp -Recurse -Force

Write-Host "`n✅ Wiki published successfully!" -ForegroundColor Green
Write-Host "Visit: https://github.com/j0kz/mcp-agents/wiki" -ForegroundColor Cyan
