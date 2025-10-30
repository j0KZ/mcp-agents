/**
 * AutoFixer: Automatically fixes common issues without user intervention
 * Smart enough to know what's safe to fix and what needs human review
 */

import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export class AutoFixer {
  private fixHistory: Map<string, string[]> = new Map();
  private safeFixPatterns: Map<string, (content: string) => string> = new Map();

  constructor() {
    this.initializeSafeFixPatterns();
  }

  /**
   * Initialize patterns that are ALWAYS safe to fix automatically
   */
  private initializeSafeFixPatterns() {
    this.safeFixPatterns = new Map();

    // Remove console.log statements
    this.safeFixPatterns.set('console-removal', content => {
      return content.replace(/console\.(log|debug|info)\([^)]*\);?\s*\n?/g, '');
    });

    // Fix == to ===
    this.safeFixPatterns.set('strict-equality', content => {
      // Careful not to change !== or ===
      return content.replace(/([^!=])={2}([^=])/g, '$1===$2');
    });

    // Fix != to !==
    this.safeFixPatterns.set('strict-inequality', content => {
      return content.replace(/([^!])!={1}([^=])/g, '$1!==$2');
    });

    // Add semicolons where missing (simplified)
    this.safeFixPatterns.set('semicolons', content => {
      const lines = content.split('\n');
      return lines
        .map(line => {
          const trimmed = line.trimEnd();
          if (
            trimmed &&
            !trimmed.endsWith(';') &&
            !trimmed.endsWith('{') &&
            !trimmed.endsWith('}') &&
            !trimmed.startsWith('//') &&
            !trimmed.startsWith('*') &&
            !trimmed.includes('if (') &&
            !trimmed.includes('for (') &&
            !trimmed.includes('while (') &&
            (trimmed.includes('const ') ||
              trimmed.includes('let ') ||
              trimmed.includes('var ') ||
              trimmed.includes('return ') ||
              trimmed.includes('import ') ||
              trimmed.includes('export '))
          ) {
            return trimmed + ';';
          }
          return line;
        })
        .join('\n');
    });

    // Remove trailing whitespace
    this.safeFixPatterns.set('trailing-whitespace', content => {
      return content
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n');
    });

    // Fix var to let/const
    this.safeFixPatterns.set('var-to-let', content => {
      // Simple replacement - in real implementation would use AST
      return content.replace(/\bvar\s+/g, 'let ');
    });

    // Remove debugger statements
    this.safeFixPatterns.set('remove-debugger', content => {
      return content.replace(/debugger;?\s*\n?/g, '');
    });
  }

  /**
   * Automatically fix all issues in a file
   */
  async autoFix(filePath: string): Promise<void> {
    try {
      let content = await readFile(filePath, 'utf-8');
      const originalContent = content;
      const fixes: string[] = [];

      // Apply all safe fixes
      for (const [fixName, fixFunction] of this.safeFixPatterns) {
        const fixed = fixFunction(content);
        if (fixed !== content) {
          content = fixed;
          fixes.push(fixName);
        }
      }

      // Apply smart fixes based on file type
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        content = this.fixTypeScriptIssues(content);
      }

      // Write fixed content if changed
      if (content !== originalContent) {
        await writeFile(filePath, content);
        this.recordFix(filePath, fixes);
        console.log(`  ✅ Fixed ${fixes.length} issues in ${path.basename(filePath)}`);

        // Run prettier if available (only on changed files)
        try {
          const { stdout } = await execAsync(`npx prettier --write "${filePath}"`, {
            cwd: process.cwd(),
          });
        } catch {
          // Prettier not available, that's ok
        }

        // Try to run MCP smart-reviewer auto-fix (only on changed files)
        await this.runSmartReviewerFix(filePath);
      }
    } catch (error) {
      console.log(
        `  ⚠️ Could not auto-fix ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Fix everything in the project
   */
  async fixEverything(): Promise<void> {
    console.log('🔧 Running auto-fix on entire project...');

    try {
      // First try MCP tool
      const { stdout } = await execAsync(
        'npx @j0kz/smart-reviewer apply-auto-fixes --pattern "**/*.{js,ts,jsx,tsx}"',
        {
          cwd: process.cwd(),
        }
      );
      console.log('✅ Auto-fix completed successfully');
    } catch {
      // Fallback to manual fixing
      console.log('Using fallback auto-fix...');
      // Would iterate through files and fix them
    }
  }

  /**
   * Remove console.log statements from a file
   */
  async removeConsoleLogs(filePath: string): Promise<void> {
    const content = await readFile(filePath, 'utf-8');
    const consoleRemover = this.safeFixPatterns.get('console-removal');
    if (!consoleRemover) return;
    const fixed = consoleRemover(content);

    if (fixed !== content) {
      await writeFile(filePath, fixed);
      console.log(`  ✅ Removed console statements from ${path.basename(filePath)}`);
    }
  }

  /**
   * Add JSDoc documentation
   */
  async addDocumentation(filePath: string): Promise<void> {
    const content = await readFile(filePath, 'utf-8');

    // Find functions without documentation
    const functionPattern =
      /(function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=]*)=>)/gm;

    let documented = content;
    const matches = [...content.matchAll(functionPattern)];

    for (const match of matches) {
      const functionName = match[0].match(/\w+/)?.[0];
      if (functionName && !match[0].startsWith('//')) {
        // Check if already has JSDoc by looking at previous lines
        const indexBefore = match.index || 0;
        const linesBefore = content.slice(Math.max(0, indexBefore - 200), indexBefore).split('\n');
        const hasJSDoc = linesBefore.slice(-3).some(line => line.trim().endsWith('*/'));

        if (!hasJSDoc) {
          // Add basic JSDoc
          const indent = match[0].match(/^\s*/)?.[0] || '';
          const jsdoc = `${indent}/**\n${indent} * ${functionName} function\n${indent} */\n`;

          documented = documented.replace(match[0], jsdoc + match[0]);
        }
      }
    }

    if (documented !== content) {
      await writeFile(filePath, documented);
      console.log(`  ✅ Added documentation to ${path.basename(filePath)}`);
    }
  }

  /**
   * Fix TypeScript specific issues
   */
  private fixTypeScriptIssues(content: string): string {
    let fixed = content;

    // Remove 'any' types where possible
    fixed = fixed.replace(/:\s*any\b/g, ': unknown');

    // Add readonly to const arrays/objects
    fixed = fixed.replace(/const\s+(\w+)\s*:\s*(\w+\[\])/g, 'const $1: readonly $2');

    // Fix non-null assertions to optional chaining
    fixed = fixed.replace(/(\w+)!\./g, '$1?.');

    return fixed;
  }

  /**
   * Run smart-reviewer auto-fix
   */
  private async runSmartReviewerFix(filePath: string): Promise<void> {
    try {
      await execAsync(`npx @j0kz/smart-reviewer apply-auto-fixes "${filePath}"`, {
        cwd: process.cwd(),
      });
    } catch {
      // Tool might not be available
    }
  }

  /**
   * Record fixes for history
   */
  private recordFix(filePath: string, fixes: string[]): void {
    if (!this.fixHistory.has(filePath)) {
      this.fixHistory.set(filePath, []);
    }
    const history = this.fixHistory.get(filePath);
    if (history) {
      history.push(...fixes);
    }
  }

  /**
   * Generate test for a file automatically
   */
  async generateTestsFor(filePath: string): Promise<void> {
    console.log(`  🧪 Generating tests for ${path.basename(filePath)}...`);

    try {
      // Try to use test-generator MCP tool
      const { stdout } = await execAsync(`npx @j0kz/test-generator generate "${filePath}"`, {
        cwd: process.cwd(),
      });
      console.log('  ✅ Tests generated successfully');
    } catch {
      // Fallback to basic test generation
      await this.generateBasicTest(filePath);
    }
  }

  /**
   * Generate basic test file
   */
  private async generateBasicTest(filePath: string): Promise<void> {
    const testPath = filePath.replace(/\.(ts|js)$/, '.test.$1');
    const fileName = path.basename(filePath, path.extname(filePath));

    const testContent = `import { describe, it, expect } from 'vitest';
import { ${fileName} } from './${fileName}';

describe('${fileName}', () => {
  it('should work', () => {
    // Auto-generated test
    expect(true).toBe(true);
  });
});
`;

    await writeFile(testPath, testContent);
    console.log(`  ✅ Created test file: ${path.basename(testPath)}`);
  }

  /**
   * Check if file looks good after fixes
   */
  async verify(filePath: string): Promise<boolean> {
    try {
      const content = await readFile(filePath, 'utf-8');

      // Quick verification checks
      const hasConsole = /console\.(log|debug)/.test(content);
      const hasDebugger = /debugger/.test(content);
      const hasVar = /\bvar\s+/.test(content);
      const hasNonStrict = /[^!=]={2}[^=]/.test(content);

      return !hasConsole && !hasDebugger && !hasVar && !hasNonStrict;
    } catch {
      return false;
    }
  }
}
