# Configuration Wizard - Design Document

## Overview

Interactive CLI wizard that configures MCP tools for any supported editor with smart defaults and project detection.

**Goal:** Reduce setup time from 10+ minutes to < 1 minute with zero errors.

## Package Details

- **Name:** `@j0kz/mcp-config-wizard`
- **Bin:** `mcp-configure`
- **Entry:** `npx @j0kz/mcp-config-wizard` or `npx mcp-configure`
- **Version:** Start at 1.0.0 (independent from main toolkit)

## User Experience

### Target Flow

```bash
$ npx @j0kz/mcp-config-wizard

🎯 MCP Agents Configuration Wizard
───────────────────────────────────

Detected: Node.js 20.x, TypeScript project, Jest tests

? Select your editor: (Use arrow keys)
❯ Claude Code
  Cursor
  Windsurf
  VS Code (with Continue)
  Roo Code
  Other / Manual

? Which MCP tools do you want? (Space to select, Enter to continue)
❯ ◉ Smart Reviewer (code quality)
  ◉ Security Scanner (vulnerabilities)
  ◉ Test Generator (auto-generate tests)
  ◯ Architecture Analyzer (dependencies)
  ◯ Refactor Assistant (code improvements)
  ◯ API Designer (REST/GraphQL)
  ◯ DB Schema Designer (database)
  ◯ Doc Generator (documentation)

? Code review severity: (Use arrow keys)
  Lenient (minimal noise)
❯ Moderate (balanced)
  Strict (catch everything)

? Test framework: (Auto-detected: Jest)
❯ Jest ✓ detected
  Vitest
  Mocha
  Ava
  Other

✨ Configuration complete!

📁 Created: ~/.config/claude-code/mcp_settings.json
✅ Installed: 3 MCP packages
🎯 Next: Restart Claude Code

Try it: Ask Claude "Review my code" or "Scan for vulnerabilities"
```

## Architecture

### Core Components

```
packages/config-wizard/
├── src/
│   ├── index.ts           # CLI entry point
│   ├── wizard.ts          # Main wizard orchestration
│   ├── detectors/
│   │   ├── editor.ts      # Detect installed editors
│   │   ├── project.ts     # Detect project type (framework, language)
│   │   ├── test-framework.ts  # Detect test setup
│   │   └── index.ts
│   ├── prompts/
│   │   ├── editor-select.ts
│   │   ├── mcp-select.ts
│   │   ├── preferences.ts
│   │   └── index.ts
│   ├── generators/
│   │   ├── claude-code.ts    # Generate Claude Code config
│   │   ├── cursor.ts         # Generate Cursor config
│   │   ├── windsurf.ts       # Generate Windsurf config
│   │   ├── vscode.ts         # Generate VS Code config
│   │   └── index.ts
│   ├── installer.ts       # Install selected MCPs
│   ├── validator.ts       # Validate config before writing
│   └── utils/
│       ├── file-system.ts # Safe file operations
│       ├── logger.ts      # Pretty console output
│       └── spinner.ts     # Loading indicators
├── tests/
│   └── wizard.test.ts
├── package.json
└── README.md
```

### Dependencies

```json
{
  "dependencies": {
    "inquirer": "^10.0.0", // Interactive prompts
    "ora": "^8.0.0", // Spinners
    "chalk": "^5.3.0", // Colors
    "execa": "^9.0.0", // Execute npm/npx
    "fs-extra": "^11.0.0", // File operations
    "detect-package-manager": "^3.0.0" // npm/yarn/pnpm
  }
}
```

## Features

### 1. Smart Detection

**Editor Detection:**

```typescript
// Check for installed editors
const editors = await detectInstalledEditors();
// Returns: ['claude-code', 'cursor', 'vscode']

// Auto-select if only one found
if (editors.length === 1) {
  selectedEditor = editors[0];
  console.log(`✓ Detected: ${selectedEditor}`);
}
```

**Project Detection:**

```typescript
// Analyze package.json, tsconfig.json, etc.
const project = await detectProject();
// {
//   language: 'typescript',
//   framework: 'react',
//   testFramework: 'jest',
//   packageManager: 'npm'
// }
```

### 2. Smart Defaults

**Recommended MCPs by Project Type:**

```typescript
const recommendations = {
  react: ['smart-reviewer', 'test-generator', 'security-scanner'],
  node: ['smart-reviewer', 'security-scanner', 'api-designer'],
  backend: ['api-designer', 'db-schema', 'security-scanner'],
  library: ['smart-reviewer', 'test-generator', 'doc-generator'],
};
```

**Auto-select based on detection:**

- TypeScript project → enable type checking in reviewer
- React project → suggest test-generator with React Testing Library
- API project → suggest api-designer + db-schema

### 3. Config Generation

**Claude Code Example:**

```typescript
async function generateClaudeCodeConfig(selections) {
  const config = {
    mcpServers: {},
  };

  for (const mcp of selections.mcps) {
    config.mcpServers[mcp.name] = {
      command: 'npx',
      args: [`@j0kz/${mcp.package}@^1.0.0`],
      ...mcp.config, // Custom config per MCP
    };
  }

  const configPath = path.join(os.homedir(), '.config/claude-code/mcp_settings.json');

  await fs.writeJSON(configPath, config, { spaces: 2 });
}
```

**Cursor Example:**

```typescript
async function generateCursorConfig(selections) {
  const configPath =
    process.platform === 'win32'
      ? path.join(process.env.APPDATA, 'Cursor/User/mcp_config.json')
      : path.join(os.homedir(), '.cursor/mcp_config.json');

  // Same structure as Claude Code
  await fs.writeJSON(configPath, config, { spaces: 2 });
}
```

### 4. Installation

