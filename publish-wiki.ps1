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
git commit -m "Add comprehensive MCP Agents documentation

- Main landing page with overview
- Quick start guide (5 minutes)
- Smart Reviewer documentation
- Integration patterns and workflows
- Troubleshooting guide
- Setup instructions

Total: 2,554 lines of documentation"

Write-Host "`n4. Pushing to GitHub..." -ForegroundColor Yellow
git push origin master

# Step 4: Cleanup
cd ..
Remove-Item wiki-temp -Recurse -Force

Write-Host "`n✅ Wiki published successfully!" -ForegroundColor Green
Write-Host "Visit: https://github.com/j0kz/mcp-agents/wiki" -ForegroundColor Cyan
