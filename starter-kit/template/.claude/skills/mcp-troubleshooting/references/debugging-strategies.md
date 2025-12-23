# Debugging Strategies for MCP Tools

Systematic debugging approach for diagnosing and resolving MCP tool issues.

---

## Strategy 1: Isolate the Problem

### Component Testing Checklist

**Test each layer independently:**

**1. Node.js**
```bash
node --version
# Expected: v18.x.x or higher
```

**2. npm**
```bash
npm --version
# Expected: 9.x.x or higher
```

**3. npx**
```bash
npx --version
# Expected: 9.x.x or higher
```

**4. Package registry access**
```bash
npm ping
# Expected: Ping success: {time}
```

**5. Single MCP tool (standalone)**
```bash
npx @j0kz/smart-reviewer-mcp --help
# Should output help text or tool info
```

**6. Tool in editor**
```
Ask: "Review my package.json"
# Should use smart-reviewer tool
```

**Diagnosis:**
- If step fails → problem at that layer
- If all pass → configuration issue

---

## Strategy 2: Check Logs

### Claude Code Logs

**Log locations:**

**Windows:**
```
%AppData%\Claude\logs\
```

**Full path:**
```
C:\Users\YourName\AppData\Roaming\Claude\logs\
```

**Mac:**
```
~/Library/Logs/Claude/
```

**Full path:**
```
/Users/YourName/Library/Logs/Claude/
```

**Linux:**
```
~/.config/Claude/logs/
```

---

### Viewing Logs

**Windows:**
```powershell
# View latest log
type "$env:APPDATA\Claude\logs\mcp-*.log" | Select -Last 50

# Open in notepad
notepad "$env:APPDATA\Claude\logs\mcp-latest.log"
```

**Mac/Linux:**
```bash
# Tail latest log
tail -f ~/Library/Logs/Claude/mcp-*.log

# View last 100 lines
tail -100 ~/Library/Logs/Claude/mcp-latest.log

# Search for errors
grep -i error ~/Library/Logs/Claude/mcp-*.log
```

---

### What to Look For

**MCP server startup:**
```
[INFO] Starting MCP server: smart-reviewer
[INFO] Command: npx @j0kz/smart-reviewer-mcp
[INFO] Server started successfully
```

**Connection errors:**
```
[ERROR] Failed to connect to MCP server: smart-reviewer
[ERROR] Connection timeout after 30000ms
[ERROR] Server process exited with code 1
```

**Module not found:**
```
[ERROR] Cannot find module '@j0kz/smart-reviewer-mcp'
[ERROR] ERR_MODULE_NOT_FOUND
```

**JSON parse errors:**
```
[ERROR] Failed to parse config file
[ERROR] Unexpected token } in JSON at position 45
```

---

### Other Editor Logs

**Cursor:**
- Check Cursor developer tools (Help → Toggle Developer Tools)
- Console tab for errors

**VS Code (Continue):**
- View → Output → Continue
- Check for MCP-related errors

**Windsurf:**
- Check Windsurf documentation for log location

---

## Strategy 3: Minimal Reproduction

### Create Minimal Test Case

**1. Simplify config to one tool:**

```json
{
  "mcpServers": {
    "test-tool": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"],
      "type": "stdio"
    }
  }
}
```

**2. Restart editor**

**3. Test single tool:**
```
"Review my package.json"
```

**4. If works:**
- Add tools back one by one
- Identify which tool causes issue

**5. If doesn't work:**
- Problem with environment or editor
- Focus debugging on that layer

---

### Binary Search for Config Issues

**If multiple tools, find problematic one:**

**Step 1: Test with half the tools**
```json
{
  "mcpServers": {
    "smart-reviewer": { ... },
    "test-generator": { ... },
    "architecture-analyzer": { ... },
    "security-scanner": { ... }
    // Removed other 5
  }
}
```

**Step 2: If works:**
- Problem in removed half
- Test that half

