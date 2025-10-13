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
        const importsByLine = new Map();
        const usedNames = new Set();
        // Collect all imports grouped by line
        traverse(context.ast, {
            ImportDeclaration: (path) => {
                // Skip side-effect imports (no specifiers) - early return
                if (path.node.specifiers.length === INDEX.ZERO_BASED)
                    return;
                const line = path.node.loc?.start.line || INDEX.ZERO_BASED;
                const source = path.node.source.value;
                const specifiers = path.node.specifiers.map((spec) => ({
                    name: spec.local.name,
                    used: false,
                    original: spec,
                }));
                importsByLine.set(line, {
                    source,
                    specifiers,
                    line,
                    fullDeclaration: path,
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
        // Mark used imports
        for (const [, importInfo] of importsByLine) {
            importInfo.specifiers.forEach(spec => {
                if (usedNames.has(spec.name)) {
                    spec.used = true;
                }
            });
        }
        // Generate fixes for each import line
        for (const [line, importInfo] of importsByLine) {
            const unusedSpecifiers = importInfo.specifiers.filter(s => !s.used);
            const usedSpecifiers = importInfo.specifiers.filter(s => s.used);
            // If all imports are unused, remove the entire line
            if (unusedSpecifiers.length === importInfo.specifiers.length) {
                const oldCode = this.getLineContent(context, line);
                fixes.push(this.createFix('unused-import', `Remove unused import${unusedSpecifiers.length > 1 ? 's' : ''} ${unusedSpecifiers.map(s => `'${s.name}'`).join(', ')}`, line, INDEX.ZERO_BASED, oldCode, '', // Remove the line
                CONFIDENCE.PERFECT, true, 'high'));
            }
            // If only some imports are unused, reconstruct the import statement
            else if (unusedSpecifiers.length > 0) {
                const oldCode = this.getLineContent(context, line);
                // Reconstruct import with only used specifiers
                const newSpecifiers = [];
                usedSpecifiers.forEach(spec => {
                    const original = spec.original;
                    if (t.isImportDefaultSpecifier(original)) {
                        newSpecifiers.push(spec.name);
                    }
                    else if (t.isImportNamespaceSpecifier(original)) {
                        newSpecifiers.push(`* as ${spec.name}`);
                    }
                    else if (t.isImportSpecifier(original)) {
                        // Check if it's aliased
                        const imported = original.imported;
                        const importedName = t.isIdentifier(imported) ? imported.name : imported.value;
                        if (importedName === spec.name) {
                            newSpecifiers.push(spec.name);
                        }
                        else {
                            newSpecifiers.push(`${importedName} as ${spec.name}`);
                        }
                    }
                });
                const newCode = newSpecifiers.length === 1 && !newSpecifiers[0].includes('*')
                    ? `import { ${newSpecifiers[0]} } from '${importInfo.source}';`
                    : `import { ${newSpecifiers.join(', ')} } from '${importInfo.source}';`;
                fixes.push(this.createFix('unused-import', `Remove unused import${unusedSpecifiers.length > 1 ? 's' : ''} ${unusedSpecifiers.map(s => `'${s.name}'`).join(', ')}`, line, INDEX.ZERO_BASED, oldCode, newCode, CONFIDENCE.PERFECT, true, 'medium'));
            }
        }
        return fixes;
    }
}
//# sourceMappingURL=unused-import-fixer.js.map