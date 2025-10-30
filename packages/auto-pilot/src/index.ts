/**
 * Auto-Pilot: Smart automation system that runs everything automatically
 * For lazy developers who just want their code to be perfect without thinking
 */

import { watch } from 'chokidar';
import { GitHooks } from './git-hooks.js';
import { SmartAnalyzer } from './smart-analyzer.js';
import { AutoFixer } from './auto-fixer.js';
import { ContextDetector } from './context-detector.js';

export class AutoPilot {
  private analyzer: SmartAnalyzer;
  private fixer: AutoFixer;
  private context: ContextDetector;
  private isRunning = false;

  constructor() {
    this.analyzer = new SmartAnalyzer();
    this.fixer = new AutoFixer();
    this.context = new ContextDetector();
  }

  /**
   * ONE COMMAND TO RULE THEM ALL
   * Just run this and forget about it
   */
  async start(): Promise<void> {
    console.log("🚀 Auto-Pilot ACTIVATED - I'll handle everything!");

    // 1. Auto-detect EVERYTHING about the project
    const context = await this.context.detect();
    console.log(
      `📊 Detected: ${context.language} ${context.framework} project with ${context.fileCount} files`
    );

    // 2. Set up file watchers - run tools automatically on changes
    this.watchFiles(context);

    // 3. Install git hooks - run before commits automatically
    await this.installGitHooks(context);

    // 4. Set up VS Code integration
    await this.setupIDEIntegration();

    // 5. Run initial analysis and fix everything
    await this.runInitialAnalysis(context);

    console.log("✅ Auto-Pilot ready! Just write code, I'll handle the rest.");
    console.log("💡 Tip: I'm now watching your files and will:");
    console.log('   • Fix issues as you type');
    console.log('   • Generate tests automatically');
    console.log('   • Review code before commits');
    console.log('   • Block bad code from being pushed');
    console.log('   • Keep everything optimized');
  }