```typescript
async function installMCPs(selections) {
  const spinner = ora('Installing MCP packages...').start();

  for (const mcp of selections.mcps) {
    spinner.text = `Installing ${mcp.name}...`;

    // Pre-install to avoid npx delays
    await execa('npm', ['install', '-g', `@j0kz/${mcp.package}@^1.0.0`]);
  }

  spinner.succeed('All MCPs installed!');
}
```

### 5. Validation

```typescript
async function validateConfig(config) {
  const issues = [];

  // Check Node version
  const nodeVersion = process.version;
  if (!semver.satisfies(nodeVersion, '>=18.0.0')) {
    issues.push('Node.js 18+ required');
  }

  // Check editor exists
  if (!(await editorExists(config.editor))) {
    issues.push(`Editor not found: ${config.editor}`);
  }

  // Check MCP compatibility
  for (const mcp of config.mcps) {
    if (!(await isMCPCompatible(mcp, config.editor))) {
      issues.push(`${mcp.name} not compatible with ${config.editor}`);
    }
  }

  return issues;
}
```

## Prompts Design

### 1. Editor Selection

```typescript
{
  type: 'list',
  name: 'editor',
  message: 'Select your editor:',
  choices: [
    { name: 'Claude Code (Anthropic)', value: 'claude-code' },
    { name: 'Cursor (Anysphere)', value: 'cursor' },
    { name: 'Windsurf (Codeium)', value: 'windsurf' },
    { name: 'VS Code + Continue', value: 'vscode-continue' },
    { name: 'Roo Code', value: 'roo' },
    new inquirer.Separator(),
    { name: 'Other / Manual setup', value: 'manual' }
  ],
  default: detectedEditor
}
```

### 2. MCP Selection

```typescript
{
  type: 'checkbox',
  name: 'mcps',
  message: 'Which MCP tools do you want?',
  choices: [
    {
      name: 'Smart Reviewer (code quality)',
      value: 'smart-reviewer',
      checked: true  // Recommended
    },
    {
      name: 'Security Scanner (vulnerabilities)',
      value: 'security-scanner',
      checked: true
    },
    {
      name: 'Test Generator (auto-generate tests)',
      value: 'test-generator',
      checked: projectHasTests
    },
    // ... other MCPs
  ]
}
```

### 3. Preferences

```typescript
{
  type: 'list',
  name: 'reviewSeverity',
  message: 'Code review severity:',
  choices: [
    { name: 'Lenient (minimal noise)', value: 'lenient' },
    { name: 'Moderate (balanced)', value: 'moderate' },
    { name: 'Strict (catch everything)', value: 'strict' }
  ],
  default: 'moderate'
}
```

## Error Handling

```typescript
try {
  await runWizard();
} catch (error) {
  if (error.name === 'ConfigWriteError') {
    console.error('Failed to write config file');
    console.log('Troubleshooting:');
    console.log('- Check file permissions');
    console.log('- Ensure editor is closed');
  } else if (error.name === 'InstallError') {
    console.error('Failed to install MCPs');
    console.log('Try manually: npm install -g @j0kz/smart-reviewer-mcp');
  } else {
    console.error('Unexpected error:', error.message);
    console.log('Please report at: https://github.com/j0KZ/mcp-agents/issues');
  }
  process.exit(1);
}
```

## Testing Strategy

```typescript
describe('Configuration Wizard', () => {
  it('detects installed editors', async () => {
    const editors = await detectInstalledEditors();
    expect(editors).toBeArray();
  });

  it('generates valid Claude Code config', async () => {
    const selections = {
      editor: 'claude-code',
      mcps: ['smart-reviewer', 'security-scanner'],
    };
    const config = await generateConfig(selections);
    expect(config).toMatchSchema(claudeCodeSchema);
  });

  it('validates Node version requirement', async () => {
    const issues = await validateConfig({ nodeVersion: '16.0.0' });
    expect(issues).toContain('Node.js 18+ required');
  });
});
```

## CLI Flags (Advanced)

```bash
# Non-interactive mode
npx mcp-configure --editor=claude-code --mcps=smart-reviewer,security-scanner

# Show detected config without installing
npx mcp-configure --dry-run

# Force overwrite existing config
npx mcp-configure --force

# Specify custom config path
npx mcp-configure --output=./mcp-config.json

# Verbose output
npx mcp-configure --verbose
```

## Success Criteria

✅ **Setup time < 1 minute** for standard cases
✅ **Zero errors** for common editors (Claude Code, Cursor, Windsurf)
✅ **Smart defaults** reduce choices by 50%
✅ **Config validation** catches issues before write
✅ **Clear error messages** with actionable fixes

## Future Enhancements

- [ ] **Import existing config** - Migrate from ESLint, Prettier
- [ ] **Team presets** - Share config via URL
- [ ] **CI/CD mode** - Auto-generate workflow files
- [ ] **Update wizard** - Check for new MCPs, update versions
- [ ] **Plugin marketplace** - Community MCP discovery

## Implementation Timeline

**Week 1:**

- Day 1-2: Core wizard + editor detection
- Day 3-4: Config generators (Claude Code, Cursor, Windsurf)
- Day 5: MCP installation + validation

**Testing & Polish:**

- Day 6: Testing, error handling
- Day 7: Documentation, examples

## Dependencies on Other Work

- ✅ CI/CD templates (done) - Can suggest adding workflows
- ⏳ Performance Profiler MCP (future) - Add to MCP list when ready
- ⏳ Migration Assistant MCP (future) - Add to MCP list when ready

---

**Status:** Design complete, ready for implementation
**Priority:** CRITICAL (next after CI/CD templates)
**Estimated Effort:** 1 week
**Impact:** High - Massive reduction in setup friction
