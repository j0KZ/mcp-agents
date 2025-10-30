#!/usr/bin/env node
/**
 * Auto-Pilot CLI - The laziest way to perfect code
 * Just run `auto-pilot` and forget about everything else
 */

import { Command } from 'commander';
import { AutoPilot } from './index.js';
import { ContextDetector } from './context-detector.js';
import { SmartAnalyzer } from './smart-analyzer.js';
import { AutoFixer } from './auto-fixer.js';
import { GitHooks } from './git-hooks.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('auto-pilot')
  .description('🚀 Zero-effort automation for lazy developers')
  .version(packageJson.version)
  .option('--no-hooks', 'Skip git hooks installation')
  .option('--no-watch', 'Skip file watching')
  .option('--no-fix', 'Skip auto-fixing')
  .option('--quiet', 'Less output');

// Default command - start everything
program.action(async options => {
  console.log(`
╔═══════════════════════════════════════════╗
║        🚀 AUTO-PILOT v${packageJson.version}         ║
║   Zero-Effort Automation for Lazy Devs    ║
╚═══════════════════════════════════════════╝
`);

  const pilot = new AutoPilot();
  await pilot.start();
});

// Subcommands for specific actions
program
  .command('fix [files...]')
  .description('Auto-fix specific files or everything')
  .action(async files => {
    const fixer = new AutoFixer();

    if (files && files.length > 0) {
      console.log(`🔧 Auto-fixing ${files.length} files...`);
      for (const file of files) {
        await fixer.autoFix(file);
      }
    } else {
      console.log('🔧 Auto-fixing everything...');
      await fixer.fixEverything();
    }

    console.log('✅ Auto-fix complete!');
  });

program
  .command('analyze [path]')
  .description('Analyze project or specific path')
  .option('-f, --full', 'Run full analysis')
  .action(async (path, options) => {
    const analyzer = new SmartAnalyzer();

    console.log('🔍 Analyzing project...');

    if (options.full) {
      const results = await analyzer.fullScan();
      console.log('\n📊 Analysis Results:');
      console.log(`  Issues: ${results.issues.length}`);
      console.log(`  Critical: ${results.critical ? 'YES ⚠️' : 'No'}`);

      if (results.issues.length > 0) {
        console.log('\n🔴 Top Issues:');
        results.issues.slice(0, 5).forEach((issue: any) => {
          console.log(`  • [${issue.severity}] ${issue.message}`);
        });
      }
    } else if (path) {
      const analysis = await analyzer.analyzeFile(path);
      console.log('\n📊 File Analysis:');
      console.log(`  Complexity: ${analysis.complexity}`);
      console.log(`  Has Tests: ${analysis.hasTests ? '✅' : '❌'}`);
      console.log(`  Security Issues: ${analysis.security.issues.length}`);
      console.log(`  Quality Score: ${analysis.quality.score}/100`);

      if (analysis.suggestions.length > 0) {
        console.log('\n💡 Suggestions:');
        analysis.suggestions.forEach((s: any) => console.log(`  • ${s}`));
      }
    }
  });

program
  .command('detect')
  .description('Detect project context and configuration')
  .action(async () => {
    const detector = new ContextDetector();
    const context = await detector.detect();

    console.log('\n🔍 Project Detection Results:\n');
    console.log(`📝 Language: ${context.language}`);
    console.log(`🏗️  Framework: ${context.framework || 'None'}`);
    console.log(`📦 Package Manager: ${context.packageManager}`);
    console.log(`🧪 Test Runner: ${context.testRunner || 'None'}`);
    console.log(`🔧 Build Tool: ${context.buildTool || 'None'}`);
    console.log(`🎨 Linter: ${context.linter || 'None'}`);
    console.log(`✨ Formatter: ${context.formatter || 'None'}`);
    console.log(`📁 Structure: ${context.structure}`);
    console.log(`📊 Files: ${context.fileCount}`);
    console.log(
      `🔧 MCP Tools: ${context.mcpTools.length > 0 ? context.mcpTools.join(', ') : 'None'}`
    );

    console.log('\n🏷️  Flags:');
    console.log(`  Git: ${context.hasGit ? '✅' : '❌'}`);
    console.log(`  Docker: ${context.hasDocker ? '✅' : '❌'}`);
    console.log(`  CI/CD: ${context.hasCI ? '✅' : '❌'}`);
    console.log(`  Production: ${context.isProduction ? '✅' : '❌'}`);
  });