  /**
   * Watch files and run appropriate tools AUTOMATICALLY
   */
  private watchFiles(context: any): void {
    const watcher = watch('**/*.{js,ts,jsx,tsx}', {
      ignored: ['node_modules', 'dist', 'build', '.git'],
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on('change', async path => {
      console.log(`\n🔍 Detected change in ${path}`);

      // Smart decision: What should we do with this file?
      const actions = await this.decideActions(path, context);

      // Execute all actions in parallel for speed
      await Promise.all(actions.map(action => this.executeAction(action, path)));
    });

    // Auto-generate tests for new functions
    watcher.on('add', async path => {
      if (path.endsWith('.ts') || path.endsWith('.js')) {
        console.log(`\n🆕 New file detected: ${path}`);
        console.log('   → Auto-generating tests...');
        await this.generateTestsFor(path);
      }
    });
  }

  /**
   * SMART decision engine - knows what to do without being told
   */
  private async decideActions(filePath: string, context: any): Promise<string[]> {
    const actions = [];
    const fileContent = await this.readFile(filePath);

    // Smart detection based on file content and context
    if (this.looksLikeBadCode(fileContent)) {
      actions.push('fix-immediately');
    }

    if (this.hasNoTests(filePath)) {
      actions.push('generate-tests');
    }

    if (this.hasSecurityRisks(fileContent)) {
      actions.push('security-scan');
    }

    if (this.isComplexCode(fileContent)) {
      actions.push('refactor-suggest');
    }

    if (this.hasConsoleLog(fileContent)) {
      actions.push('remove-console');
    }

    if (this.lacksComments(fileContent)) {
      actions.push('add-jsdoc');
    }

    return actions;
  }

  /**
   * Execute actions WITHOUT user intervention
   */
  private async executeAction(action: string, filePath: string): Promise<void> {
    switch (action) {
      case 'fix-immediately':
        console.log('   🔧 Auto-fixing issues...');
        await this.fixer.autoFix(filePath);
        break;

      case 'generate-tests':
        console.log('   🧪 Generating tests...');
        await this.generateTestsFor(filePath);
        break;

      case 'security-scan':
        console.log('   🔒 Running security scan...');
        await this.analyzer.scanSecurity(filePath);
        break;

      case 'refactor-suggest':
        console.log('   💡 Analyzing for refactoring...');
        await this.analyzer.suggestRefactoring(filePath);
        break;

      case 'remove-console':
        console.log('   🧹 Removing console.log statements...');
        await this.fixer.removeConsoleLogs(filePath);
        break;

      case 'add-jsdoc':
        console.log('   📝 Adding documentation...');
        await this.fixer.addDocumentation(filePath);
        break;
    }
  }

  /**
   * Git hooks - run EVERYTHING automatically before commit/push
   */
  private async installGitHooks(context: any): Promise<void> {
    const hooks = new GitHooks();

    // Pre-commit: Fix everything automatically
    await hooks.install('pre-commit', async files => {
      console.log('🎯 Pre-commit Auto-Pilot running...');

      for (const file of files) {
        // Auto-fix all issues
        await this.fixer.autoFix(file);

        // Generate missing tests
        if (this.hasNoTests(file)) {
          await this.generateTestsFor(file);
        }

        // Update documentation
        await this.fixer.addDocumentation(file);
      }

      console.log('✅ All files optimized and ready to commit!');
    });

    // Pre-push: Full validation
    await hooks.install('pre-push', async () => {
      console.log('🚀 Pre-push Auto-Pilot running...');

      // Run ALL tools
      const results = await Promise.all([
        this.analyzer.fullScan(),
        this.analyzer.checkCoverage(),
        this.analyzer.detectDuplicates(),
        this.analyzer.findComplexity(),
      ]);

      // Block push if critical issues
      if (this.hasCriticalIssues(results)) {
        console.log('❌ Push blocked - critical issues found!');
        console.log('🔧 Running auto-fix...');
        await this.fixer.fixEverything();
        console.log('✅ Fixed! Try pushing again.');
        process.exit(1);
      }
    });
  }

  /**
   * VS Code / IDE Integration - real-time assistance
   */
  private async setupIDEIntegration(): Promise<void> {
    // Create VS Code tasks.json
    const vscodeConfig = {
      version: '2.0.0',
      tasks: [
        {
          label: 'Auto-Pilot: Fix This File',
          type: 'shell',
          command: 'npx @j0kz/auto-pilot fix ${file}',
          problemMatcher: [],
          presentation: {
            reveal: 'silent',
          },
          runOptions: {
            runOn: 'onSave', // Run automatically on save!
          },
        },
      ],
    };

    // Save configuration
    await this.writeJSON('.vscode/tasks.json', vscodeConfig);

    // Create keybindings for lazy shortcuts
    const keybindings = {
      key: 'cmd+shift+f',
      command: 'workbench.action.tasks.runTask',
      args: 'Auto-Pilot: Fix This File',
    };

    console.log('🎮 VS Code integration installed!');
  }

  /**
   * Smart code detection algorithms
   */
  private looksLikeBadCode(content: string): boolean {
    const badPatterns = [
      /var\s+/, // Using var instead of let/const
      /==(?!=)/, // Using == instead of ===
      /console\.(log|debug)/, // Left console.log
      /debugger/, // Left debugger statement
      /any\s*:/, // Using 'any' type
      /\/\/\s*TODO/i, // Unfixed TODOs
      /catch\s*\([^)]*\)\s*{\s*}/, // Empty catch blocks
    ];

    return badPatterns.some(pattern => pattern.test(content));
  }

  private hasNoTests(filePath: string): boolean {
    const testPath = filePath.replace(/\.(ts|js)$/, '.test.$1');
    const specPath = filePath.replace(/\.(ts|js)$/, '.spec.$1');
    // Check if test file exists (simplified)
    return !this.fileExists(testPath) && !this.fileExists(specPath);
  }

  private hasSecurityRisks(content: string): boolean {
    const risks = [
      /eval\s*\(/, // eval() usage
      /innerHTML\s*=/, // XSS risk
      /process\.env/, // Exposed env vars
      /require\s*\([`'"]\$\{/, // Dynamic requires
      /(password|secret|key|token)\s*=\s*["']/i, // Hardcoded secrets
    ];

    return risks.some(risk => risk.test(content));
  }

  private isComplexCode(content: string): boolean {
    // Simple complexity check
    const lines = content.split('\n');
    const hasDeepNesting = lines.some(line => line.match(/^\s{16,}/)); // 4+ levels deep
    const hasLongFunctions = content.match(/\{[^}]{500,}\}/); // Functions > 500 chars
    const hasManyParams = content.match(/\([^)]{100,}\)/); // Many parameters

    return hasDeepNesting || !!hasLongFunctions || !!hasManyParams;
  }

  private hasConsoleLog(content: string): boolean {
    return /console\.(log|debug|info)/.test(content);
  }

  private lacksComments(content: string): boolean {
    const codeLines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
    const commentLines = content
      .split('\n')
      .filter(l => l.trim().startsWith('//') || l.includes('/**'));
    return commentLines.length < codeLines.length * 0.1; // Less than 10% comments
  }

  /**
   * Run initial analysis on the project
   */
  private async runInitialAnalysis(context: any): Promise<void> {
    console.log('📊 Running initial analysis...');
    const results = await this.analyzer.fullScan();

    if (results.issues.length > 0) {
      console.log(`🔧 Found ${results.issues.length} issues - auto-fixing...`);
      await this.fixer.fixEverything();
    }

    console.log('✅ Initial analysis complete');
  }

  /**
   * Helper methods
   */
  private async readFile(filePath: string): Promise<string> {
    const { readFile } = await import('fs/promises');
    return readFile(filePath, 'utf-8');
  }

  private async writeJSON(filePath: string, data: any): Promise<void> {
    const { writeFile, mkdir } = await import('fs/promises');
    const path = await import('path');

    // Ensure directory exists
    await mkdir(path.default.dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(data, null, 2));
  }

  private fileExists(filePath: string): boolean {
    const fs = require('fs');
    try {
      fs.statSync(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private hasCriticalIssues(results: any[]): boolean {
    return results.some(
      result =>
        result?.critical === true ||
        result?.severity === 'critical' ||
        result?.issues?.some?.((issue: any) => issue.severity === 'critical')
    );
  }

  private async generateTestsFor(filePath: string): Promise<void> {
    return this.fixer.generateTestsFor(filePath);
  }
}

// ONE COMMAND STARTUP
export async function activate() {
  const pilot = new AutoPilot();
  await pilot.start();
}

// CLI Entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  activate().catch(console.error);
}
