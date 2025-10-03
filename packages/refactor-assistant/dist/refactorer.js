/**
 * Core refactoring logic and transformations
 */
// Re-export from modular components
export { extractFunction } from './core/extract-function.js';
export { calculateMetrics, findDuplicateBlocks } from './analysis/metrics-calculator.js';
// Import for internal use
import { findDuplicateBlocks, getNestingDepth } from './analysis/metrics-calculator.js';
import { applySingletonPattern, applyFactoryPattern, applyObserverPattern, applyStrategyPattern, applyDecoratorPattern, applyAdapterPattern, applyFacadePattern, applyProxyPattern, applyCommandPattern, applyChainOfResponsibilityPattern, } from './patterns/index.js';
/**
 * Convert callback-based code to async/await
 *
 * @param options - Conversion options including source code
 * @returns Refactoring result with async/await syntax
 *
 * @example
 * ```typescript
 * const result = convertToAsync({
 *   code: 'fs.readFile("file.txt", (err, data) => { ... })',
 *   useTryCatch: true
 * });
 * ```
 */
export function convertToAsync(options) {
    try {
        const { code, useTryCatch = true } = options;
        // Prevent ReDoS: limit input size
        if (code.length > 100000) {
            return {
                code,
                changes: [],
                success: false,
                error: 'Code too large for refactoring (max 100KB)',
            };
        }
        let refactoredCode = code;
        const changes = [];
        // Pattern: callback(err, data) => async/await (safe pattern)
        const callbackPattern = /(\w+)\s?\(\s?\(err,\s?(\w+)\)\s?=>\s?\{/g;
        if (callbackPattern.test(code)) {
            // Convert to async function
            refactoredCode = refactoredCode.replace(/function\s+(\w+)\s*\(/g, 'async function $1(');
            // Reset regex for replace (test() consumed it)
            callbackPattern.lastIndex = 0;
            // Convert callbacks to await
            refactoredCode = refactoredCode.replace(callbackPattern, (_match, fn, dataVar) => {
                if (useTryCatch) {
                    return `try {\n  const ${dataVar} = await ${fn}();\n`;
                }
                return `const ${dataVar} = await ${fn}();\n`;
            });
            // Add error handling if needed
            if (useTryCatch) {
                refactoredCode = refactoredCode.replace(/}\s*\);?\s*$/, '} catch (err) {\n  // Handle error\n  throw err;\n}');
            }
            changes.push({
                type: 'convert-to-async',
                description: 'Converted callback-based code to async/await',
                before: code,
                after: refactoredCode,
            });
        }
        // Convert Promise.then chains (safe pattern with limited quantifiers)
        const thenPattern = /\.then\s?\(\s?(?:function\s?)?\(([^)]{1,100})\)\s?=>\s?\{/g;
        if (thenPattern.test(code)) {
            refactoredCode = convertThenChainToAsync(refactoredCode);
            changes.push({
                type: 'convert-to-async',
                description: 'Converted Promise.then() chain to async/await',
            });
        }
        return {
            code: refactoredCode,
            changes,
            success: true,
            warnings: changes.length === 0 ? ['No callback patterns found to convert'] : undefined,
        };
    }
    catch (error) {
        return {
            code: options.code,
            changes: [],
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during async conversion',
        };
    }
}
/**
 * Simplify nested conditionals and complex if/else chains
 *
 * @param options - Simplification options
 * @returns Refactoring result with simplified conditionals
 *
 * @example
 * ```typescript
 * const result = simplifyConditionals({
 *   code: 'if (x) { if (y) { return z; } }',
 *   useGuardClauses: true
 * });
 * ```
 */
export function simplifyConditionals(options) {
    try {
        const { code, useGuardClauses = true, useTernary = true } = options;
        // Prevent ReDoS: limit input size
        if (code.length > 100000) {
            return {
                code,
                changes: [],
                success: false,
                error: 'Code too large for refactoring (max 100KB)',
            };
        }
        let refactoredCode = code;
        const changes = [];
        // Apply guard clauses for early returns
        if (useGuardClauses) {
            const guardClauseResult = applyGuardClauses(refactoredCode);
            if (guardClauseResult.changed) {
                refactoredCode = guardClauseResult.code;
                changes.push({
                    type: 'simplify-conditionals',
                    description: 'Applied guard clauses for early returns',
                });
            }
        }
        // Convert simple if/else to ternary (safe pattern with length limits)
        if (useTernary) {
            const ternaryPattern = /if\s?\(([^)]{1,200})\)\s?\{\s?return\s+([^;]{1,200});\s?\}\s?else\s?\{\s?return\s+([^;]{1,200});\s?\}/g;
            const originalCode = refactoredCode;
            refactoredCode = refactoredCode.replace(ternaryPattern, 'return $1 ? $2 : $3;');
            if (refactoredCode !== originalCode) {
                changes.push({
                    type: 'simplify-conditionals',
                    description: 'Converted if/else to ternary operator',
                });
            }
        }
        // Combine nested conditions
        const combinedResult = combineNestedConditions(refactoredCode);
        if (combinedResult.changed) {
            refactoredCode = combinedResult.code;
            changes.push({
                type: 'simplify-conditionals',
                description: 'Combined nested conditions',
            });
        }
        return {
            code: refactoredCode,
            changes,
            success: true,
            warnings: changes.length === 0 ? ['No conditionals found to simplify'] : undefined,
        };
    }
    catch (error) {
        return {
            code: options.code,
            changes: [],
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during conditional simplification',
        };
    }
}
/**
 * Remove dead code including unused variables, unreachable code, and unused imports
 *
 * @param options - Dead code removal options
 * @returns Refactoring result with dead code removed
 *
 * @example
 * ```typescript
 * const result = removeDeadCode({
 *   code: sourceCode,
 *   removeUnusedImports: true
 * });
 * ```
 */
export function removeDeadCode(options) {
    try {
        const { code, removeUnusedImports = true, removeUnreachable = true } = options;
        let refactoredCode = code;
        const changes = [];
        // Remove unreachable code after return statements
        if (removeUnreachable) {
            const lines = refactoredCode.split('\n');
            const cleanedLines = [];
            let skipUntilBrace = false;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                if (skipUntilBrace) {
                    if (trimmed.startsWith('}')) {
                        skipUntilBrace = false;
                        cleanedLines.push(line);
                    }
                    continue;
                }
                cleanedLines.push(line);
                if (trimmed.startsWith('return ') || trimmed === 'return;') {
                    // Check if there's code before the closing brace
                    let hasCodeAfterReturn = false;
                    for (let j = i + 1; j < lines.length; j++) {
                        const nextLine = lines[j].trim();
                        if (nextLine.startsWith('}'))
                            break;
                        if (nextLine && !nextLine.startsWith('//')) {
                            hasCodeAfterReturn = true;
                            break;
                        }
                    }
                    if (hasCodeAfterReturn) {
                        skipUntilBrace = true;
                        changes.push({
                            type: 'remove-dead-code',
                            description: 'Removed unreachable code after return statement',
                            lineRange: { start: i + 2, end: i + 2 },
                        });
                    }
                }
            }
            refactoredCode = cleanedLines.join('\n');
        }
        // Remove unused imports (basic implementation)
        if (removeUnusedImports) {
            const importResult = removeUnusedImportsFromCode(refactoredCode);
            if (importResult.removed.length > 0) {
                refactoredCode = importResult.code;
                changes.push({
                    type: 'remove-dead-code',
                    description: `Removed unused imports: ${importResult.removed.join(', ')}`,
                });
            }
        }
        return {
            code: refactoredCode,
            changes,
            success: true,
            warnings: changes.length === 0 ? ['No dead code found'] : undefined,
        };
    }
    catch (error) {
        return {
            code: options.code,
            changes: [],
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during dead code removal',
        };
    }
}
/**
 * Apply a design pattern to existing code
 *
 * @param options - Pattern application options
 * @returns Refactoring result with design pattern applied
 *
 * @example
 * ```typescript
 * const result = applyDesignPattern({
 *   code: classCode,
 *   pattern: 'singleton'
 * });
 * ```
 */