program
  .command('hooks')
  .description('Install git hooks for automation')
  .option('--husky', 'Use Husky instead of native hooks')
  .action(async options => {
    const hooks = new GitHooks();

    console.log('📦 Installing git hooks...');

    if (options.husky) {
      await hooks.setupHusky();
      await hooks.setupLintStaged();
    } else {
      await hooks.installAll();
    }

    console.log('✅ Git hooks installed!');
  });

program
  .command('watch')
  .description('Start file watcher for auto-fixes')
  .action(async () => {
    console.log('👀 Starting file watcher...');
    console.log('   Files will be auto-fixed on save!');
    console.log('   Press Ctrl+C to stop\n');

    const pilot = new AutoPilot();
    const detector = new ContextDetector();
    const context = await detector.detect();

    // Only start the watcher
    pilot['watchFiles'](context);

    // Keep process alive
    process.stdin.resume();
  });

program
  .command('pre-commit')
  .description('Run pre-commit checks (called by git hook)')
  .action(async () => {
    const hooks = new GitHooks();
    const fixer = new AutoFixer();
    const analyzer = new SmartAnalyzer();

    const files = await hooks.getStagedFiles();

    if (files.length === 0) {
      console.log('✅ No files to check');
      process.exit(0);
    }

    console.log(`🔍 Checking ${files.length} staged files...`);

    // Auto-fix each file
    for (const file of files) {
      if (file.match(/\.(js|jsx|ts|tsx)$/)) {
        await fixer.autoFix(file);
      }
    }

    // Run tests
    const coverage = await analyzer.checkCoverage();
    if (!coverage.passing) {
      console.log(`⚠️ Warning: ${coverage.message}`);
    }

    console.log('✅ Pre-commit checks complete');
    process.exit(0);
  });

program
  .command('pre-push')
  .description('Run pre-push validation (called by git hook)')
  .action(async () => {
    const analyzer = new SmartAnalyzer();

    console.log('🚀 Running pre-push validation...');

    // Run full analysis
    const results = await analyzer.fullScan();

    if (results.critical) {
      console.log('❌ Critical issues found! Cannot push.');
      console.log('🔧 Run `auto-pilot fix` to attempt auto-fix');
      process.exit(1);
    }

    // Check coverage
    const coverage = await analyzer.checkCoverage();
    if (!coverage.passing) {
      console.log(`⚠️ Warning: ${coverage.message}`);
    }

    console.log('✅ Pre-push validation passed');
    process.exit(0);
  });

program
  .command('doctor')
  .description('Check Auto-Pilot health and configuration')
  .action(async () => {
    console.log('🏥 Running Auto-Pilot health check...\n');

    const detector = new ContextDetector();
    const hooks = new GitHooks();
    const context = await detector.detect();

    const checks = {
      'Git Repository': context.hasGit,
      'Package.json': context.packageManager !== 'none',
      'Test Runner': context.testRunner !== 'none',
      Linter: context.linter !== 'none',
      'Git Hooks': await hooks.areHooksInstalled(),
      'MCP Tools': context.mcpTools.length > 0,
    };

    let allGood = true;

    for (const [check, passed] of Object.entries(checks)) {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
      if (!passed) allGood = false;
    }

    if (allGood) {
      console.log('\n🎉 Everything looks good! Auto-Pilot is ready.');
    } else {
      console.log('\n⚠️ Some checks failed. Run `auto-pilot` to set everything up.');
    }
  });

// Easter egg command for fun
program
  .command('lazy')
  .description('The ultimate lazy mode')
  .action(async () => {
    console.log(`
╔════════════════════════════════════════════════╗
║              🦥 ULTRA LAZY MODE 🦥              ║
╠════════════════════════════════════════════════╣
║                                                ║
║  You're too lazy to even run auto-pilot?      ║
║  Fine, I'll do EVERYTHING for you...          ║
║                                                ║
║  ✅ Fixed all your bugs                        ║
║  ✅ Added 100% test coverage                   ║
║  ✅ Removed all security issues                ║
║  ✅ Optimized performance by 420%              ║
║  ✅ Added documentation everywhere             ║
║  ✅ Deployed to production                     ║
║  ✅ Got you a promotion                        ║
║                                                ║
║  Just kidding! Run 'auto-pilot' for real      ║
║  automation. But I like your style! 😄         ║
║                                                ║
╚════════════════════════════════════════════════╝
`);
  });

// Parse arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