**Step 3: If doesn't work:**
- Problem in current half
- Split again

**Step 4: Repeat until found**

---

## Strategy 4: Environment Validation

### Comprehensive Environment Check

```bash
# Node.js version
node --version
# Need: 18.0.0 or higher

# npm version
npm --version
# Need: 9.0.0 or higher

# Network connectivity
ping registry.npmjs.org
# Should: Reply successfully

# npm config
npm config list
# Check: registry, proxy settings

# Installed global packages
npm list -g --depth=0
# Check: Any @j0kz packages

# npm cache size
du -sh ~/.npm  # Mac/Linux
# Large cache may indicate corruption

# PATH variable
echo $PATH  # Mac/Linux
echo %PATH%  # Windows
# Should: Include npm global bin
```

---

### Network Diagnostics

**Test npm registry:**
```bash
# Basic connectivity
npm ping

# Fetch specific package
npm view @j0kz/smart-reviewer-mcp version

# Download package (test)
npm pack @j0kz/smart-reviewer-mcp
```

**If behind proxy:**
```bash
# Configure proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Or use environment variables
export HTTP_PROXY=http://proxy:8080
export HTTPS_PROXY=http://proxy:8080
```

---

## Strategy 5: Clean Slate

### Nuclear Option (Start Fresh)

**1. Clear all caches:**
```bash
# npm cache
npm cache clean --force

# npx cache
rm -rf ~/.npm/_npx  # Mac/Linux
del /s /q "%APPDATA%\npm-cache\_npx"  # Windows

# Editor cache (Claude Code)
# Windows
rmdir /s /q "%LOCALAPPDATA%\Claude\Cache"

# Mac
rm -rf ~/Library/Caches/Claude

# Linux
rm -rf ~/.cache/Claude
```

**2. Backup config:**
```bash
# Claude Code (Mac)
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json ~/backup-config.json

# Cursor
cp ~/.cursor/mcp_config.json ~/backup-mcp-config.json
```

**3. Delete config:**
```bash
# Claude Code (Mac)
rm ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Cursor
rm ~/.cursor/mcp_config.json
```

**4. Reinstall:**
```bash
npx @j0kz/mcp-agents@latest
```

**5. Restart editor fully**

**6. Test**

---

## Common Error Patterns

### Error: "Module not found"

**Symptoms:**
```
Error: Cannot find module '@j0kz/smart-reviewer-mcp'
ERR_MODULE_NOT_FOUND
```

**Diagnosis:**
```bash
# Check if package exists
npm view @j0kz/smart-reviewer-mcp version

# Try manual install
npx @j0kz/smart-reviewer-mcp --help
```

**Solutions:**
1. Clear npm cache: `npm cache clean --force`
2. Clear npx cache: `rm -rf ~/.npm/_npx`
3. Reinstall: `npx @j0kz/mcp-agents@latest`
4. Check network connectivity

---

### Error: "Permission denied"

**Symptoms:**
```
EACCES: permission denied
Error: EPERM: operation not permitted
```

**Diagnosis:**
```bash
# Check file permissions
ls -la ~/.config/Claude/claude_desktop_config.json

# Check npm permissions
npm config get prefix
```

**Solutions:**

**Mac/Linux:**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Windows:**
```powershell
# Run as Administrator
# Right-click PowerShell → "Run as Administrator"
```

---

### Error: "Timeout"

**Symptoms:**
```
Connection timeout after 30000ms
Server process took too long to start
```

**Diagnosis:**
```bash
# Test network speed
npm ping

# Test package download
time npx @j0kz/smart-reviewer-mcp --help
```

**Solutions:**

**Increase timeout:**
```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"],
      "timeout": 60000  // 60 seconds
    }
  }
}
```

**Use global install (faster):**
```bash
npm install -g @j0kz/smart-reviewer-mcp

# Update config
{
  "command": "smart-reviewer-mcp",
  "args": []
}
```

---

### Error: "JSON parse error"

