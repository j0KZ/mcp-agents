import traverseModule from '@babel/traverse';
import * as t from '@babel/types';
import { BaseFixer } from './base-fixer.js';
import { CONFIDENCE, PARETO_COVERAGE, INDEX } from '../constants/auto-fixer.js';
// Handle both ESM and CJS imports
const traverse = typeof traverseModule === 'function' ? traverseModule : traverseModule.default;
/**
 * Finds and removes unused imports
 * Coverage: 35% of common issues
 */
export class UnusedImportFixer extends BaseFixer {
    getName() {
        return 'UnusedImportFixer';
    }
    getCoverage() {
        return PARETO_COVERAGE.UNUSED_IMPORTS;
    }
    findFixes(context) {
        const fixes = [];
        const imports = new Map();
        const usedNames = new Set();
        // Collect all imports
        traverse(context.ast, {
            ImportDeclaration: (path) => {
                // Skip side-effect imports (no specifiers) - early return
                if (path.node.specifiers.length === INDEX.ZERO_BASED)
                    return;
                path.node.specifiers.forEach((spec) => {
                    if (t.isImportSpecifier(spec) || t.isImportDefaultSpecifier(spec) || t.isImportNamespaceSpecifier(spec)) {
                        const localName = spec.local.name;
                        imports.set(localName, {
                            line: spec.loc?.start.line || INDEX.ZERO_BASED,
                            column: spec.loc?.start.column || INDEX.ZERO_BASED,
                            specifier: localName,
                        });
                    }
                });
            },
        });
        // Find all usage
        traverse(context.ast, {
            Identifier: (path) => {
                // Early return if part of import declaration
                const parentType = path.parent.type;
                if (parentType === 'ImportSpecifier' ||
                    parentType === 'ImportDefaultSpecifier' ||
                    parentType === 'ImportNamespaceSpecifier')
                    return;
                usedNames.add(path.node.name);
            },
            // Check JSX usage
            JSXIdentifier: (path) => {
                usedNames.add(path.node.name);
            },
            // Check TypeScript type-only usage
            TSTypeReference: (path) => {
                if (t.isIdentifier(path.node.typeName)) {
                    usedNames.add(path.node.typeName.name);
                }
                else if (t.isTSQualifiedName(path.node.typeName)) {
                    // Handle qualified names like Namespace.Type
                    let current = path.node.typeName;
                    while (current) {
                        if (t.isIdentifier(current)) {
                            usedNames.add(current.name);
                            break;
                        }
                        if (t.isIdentifier(current.left)) {
                            usedNames.add(current.left.name);
                        }
                        current = current.right;
                    }
                }
            },
        });
        // Find truly unused imports - early return optimization
        for (const [name, info] of imports) {
            if (usedNames.has(name))
                continue; // Skip used imports
            const oldCode = this.getLineContent(context, info.line);
            fixes.push(this.createFix('unused-import', `Remove unused import '${name}'`, info.line, info.column, oldCode, '', // Remove the line
            CONFIDENCE.PERFECT, true, 'high'));
        }
        return fixes;
    }
}
//# sourceMappingURL=unused-import-fixer.js.map