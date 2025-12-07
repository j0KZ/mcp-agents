#!/usr/bin/env node
/* global require, console, process */

/**
 * Universal MCP Tools + Skills Installer
 * Works on Windows, Mac, and Linux
 *
 * Usage:
 *   npx @j0kz/mcp-agents install     # Install everything
 *   npx @j0kz/mcp-agents tools        # Install tools only
 *   npx @j0kz/mcp-agents skills       # Download skills only
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = {
  success: msg => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: msg => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: msg => console.log(`${colors.yellow}${msg}${colors.reset}`),
  cyan: msg => console.log(`${colors.cyan}${msg}${colors.reset}`),
};

// Banner
function showBanner() {
  console.log(
    colors.green +
      `
╔════════════════════════════════════════╗
║   🚀 MCP Tools + Skills Installer      ║
║   One command, complete setup          ║
╚════════════════════════════════════════╝
` +
      colors.reset
  );
}

// Download file helper
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, response => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          https.get(response.headers.location, redirectResponse => {
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          });
        } else {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }
      })
      .on('error', reject);
  });
}

// Install MCP Tools
async function installTools() {
  log.info('\n📦 Installing MCP Tools...');
  console.log('This will configure 10 MCP tools in your AI editor\n');

  try {
    // Run the MCP installer
    execSync('npx @j0kz/mcp-agents@latest', {
      stdio: 'inherit',
      shell: true,
    });
    log.success('MCP Tools installed successfully!');
    return true;
  } catch (error) {
    log.error('MCP Tools installation failed');
    console.error(error.message);
    return false;
  }
}

// Download Universal Skills
async function downloadSkills(targetDir = null) {
  log.info('\n📚 Downloading Universal Skills for Claude...');
  console.log('Installing 10 optimized, project-agnostic developer skills\n');

  // Determine installation directory
  const skillsDir = targetDir || path.join(process.cwd(), '.claude', 'universal-skills');

  // Check if .claude folder exists, create if not
  const claudeDir = path.dirname(skillsDir);
  if (!fs.existsSync(claudeDir)) {
    log.info(`Creating .claude folder for Claude configuration...`);
    fs.mkdirSync(claudeDir, { recursive: true });

    // Create a .claude/README.md to explain the folder
    const claudeReadme = `# Claude Configuration Folder

This folder contains configuration and skills for Claude AI assistant.

## Contents

- **universal-skills/**: 10 project-agnostic developer skills that work in ANY project
- **skills/**: Project-specific skills (if any)
- **references/**: Reference documentation (if any)

## Universal Skills Available

1. **quick-pr-review** - Pre-PR checklist (30 seconds)
2. **debug-detective** - Systematic debugging
3. **performance-hunter** - Find bottlenecks
4. **legacy-modernizer** - Modernize old code
5. **zero-to-hero** - Master any codebase
6. **test-coverage-boost** - 0% to 80% coverage
7. **tech-debt-tracker** - Manage technical debt
8. **dependency-doctor** - Fix package issues
9. **security-first** - Security checklist
10. **api-integration** - Connect to any API

## Usage

These skills are automatically available to Claude when you open this project.
Simply ask Claude to use a specific skill:

- "Apply the debug-detective skill to find this bug"
- "Use the quick-pr-review checklist"
- "Follow the zero-to-hero guide"
`;
    fs.writeFileSync(path.join(claudeDir, 'README.md'), claudeReadme);
  }

  // Create skills directory
  fs.mkdirSync(skillsDir, { recursive: true });

  const skills = [
    {
      name: 'quick-pr-review',
      description: 'Universal pre-PR checklist - 30 seconds to better PRs',
    },
    {
      name: 'debug-detective',
      description: 'Systematic debugging for any language or bug type',
    },
    {
      name: 'performance-hunter',
      description: 'Find the 20% causing 80% of performance issues',
    },
    {
      name: 'legacy-modernizer',
      description: 'Safely modernize 20-year-old code without breaking',
    },
    {
      name: 'zero-to-hero',
      description: 'Master any codebase in hours, not weeks',
    },
    {
      name: 'test-coverage-boost',
      description: 'Strategic path from 0% to 80% test coverage',
    },
    {
      name: 'tech-debt-tracker',
      description: 'Quantify technical debt in hours and dollars',
    },
    {
      name: 'dependency-doctor',
      description: 'Diagnose and heal package management problems',
    },
    {
      name: 'security-first',
      description: 'OWASP Top 10 protection checklist',
    },
    {
      name: 'api-integration',
      description: 'Universal patterns for any third-party API',
    },
  ];

  const baseUrl = 'https://raw.githubusercontent.com/j0KZ/mcp-agents/main/docs/universal-skills';

  try {
    // Download INDEX.md
    console.log('  📥 Downloading skill index...');
    await downloadFile(`${baseUrl}/INDEX.md`, path.join(skillsDir, 'INDEX.md'));

    // Download each skill with progress
    let completed = 0;
    for (const skill of skills) {
      completed++;
      console.log(`  [${completed}/${skills.length}] Installing ${skill.name}...`);
      console.log(`      ${colors.cyan}${skill.description}${colors.reset}`);

      const skillDir = path.join(skillsDir, skill.name);
      fs.mkdirSync(skillDir, { recursive: true });

      await downloadFile(`${baseUrl}/${skill.name}/SKILL.md`, path.join(skillDir, 'SKILL.md'));
    }

    // Create a skills manifest for Claude
    const manifest = {
      version: '1.0.0',
      skills: skills.map(s => ({
        name: s.name,
        description: s.description,
        path: `${s.name}/SKILL.md`,
        type: 'universal',
        compatibility: 'any-project',
      })),
      created: new Date().toISOString(),
      source: 'https://github.com/j0KZ/mcp-agents',
    };

    fs.writeFileSync(path.join(skillsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    log.success(`✅ Universal skills installed in ${path.relative(process.cwd(), skillsDir)}/`);
    log.info('📖 Claude can now access these skills automatically when you open this project');
    return true;
  } catch (error) {
    log.error('Failed to download skills');
    console.error(error.message);

    // Provide fallback instructions
    console.log('\n' + colors.yellow + 'Alternative: View skills online at:' + colors.reset);
    console.log('https://github.com/j0KZ/mcp-agents/tree/main/docs/universal-skills\n');
    return false;
  }
}

// Create quick reference
function createQuickReference() {
  log.info('\n📝 Creating quick reference file...');

  const content = `# MCP Tools & Skills Quick Reference

## 🚀 Installed Components

### MCP Tools (10)
Automated tools that work through your AI editor:
- **Smart Reviewer** - Code quality analysis
- **Test Generator** - Comprehensive test creation
- **Security Scanner** - Vulnerability detection
- **Architecture Analyzer** - Dependency analysis
- **API Designer** - REST/GraphQL design
- **DB Schema Designer** - Database design
- **Doc Generator** - Documentation automation
- **Refactor Assistant** - Code refactoring
- **Orchestrator** - Workflow automation
- **Auto-Pilot** - Automated fixes

### Universal Skills (10)
Project-agnostic guides in \`.claude/universal-skills/\`:
1. **quick-pr-review** - Pre-PR checklist (30 seconds)
2. **debug-detective** - Systematic debugging
3. **performance-hunter** - Find bottlenecks
4. **legacy-modernizer** - Modernize old code
5. **zero-to-hero** - Master any codebase
6. **test-coverage-boost** - 0% to 80% coverage
7. **tech-debt-tracker** - Manage technical debt
8. **dependency-doctor** - Fix package issues
9. **security-first** - Security checklist
10. **api-integration** - Connect to any API

## 💬 Quick Commands

### Using MCP Tools:
\`\`\`
"Review this file for issues"
"Generate tests with 80% coverage"
"Find security vulnerabilities"
"Check MCP server status"
\`\`\`

### Using Universal Skills:
\`\`\`
"Apply the debug-detective skill"
"Use quick-pr-review checklist"
"Follow the zero-to-hero guide"
\`\`\`

## 📚 Documentation

- **MCP Tools Wiki**: https://github.com/j0KZ/mcp-agents/wiki
- **Universal Skills**: .claude/universal-skills/INDEX.md
- **Report Issues**: https://github.com/j0KZ/mcp-agents/issues

## ⚡ Quick Test

After restarting your editor, try:
1. "Review my package.json"
2. "What universal skills are available?"

---
*Generated by @j0kz/mcp-agents installer*
`;

  fs.writeFileSync('MCP-REFERENCE.md', content);
  log.success('Created MCP-REFERENCE.md');
}

// Main installer
async function main() {
  showBanner();

  const args = process.argv.slice(2);
  const command = args[0] || 'install';

  let toolsSuccess = false;
  let skillsSuccess = false;

  switch (command) {
    case 'tools':
      toolsSuccess = await installTools();
      break;

    case 'skills':
      skillsSuccess = await downloadSkills();
      break;

    case 'install':
    default:
      // Install both
      toolsSuccess = await installTools();
      skillsSuccess = await downloadSkills();
      break;
  }

  // Always create reference if something was installed
  if (toolsSuccess || skillsSuccess) {
    createQuickReference();
  }

  // Summary
  console.log('\n' + colors.green + '═'.repeat(44) + colors.reset);
  log.cyan('           ✨ Setup Complete! ✨');
  console.log(colors.green + '═'.repeat(44) + colors.reset);

  console.log('\n📋 What was installed:');
  if (toolsSuccess) console.log('  ✅ MCP Tools (10 automated tools)');
  if (skillsSuccess) console.log('  ✅ Universal Skills (10 guides)');
  console.log('  ✅ Quick Reference (MCP-REFERENCE.md)');

  if (toolsSuccess) {
    log.info('\n⚠️  IMPORTANT: Restart your AI editor to activate MCP tools');
  }

  console.log('\n🎯 Next steps:');
  console.log('  1. Restart your editor (Claude/Cursor/Windsurf)');
  console.log('  2. Try: "Review my code for issues"');
  console.log('  3. Read: MCP-REFERENCE.md');

  console.log('\n' + colors.cyan + 'Happy coding! 🚀' + colors.reset + '\n');
}

// Run
main().catch(error => {
  log.error('Installation failed:');
  console.error(error);
  process.exit(1);
});
