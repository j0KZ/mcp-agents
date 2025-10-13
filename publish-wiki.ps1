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
git commit -m "feat: Add ambiguity detection and bilingual support to Orchestrator

🎯 Orchestrator Wiki Updates:

**Orchestrator.md**:
- Added 'NEW: Ambiguity Detection' section with examples
- Documented smart focus areas (security, quality, performance, comprehensive)
- Added bilingual examples (English/Spanish)
- Updated API reference with new parameters (focus, language)
- Documented focus area to workflow mapping

**Home.md**:
- Test count badge updated: 388 passing tests
- Already includes bilingual support

**Key Features Documented:**
✅ Smart ambiguity detection with focus areas
✅ Bilingual support (English/Spanish)
✅ New optional parameters: focus, language
✅ 3x faster execution with targeted workflows
✅ Natural conversational UX examples

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

Write-Host "`n4. Pushing to GitHub..." -ForegroundColor Yellow
git push origin master

# Step 4: Cleanup
cd ..
Remove-Item wiki-temp -Recurse -Force

Write-Host "`n✅ Wiki published successfully!" -ForegroundColor Green
Write-Host "Visit: https://github.com/j0kz/mcp-agents/wiki" -ForegroundColor Cyan
