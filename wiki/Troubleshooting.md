# Troubleshooting Guide

Common issues and solutions for MCP Agents.

## 🔍 Quick Diagnostics

Run these checks first:

```bash
# Verify Node.js version
node --version  # Should be 18+

# Check npm global packages
npm list -g --depth=0 | grep mcp

# Test MCP directly
npx @j0kz/smart-reviewer-mcp --help

# Check editor logs
# Claude Code: View > Output > MCP
# Cursor: View > Output > MCP Servers
```

## 🚨 Common Issues

### 1. MCP Not Found

**Symptoms**:
- "Command not found: smart-reviewer-mcp"
- MCP doesn't appear in editor
- Tools list is empty

**Solutions**:

#### Solution A: Add npm bin to PATH

```bash
# Check npm prefix
npm config get prefix

# Add to PATH (Linux/Mac)
echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.bashrc
source ~/.bashrc

# Add to PATH (Windows PowerShell)
$env:Path += ";$(npm config get prefix)"
```

#### Solution B: Use npx (No PATH needed)

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["-y", "@j0kz/smart-reviewer-mcp"]
    }
  }
}
```

#### Solution C: Use absolute path

```bash
# Find package location
npm list -g @j0kz/smart-reviewer-mcp

# Use full path in config
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "/usr/local/lib/node_modules/@j0kz/smart-reviewer-mcp/dist/mcp-server.js"
    }
  }
}
```

### 2. Permission Errors

**Symptoms**:
- "EACCES: permission denied"
- "Cannot create directory"
- Installation fails

**Solutions**:

#### For Linux/Mac:

```bash
# Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Or change npm prefix (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Reinstall packages
npm install -g @j0kz/smart-reviewer-mcp
```

#### For Windows:

```powershell
# Run as Administrator
npm install -g @j0kz/smart-reviewer-mcp

# Or use npx (no permissions needed)
npx @j0kz/smart-reviewer-mcp
```

### 3. Configuration Errors

**Symptoms**:
- "Invalid JSON in config"
- MCP fails to start
- Editor shows config error

**Solutions**:

#### Validate JSON syntax:

```bash
# Use JSON validator
cat ~/.config/claude-code/mcp_settings.json | jq .

# Common errors:
# ❌ Trailing commas
# ❌ Missing quotes
# ❌ Wrong brackets
```

#### Correct format:

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "smart-reviewer-mcp",
      "args": []
    }
  }
}
```

### 4. Slow Performance

**Symptoms**:
- MCP takes minutes to respond
- Editor becomes unresponsive
- High CPU/memory usage

**Solutions**:

#### Solution A: Enable caching

```typescript
// In your MCP usage
const analyzer = new CodeAnalyzer(); // Uses caching automatically
const result = await analyzer.analyzeFile(path); // 90%+ faster on repeat
```

#### Solution B: Limit scope

```
❌ "Review all files in this project" (slow)
✅ "Review src/index.ts" (fast)

❌ "Analyze entire codebase" (slow)
✅ "Analyze src/api/" (fast)
```

#### Solution C: Increase Node memory

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "node",
      "args": [
        "--max-old-space-size=4096",
        "$(which smart-reviewer-mcp)"
      ]
    }
  }
}
```

#### Solution D: Exclude large directories

```json
{
  "config": {
    "excludePatterns": [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.min.js"
    ]
  }
}
```

### 5. Module Not Found

**Symptoms**:
- "Cannot find module '@mcp-tools/shared'"
- "Module not found: fast-glob"
- Import errors

**Solutions**:

#### Solution A: Reinstall dependencies

```bash
# Global package
npm uninstall -g @j0kz/smart-reviewer-mcp
npm install -g @j0kz/smart-reviewer-mcp

# Project package
rm -rf node_modules package-lock.json
npm install
```

#### Solution B: Clear npm cache

```bash
npm cache clean --force
npm install -g @j0kz/smart-reviewer-mcp
```

#### Solution C: Check Node.js version

```bash
node --version  # Must be 18+
npm --version   # Must be 8+
```

### 6. TypeScript Errors

**Symptoms**:
- "Cannot find type definitions"
- "Property X does not exist"
- Compilation errors

**Solutions**:

```bash
# Install type definitions
npm install --save-dev @types/node

# Rebuild TypeScript
npm run build

# Check tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### 7. Workspace Issues

**Symptoms**:
- "Unsupported URL Type 'workspace:'"
- Monorepo errors
- Dependency resolution fails

**Solutions**:

#### For npm workspaces:

```json
// packages/smart-reviewer/package.json
{
  "dependencies": {
    "@mcp-tools/shared": "file:../shared"  // Not "workspace:*"
  }
}
```

#### Install from root:

```bash
# From monorepo root
npm install

# Build all packages
npm run build --workspaces
```

### 8. File Path Issues

**Symptoms**:
- "File not found"
- "ENOENT" errors
- Wrong path resolution

**Solutions**:

#### Use absolute paths:

```typescript
import path from 'path';

const absolutePath = path.resolve('./src/index.ts');
await reviewer.review(absolutePath);
```

#### Handle Windows paths:

```typescript
import { normalizePath } from '@mcp-tools/shared';

const normalized = normalizePath('C:\\Users\\file.ts');
// Returns: 'C:/Users/file.ts'
```

### 9. Cache Issues

**Symptoms**:
- Stale results
- Changes not detected
- Wrong analysis output

**Solutions**:

#### Clear cache:

```typescript
// In code
analyzer.clearCache();

// Manually
rm -rf ~/.cache/mcp-agents
```