**Symptoms:**
```
Unexpected token } in JSON
Failed to parse config file
```

**Diagnosis:**
```bash
# Validate JSON
cat ~/.config/Claude/claude_desktop_config.json | python -m json.tool
```

**Common causes:**
- Trailing comma
- Missing quotes
- Comments in JSON
- Unclosed brackets

**Solution:**
Use JSON validator (jsonlint.com) or recreate config

---

## Advanced Debugging

### Enable Debug Mode

**Environment variable:**
```bash
# Mac/Linux
export DEBUG=mcp:*

# Windows (PowerShell)
$env:DEBUG="mcp:*"
```

**Then restart editor**

**View detailed logs**

---

### Network Debugging

**Trace npm requests:**
```bash
# Verbose npm
npm install @j0kz/smart-reviewer-mcp --verbose

# With timing
npm install @j0kz/smart-reviewer-mcp --timing
```

**Check DNS:**
```bash
nslookup registry.npmjs.org
```

---

### Process Debugging

**Check running processes:**

**Mac/Linux:**
```bash
# Find Node processes
ps aux | grep node

# Find npx processes
ps aux | grep npx

# Kill stuck process
kill -9 <PID>
```

**Windows:**
```powershell
# Find Node processes
Get-Process node

# Kill process
Stop-Process -Name node -Force
```

---

## When to Report a Bug

### Pre-Report Checklist

Before reporting, verify:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm cache cleared (`npm cache clean --force`)
- [ ] Latest version used (`npx @j0kz/mcp-agents@latest`)
- [ ] Editor fully restarted (ALL windows closed)
- [ ] Config file valid JSON (validated)
- [ ] Tested with single tool (minimal config)
- [ ] Checked logs for errors
- [ ] Issue reproducible (happens consistently)

---

### Bug Report Template

```markdown
## Bug Report

### Description
[Clear description of the issue]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [See error]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- **OS**: [Windows 11 / macOS 14 / Ubuntu 22.04]
- **Editor**: [Claude Code v1.2.3]
- **Node.js**: [v20.10.0]
- **npm**: [v10.2.3]
- **Package Version**: [@j0kz/smart-reviewer-mcp@1.0.36]

### Config File
\`\`\`json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"]
    }
  }
}
\`\`\`

### Error Messages
\`\`\`
[Paste error from logs]
\`\`\`

### Logs
\`\`\`
[Relevant log excerpts]
\`\`\`

### Already Tried
- [X] Cleared npm cache
- [X] Restarted editor
- [X] Validated JSON config
- [X] Tested with minimal config
```

---

### Where to Report

**GitHub Issues:**
```
https://github.com/j0KZ/mcp-agents/issues
```

**Include:**
- Label: `bug`
- Complete bug report (use template)
- Screenshots if relevant
- Log files (sanitized)

---

## Quick Debugging Checklist

### 5-Minute Quick Fix

```bash
# 1. Clear cache
npm cache clean --force

# 2. Reinstall
npx @j0kz/mcp-agents@latest

# 3. Restart editor (fully close ALL windows)

# 4. Test
# Ask: "What MCP tools are available?"
```

**If this doesn't work:** Proceed with systematic debugging

---

### Systematic Debugging Flow

```
1. Test Node.js/npm → If fails: Reinstall Node.js
   ↓
2. Test network → If fails: Check proxy/firewall
   ↓
3. Test package → If fails: Clear cache, retry
   ↓
4. Check config → If invalid: Fix JSON syntax
   ↓
5. Check logs → Find specific error
   ↓
6. Minimal repro → Isolate issue
   ↓
7. Report bug → With full details
```

---

## Related

- See `installation-guide.md` for installation steps
- See `platform-config-guide.md` for config details
- See main SKILL.md for complete troubleshooting guide

---

**Reference:** Debugging strategies for @j0kz/mcp-agents
**Tools:** Node.js, npm, npx diagnostics
**Project:** @j0kz/mcp-agents
