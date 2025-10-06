#!/usr/bin/env node

/**
 * Automated Release Script
 * Handles version bumping, building, testing, and publishing
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

class ReleaseManager {
  constructor() {
    this.currentVersion = null;
    this.newVersion = null;
    this.releaseType = null;
  }

  async getCurrentVersion() {
    const versionFile = path.join(rootDir, 'version.json');
    const content = await fs.readFile(versionFile, 'utf-8');
    const { version } = JSON.parse(content);
    this.currentVersion = version;
    return version;
  }

  async promptForRelease() {
    const current = await this.getCurrentVersion();
    console.log(`\n📦 Current version: ${current}\n`);

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'releaseType',
        message: 'Select release type:',
        choices: [
          { name: `Patch (${this.getNextVersion('patch')}) - Bug fixes`, value: 'patch' },
          { name: `Minor (${this.getNextVersion('minor')}) - New features`, value: 'minor' },
          { name: `Major (${this.getNextVersion('major')}) - Breaking changes`, value: 'major' },
          { name: 'Custom version', value: 'custom' },
        ],
      },
      {
        type: 'input',
        name: 'customVersion',
        message: 'Enter custom version:',
        when: answers => answers.releaseType === 'custom',
        validate: input => {
          if (!/^\d+\.\d+\.\d+$/.test(input)) {
            return 'Version must be in format X.Y.Z';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'security',
        message: 'Is this a security release?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'dryRun',
        message: 'Perform dry run? (no actual publishing)',
        default: false,
      },
    ]);

    this.releaseType = answers.releaseType;
    this.newVersion =
      answers.releaseType === 'custom'
        ? answers.customVersion
        : this.getNextVersion(answers.releaseType);
    this.isSecurity = answers.security;
    this.dryRun = answers.dryRun;

    return answers;
  }

  getNextVersion(type) {
    const [major, minor, patch] = this.currentVersion.split('.').map(Number);

    switch (type) {
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'major':
        return `${major + 1}.0.0`;
      default:
        return this.currentVersion;
    }
  }

  async runPreReleaseChecks() {
    console.log('\n🔍 Running pre-release checks...\n');

    const checks = [
      {
        name: 'Git status',
        command: 'git status --porcelain',
        validate: output => output.trim() === '',
        error: 'Working directory not clean. Commit or stash changes first.',
      },
      {
        name: 'Current branch',
        command: 'git branch --show-current',
        validate: output => output.trim() === 'main',
        error: 'Not on main branch. Switch to main first.',
      },
      {
        name: 'Tests',
        command: 'npm test 2>&1 | tail -1',
        validate: output => !output.includes('failed'),
        error: 'Tests are failing. Fix tests before release.',
      },
      {
        name: 'Build',
        command: 'npm run build 2>&1 | tail -1',
        validate: output => !output.includes('error'),
        error: 'Build failed. Fix build errors before release.',
      },
    ];

    for (const check of checks) {
      process.stdout.write(`  ✓ ${check.name}... `);
      try {
        const output = execSync(check.command, { encoding: 'utf-8' });
        if (!check.validate(output)) {
          console.log('❌');
          throw new Error(check.error);
        }
        console.log('✅');
      } catch (error) {
        console.log('❌');
        throw new Error(check.error || error.message);
      }
    }

    console.log('\n✅ All pre-release checks passed!\n');
  }

  async updateVersion() {
    console.log(`\n📝 Updating version to ${this.newVersion}...\n`);

    // Update version.json
    const versionFile = path.join(rootDir, 'version.json');
    await fs.writeFile(
      versionFile,
      JSON.stringify(
        {
          version: this.newVersion,
          description:
            'Global version for all MCP packages. Update this file to bump all packages simultaneously.',
        },
        null,
        2
      )
    );

    // Sync versions across packages
    execSync('npm run version:sync', { stdio: 'inherit' });

    console.log('✅ Version updated across all packages\n');
  }

  async updateChangelog() {
    console.log('📝 Updating CHANGELOG.md...\n');

    const changelogPath = path.join(rootDir, 'CHANGELOG.md');
    const existingContent = await fs.readFile(changelogPath, 'utf-8');

    const date = new Date().toISOString().split('T')[0];
    const releaseTitle = this.isSecurity ? '🔒 Security Release' : '📦 Release';

    const newEntry = `## [${this.newVersion}] - ${date}

### ${releaseTitle}

**Changes:**
- TODO: Add release notes here

`;

    const updatedContent = existingContent.replace(
      '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n',
      `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${newEntry}`
    );

    await fs.writeFile(changelogPath, updatedContent);

    console.log('✅ CHANGELOG.md updated\n');
    console.log('⚠️  Remember to add proper release notes!\n');
  }

  async createGitCommit() {
    console.log('📝 Creating git commit...\n');

    const commitMessage = this.isSecurity
      ? `release: v${this.newVersion} - Security patch`
      : `release: v${this.newVersion}`;

    if (this.dryRun) {
      console.log(`  [DRY RUN] Would commit: "${commitMessage}"`);
    } else {
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      console.log('✅ Commit created\n');
    }
  }

  async createGitTag() {
    console.log('🏷️  Creating git tag...\n');

    const tag = `v${this.newVersion}`;
    const message = this.isSecurity
      ? `Security release ${this.newVersion}`
      : `Release ${this.newVersion}`;

    if (this.dryRun) {
      console.log(`  [DRY RUN] Would create tag: ${tag}`);
    } else {
      execSync(`git tag -a ${tag} -m "${message}"`, { stdio: 'inherit' });
      console.log(`✅ Tag ${tag} created\n`);
    }
  }

  async publishPackages() {
    console.log('📦 Publishing packages to npm...\n');

    if (this.dryRun) {
      console.log('  [DRY RUN] Would run: npm run publish-all');
      console.log('  [DRY RUN] Would run: cd installer && npm publish');
    } else {
      console.log('  Publishing workspace packages...');
      execSync('npm run publish-all', { stdio: 'inherit' });

      console.log('\n  Publishing installer package...');
      execSync('cd installer && npm publish', { stdio: 'inherit', cwd: rootDir });

      console.log('\n✅ All packages published\n');
    }
  }

  async pushToGit() {
    console.log('🚀 Pushing to git...\n');

    if (this.dryRun) {
      console.log('  [DRY RUN] Would run: git push');
      console.log('  [DRY RUN] Would run: git push --tags');
    } else {
      execSync('git push', { stdio: 'inherit' });
      execSync('git push --tags', { stdio: 'inherit' });
      console.log('✅ Pushed to remote\n');
    }
  }

  async createGitHubRelease() {
    console.log('📢 Creating GitHub release...\n');

    const releaseNotes = `# Release v${this.newVersion}

${this.isSecurity ? '⚠️ **Security Release**\n\n' : ''}

## Installation

\`\`\`bash
npm install @j0kz/smart-reviewer-mcp@${this.newVersion}
# Or install all tools
npx @j0kz/mcp-config-wizard
\`\`\`

## What's Changed

See [CHANGELOG.md](CHANGELOG.md) for details.
`;

    const releaseNotesFile = path.join(rootDir, `RELEASE_NOTES_v${this.newVersion}.md`);
    await fs.writeFile(releaseNotesFile, releaseNotes);

    if (this.dryRun) {
      console.log('  [DRY RUN] Would create GitHub release');
    } else {
      try {
        execSync(
          `gh release create v${this.newVersion} --title "v${this.newVersion}" --notes-file ${releaseNotesFile}`,
          {
            stdio: 'inherit',
          }
        );
        console.log('✅ GitHub release created\n');
      } catch (error) {
        console.log('⚠️  GitHub CLI not available. Create release manually.\n');
      }
    }
  }

  async run() {
    console.log('🚀 MCP Tools Release Manager\n');
    console.log('================================\n');

    try {
      // Get release details
      await this.promptForRelease();

      console.log(`\n📋 Release Summary:`);
      console.log(`  Current: ${this.currentVersion}`);
      console.log(`  New:     ${this.newVersion}`);
      console.log(`  Type:    ${this.releaseType}`);
      console.log(`  Security: ${this.isSecurity ? 'Yes' : 'No'}`);
      console.log(`  Dry Run: ${this.dryRun ? 'Yes' : 'No'}\n`);

      const confirm = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Proceed with release?',
          default: false,
        },
      ]);

      if (!confirm.proceed) {
        console.log('\n❌ Release cancelled\n');
        return;
      }

      // Run release steps
      if (!this.dryRun) {
        await this.runPreReleaseChecks();
      }

      await this.updateVersion();
      await this.updateChangelog();
      await this.createGitCommit();
      await this.createGitTag();
      await this.publishPackages();
      await this.pushToGit();
      await this.createGitHubRelease();

      // Success!
      console.log('🎉 Release complete!\n');
      console.log(`✨ Version ${this.newVersion} has been released!\n`);

      if (this.dryRun) {
        console.log('📝 This was a dry run. No actual changes were made.\n');
      } else {
        console.log('📝 Next steps:');
        console.log('  1. Update release notes in CHANGELOG.md');
        console.log('  2. Announce the release');
        console.log('  3. Monitor for issues\n');
      }
    } catch (error) {
      console.error('\n❌ Release failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manager = new ReleaseManager();
  manager.run().catch(console.error);
}

export { ReleaseManager };