#### Force fresh analysis:

```typescript
// Disable cache for specific operation
const result = await fsManager.readFile(path, false); // useCache = false
```

#### Check cache stats:

```typescript
const stats = analyzer.getCacheStats();
console.log(`Hit rate: ${stats.analysisCache.hitRate}%`);

// Low hit rate? Cache might be too small
const analyzer = new CodeAnalyzer();
analyzer.cache = new AnalysisCache(1000, 3600000); // Larger cache
```

### 10. Integration Errors

**Symptoms**:
- Pipeline hangs
- Steps don't execute
- Results not passed between tools

**Solutions**:

#### Add logging:

```typescript
const pipeline = new MCPPipeline();

pipeline.addStep({
  name: 'step1',
  execute: async (input) => {
    console.log('Step 1 input:', input);
    const result = await doWork();
    console.log('Step 1 output:', result);
    return result;
  }
});
```

#### Add timeouts:

```typescript
pipeline.addStep({
  name: 'step1',
  timeout: 30000, // 30 seconds
  execute: async () => { /* ... */ }
});
```

#### Check dependencies:

```typescript
// Verify dependency exists
pipeline.addStep({
  name: 'step2',
  dependsOn: ['step1'], // Must match step name exactly
  execute: async (input) => {
    if (!input[0]) {
      throw new Error('No results from step1');
    }
    return process(input[0]);
  }
});
```

## 🔧 Debug Mode

### Enable Verbose Logging

```bash
# Set environment variable
export DEBUG=mcp:*

# Run with debug
DEBUG=mcp:* npx @j0kz/smart-reviewer-mcp
```

### Check MCP Logs

```bash
# Claude Code logs
tail -f ~/Library/Logs/Claude\ Code/mcp.log

# Cursor logs
tail -f ~/Library/Application\ Support/Cursor/logs/mcp.log
```

### Test MCP Directly

```bash
# Test without editor
node dist/mcp-server.js <<EOF
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
EOF
```

## 📊 Performance Profiling

### Measure Execution Time

```typescript
import { measure } from '@mcp-tools/shared';

const { result, duration } = await measure(
  async () => analyzer.analyze(path),
  'analyze-operation'
);

console.log(`Analysis took ${duration}ms`);
```

### Monitor Memory Usage

```typescript
const monitor = new PerformanceMonitor();
monitor.start();

await heavyOperation();

const metrics = monitor.stop();
console.log(`Memory used: ${metrics.memoryUsed}MB`);
```

### Profile with Node.js

```bash
# CPU profiling
node --prof dist/mcp-server.js

# Process prof file
node --prof-process isolate-*.log > profile.txt

# Memory profiling
node --inspect dist/mcp-server.js
# Then open chrome://inspect
```

## 🆘 Getting Help

### Before Opening an Issue

1. **Check this guide** - Solution might be here
2. **Search existing issues** - Someone might have faced this
3. **Gather information**:
   ```bash
   node --version
   npm --version
   npm list -g @j0kz/smart-reviewer-mcp
   cat mcp_config.json
   ```

### Opening an Issue

Include:
- **Environment**: OS, Node version, editor
- **Configuration**: MCP config (sanitized)
- **Error message**: Full error text
- **Steps to reproduce**: Minimal reproduction
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens

### Issue Template

```markdown
**Environment**:
- OS: macOS 13.0
- Node: v20.0.0
- Editor: Claude Code 1.0
- MCP: @j0kz/smart-reviewer-mcp@1.0.8

**Configuration**:
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["-y", "@j0kz/smart-reviewer-mcp"]
    }
  }
}

**Error**:
Error: Cannot find module '@mcp-tools/shared'

**Steps to Reproduce**:
1. Install smart-reviewer globally
2. Configure in Claude Code
3. Run "Review src/index.ts"

**Expected**: Should review file
**Actual**: Module not found error
```

## 📚 Additional Resources

- [GitHub Issues](https://github.com/j0kz/mcp-agents/issues) - Search/report issues
- [GitHub Discussions](https://github.com/j0kz/mcp-agents/discussions) - Ask questions
- [Common Issues](Common-Issues) - FAQ
- [Performance Tips](Performance-Tips) - Optimization guide

## 🔍 Diagnostic Scripts

### Check MCP Installation

```bash
#!/bin/bash
# check-mcp.sh

echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo ""
echo "Global MCP packages:"
npm list -g | grep mcp
echo ""
echo "npm prefix: $(npm config get prefix)"
echo "PATH includes npm bin: "
echo $PATH | grep -o "$(npm config get prefix)/bin" && echo "✓ Yes" || echo "✗ No"
```

### Test MCP Server

```bash
#!/bin/bash
# test-mcp.sh

MCP_NAME=$1

if [ -z "$MCP_NAME" ]; then
  echo "Usage: ./test-mcp.sh <mcp-name>"
  exit 1
fi

echo "Testing $MCP_NAME..."
echo ""

# Test command exists
which $MCP_NAME-mcp && echo "✓ Command found" || echo "✗ Command not found"

# Test with npx
npx -y @j0kz/$MCP_NAME-mcp --help && echo "✓ npx works" || echo "✗ npx failed"

# Test JSON-RPC
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | \
  npx -y @j0kz/$MCP_NAME-mcp && \
  echo "✓ JSON-RPC works" || \
  echo "✗ JSON-RPC failed"
```

---

**[← Back to Home](Home)** | **[Common Issues →](Common-Issues)**
