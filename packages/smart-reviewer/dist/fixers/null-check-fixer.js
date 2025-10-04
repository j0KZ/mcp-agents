import traverseModule from '@babel/traverse';
import * as t from '@babel/types';
import { BaseFixer } from './base-fixer.js';
import { CONFIDENCE, PARETO_COVERAGE, INDEX } from '../constants/auto-fixer.js';
// Handle both ESM and CJS imports
const traverse = typeof traverseModule === 'function' ? traverseModule : traverseModule.default;
/**
 * Suggests optional chaining for null/undefined access
 * Coverage: 25% of common issues
 */
export class NullCheckFixer extends BaseFixer {
    // Memoized constant set for performance
    NEVER_NULL_OBJECTS = new Set([
        'this',
        'window',
        'document',
        'console',
        'Math',
        'Date',
        'Array',
        'Object',
        'String',
        'Number',
        'Boolean',
        'process', // Node.js
        'global', // Node.js
    ]);
    getName() {
        return 'NullCheckFixer';
    }
    getCoverage() {
        return PARETO_COVERAGE.NULL_CHECKS;
    }
    findFixes(context) {
        const fixes = [];
        traverse(context.ast, {
            MemberExpression: (path) => {
                // Early returns for performance
                if (path.node.optional)
                    return;
                if (!t.isIdentifier(path.node.object))
                    return;
                const objName = path.node.object.name;
                // Skip known never-null objects (memoized Set)
                if (this.NEVER_NULL_OBJECTS.has(objName))
                    return;
                const line = path.node.loc?.start.line || INDEX.ZERO_BASED;
                const column = path.node.loc?.start.column || INDEX.ZERO_BASED;
                const oldCode = this.getLineContent(context, line);
                // Escape special regex characters to prevent injection
                const escapedName = objName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Suggest optional chaining (regex created once per iteration)
                const newCode = oldCode.replace(new RegExp(`${escapedName}\\.`, 'g'), `${objName}?.`);
                if (oldCode === newCode)
                    return;
                fixes.push(this.createFix('null-check', `Add optional chaining to prevent null/undefined access`, line, column, oldCode, newCode, CONFIDENCE.MEDIUM, false, 'high'));
            },
        });
        return fixes;
    }
}
//# sourceMappingURL=null-check-fixer.js.map