export function applyDesignPattern(options) {
    try {
        const { code, pattern, patternOptions = {} } = options;
        const patternImplementations = {
            singleton: applySingletonPattern,
            factory: applyFactoryPattern,
            observer: applyObserverPattern,
            strategy: applyStrategyPattern,
            decorator: applyDecoratorPattern,
            adapter: applyAdapterPattern,
            facade: applyFacadePattern,
            proxy: applyProxyPattern,
            command: applyCommandPattern,
            'chain-of-responsibility': applyChainOfResponsibilityPattern,
        };
        const implementation = patternImplementations[pattern];
        if (!implementation) {
            return {
                code,
                changes: [],
                success: false,
                error: `Unknown design pattern: ${pattern}`,
            };
        }
        const refactoredCode = implementation(code, patternOptions);
        return {
            code: refactoredCode,
            changes: [
                {
                    type: 'apply-pattern',
                    description: `Applied ${pattern} design pattern`,
                    before: code,
                    after: refactoredCode,
                },
            ],
            success: true,
        };
    }
    catch (error) {
        return {
            code: options.code,
            changes: [],
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during pattern application',
        };
    }
}
/**
 * Rename a variable consistently throughout the code
 *
 * @param options - Rename options including old and new names
 * @returns Refactoring result with renamed variable
 *
 * @example
 * ```typescript
 * const result = renameVariable({
 *   code: sourceCode,
 *   oldName: 'temp',
 *   newName: 'userTemperature'
 * });
 * ```
 */
