import traverseModule from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { BaseFixer, type FixContext } from './base-fixer.js';
import type { AutoFix } from '../auto-fixer.js';
import { CONFIDENCE, PARETO_COVERAGE, INDEX } from '../constants/auto-fixer.js';

// Handle both ESM and CJS imports
const traverse = typeof traverseModule === 'function' ? traverseModule : (traverseModule as any).default;

/**
 * Finds and removes console.log statements
 * Coverage: 15% of common issues
 */
export class ConsoleLogFixer extends BaseFixer {

  getName(): string {
    return 'ConsoleLogFixer';
  }

  getCoverage(): number {
    return PARETO_COVERAGE.CONSOLE_LOGS;
  }

  findFixes(context: FixContext): AutoFix[] {
    const fixes: AutoFix[] = [];

    traverse(context.ast, {
      CallExpression: (path: NodePath<t.CallExpression>) => {
        // Early return for non-member expressions
        if (!t.isMemberExpression(path.node.callee)) return;
        if (!t.isIdentifier(path.node.callee.object, { name: 'console' })) return;

        const line = path.node.loc?.start.line || INDEX.ZERO_BASED;
        const column = path.node.loc?.start.column || INDEX.ZERO_BASED;
        const oldCode = this.getLineContent(context, line);

        fixes.push(
          this.createFix(
            'console-log',
            'Remove console statement',
            line,
            column,
            oldCode,
            '', // Remove the line
            CONFIDENCE.HIGH,
            true,
            'medium'
          )
        );
      },
    });

    return fixes;
  }
}