export function renameVariable(options) {
    try {
        const { code, oldName, newName, includeComments = false } = options;
        // Validate variable names
        const identifierPattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
        if (!identifierPattern.test(newName)) {
            return {
                code,
                changes: [],
                success: false,
                error: 'Invalid variable name',
            };
        }
        // Create word boundary pattern to avoid partial matches
        const pattern = new RegExp(`\\b${escapeRegExp(oldName)}\\b`, 'g');
        let refactoredCode = code.replace(pattern, newName);
        // Rename in comments if requested
        if (includeComments) {
            const commentPattern = new RegExp(`(//.*?)\\b${escapeRegExp(oldName)}\\b`, 'g');
            refactoredCode = refactoredCode.replace(commentPattern, `$1${newName}`);
        }
        const occurrences = (code.match(pattern) || []).length;
        return {
            code: refactoredCode,
            changes: [
                {
                    type: 'rename-variable',
                    description: `Renamed '${oldName}' to '${newName}' (${occurrences} occurrences)`,
                    before: oldName,
                    after: newName,
                },
            ],
            success: true,
        };
    }
    catch (error) {
        return {
            code: options.code,
            changes: [],
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during variable renaming',
        };
    }
}
/**
 * Analyze code and suggest refactorings
 *
 * @param code - Source code to analyze
 * @param filePath - Optional file path for context
 * @returns Array of refactoring suggestions
 *
 * @example
 * ```typescript
 * const suggestions = suggestRefactorings(sourceCode, 'src/utils.ts');
 * ```
 */
export function suggestRefactorings(code, _filePath) {
    const suggestions = [];
    const lines = code.split('\n');
    // Check for long functions
    const functionMetrics = analyzeFunctionLengths(code);
    functionMetrics.forEach(metric => {
        if (metric.lineCount > 50) {
            suggestions.push({
                type: 'extract-function',
                severity: 'warning',
                message: `Function '${metric.name}' is ${metric.lineCount} lines long`,
                location: { line: metric.startLine },
                rationale: 'Long functions are harder to understand and maintain. Consider extracting smaller functions.',
            });
        }
    });
    // Check for nested conditionals
    lines.forEach((line, index) => {
        const nestingDepth = getNestingDepth(lines, index);
        if (nestingDepth > 3) {
            suggestions.push({
                type: 'simplify-conditionals',
                severity: 'warning',
                message: `Deep nesting detected (depth: ${nestingDepth})`,
                location: { line: index + 1 },
                snippet: line.trim(),
                rationale: 'Deep nesting reduces readability. Consider using guard clauses or extracting functions.',
            });
        }
    });
    // Check for callback patterns
    if (code.includes('(err,') || code.includes('callback(')) {
        const callbackLines = lines
            .map((line, idx) => ({ line, idx }))
            .filter(({ line }) => line.includes('(err,') || line.includes('callback('));
        callbackLines.forEach(({ line, idx }) => {
            suggestions.push({
                type: 'convert-to-async',
                severity: 'info',
                message: 'Callback detected - consider converting to async/await',
                location: { line: idx + 1 },
                snippet: line.trim(),
                rationale: 'Async/await provides better error handling and readability than callbacks.',
            });
        });
    }
    // Check for duplicate code blocks
    const duplicates = findDuplicateBlocks(code);
    duplicates.forEach(dup => {
        suggestions.push({
            type: 'extract-function',
            severity: 'warning',
            message: 'Duplicate code block detected',
            location: { line: dup.line1, endLine: dup.line2 },
            rationale: 'Duplicate code violates DRY principle. Consider extracting to a shared function.',
        });
    });
    return suggestions;
}
// Helper functions
function convertThenChainToAsync(code) {
    // Basic conversion of .then() chains (safe pattern with limits)
    return code
        .replace(/\.then\s?\(\s?(?:function\s?)?\(([^)]{1,100})\)\s?=>\s?\{/g, '\nconst $1 = await ')
        .replace(/}\s?\)/g, ';');
}
function applyGuardClauses(code) {
    let changed = false;
    let result = code;
    // Pattern: if (condition) { main logic } else { return/throw } (safe with limits)
    const guardPattern = /if\s?\(([^)]{1,200})\)\s?\{([^}]{1,500})\}\s?else\s?\{([^}]{1,200}(?:return|throw)[^}]{0,100})\}/g;
    result = result.replace(guardPattern, (_match, condition, mainLogic, guardLogic) => {
        changed = true;
        return `if (!(${condition})) {${guardLogic}}\n${mainLogic}`;
    });
    return { code: result, changed };
}
function combineNestedConditions(code) {
    let changed = false;
    // Pattern: if (a) { if (b) { ... } } (safe with limits)
    const nestedPattern = /if\s?\(([^)]{1,200})\)\s?\{\s?if\s?\(([^)]{1,200})\)\s?\{([^}]{1,500})\}\s?\}/g;
    const result = code.replace(nestedPattern, (_match, cond1, cond2, body) => {
        changed = true;
        return `if (${cond1} && ${cond2}) {${body}}`;
    });
    return { code: result, changed };
}
function removeUnusedImportsFromCode(code) {
    const removed = [];
    const lines = code.split('\n');
    const importLines = [];
    // Find all import statements
    lines.forEach((line, index) => {
        // Skip lines that are too long to prevent ReDoS
        if (line.length > 1000)
            return;
        const importMatch = line.match(/import\s+\{([^}]{1,500})\}\s+from\s+['"]([^'"]{1,200})['"]/);
        if (importMatch) {
            const imports = importMatch[1].split(',').map(i => i.trim());
            importLines.push({ line, index, imports });
        }
    });
    // Check which imports are actually used
    const codeWithoutImports = lines
        .filter((_, idx) => !importLines.some(il => il.index === idx))
        .join('\n');
    const filteredLines = lines.filter((_line, idx) => {
        const importLine = importLines.find(il => il.index === idx);
        if (!importLine)
            return true;
        const usedImports = importLine.imports.filter(imp => {
            const pattern = new RegExp(`\\b${escapeRegExp(imp)}\\b`);
            return pattern.test(codeWithoutImports);
        });
        if (usedImports.length === 0) {
            removed.push(...importLine.imports);
            return false;
        }
        if (usedImports.length < importLine.imports.length) {
            const unusedImports = importLine.imports.filter(i => !usedImports.includes(i));
            removed.push(...unusedImports);
        }
        return true;
    });
    return { code: filteredLines.join('\n'), removed };
}
function analyzeFunctionLengths(code) {
    const functions = [];
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const functionMatch = lines[i].match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/);
        if (functionMatch) {
            const name = functionMatch[1] || functionMatch[2];
            let braceCount = 0;
            let started = false;
            let lineCount = 0;
            for (let j = i; j < lines.length; j++) {
                const line = lines[j];
                if (line.includes('{')) {
                    braceCount += (line.match(/\{/g) || []).length;
                    started = true;
                }
                if (line.includes('}')) {
                    braceCount -= (line.match(/\}/g) || []).length;
                }
                if (started)
                    lineCount++;
                if (started && braceCount === 0) {
                    functions.push({ name, startLine: i + 1, lineCount });
                    break;
                }
            }
        }
    }
    return functions;
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
//# sourceMappingURL=refactorer.js.map