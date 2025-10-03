/**
 * Core refactoring logic and transformations
 */
/**
 * Extract a code block into a separate function
 *
 * @param code - Source code containing the block to extract
 * @param options - Extraction options including function name and line range
 * @returns Refactoring result with extracted function
 *
 * @example
 * ```typescript
 * const result = extractFunction(sourceCode, {
 *   functionName: 'calculateTotal',
 *   startLine: 10,
 *   endLine: 15
 * });
 * ```
 */
export function extractFunction(code, options) {
    try {
        const lines = code.split('\n');
        const { functionName, startLine, endLine, async = false, arrow = false } = options;
        // Validate line range
        if (startLine < 1 || endLine > lines.length || startLine > endLine) {
            return {
                code,
                changes: [],
                success: false,
                error: 'Invalid line range specified',
            };
        }
        // Extract the code block (convert to 0-indexed)
        const extractedLines = lines.slice(startLine - 1, endLine);
        const extractedCode = extractedLines.join('\n');
        // Analyze variables used in the extracted code
        const { parameters, returnValue } = analyzeCodeBlock(extractedCode);
        // Generate function signature
        const asyncKeyword = async ? 'async ' : '';
        const functionDeclaration = arrow
            ? `const ${functionName} = ${asyncKeyword}(${parameters.join(', ')}) => {`
            : `${asyncKeyword}function ${functionName}(${parameters.join(', ')}) {`;
        // Build the extracted function
        const indentation = getIndentation(lines[startLine - 1]);
        const functionBody = extractedLines.map(line => indentation + line).join('\n');
        const returnStatement = returnValue ? `\n${indentation}  return ${returnValue};` : '';
        const extractedFunction = `${indentation}${functionDeclaration}\n${functionBody}${returnStatement}\n${indentation}}`;
        // Generate function call
        const functionCall = returnValue
            ? `${indentation}const result = ${async ? 'await ' : ''}${functionName}(${parameters.join(', ')});`
            : `${indentation}${async ? 'await ' : ''}${functionName}(${parameters.join(', ')});`;
        // Replace original code with function call
        const newLines = [
            ...lines.slice(0, startLine - 1),
            functionCall,
            ...lines.slice(endLine),
            '',
            extractedFunction,
        ];
        const changes = [
            {
                type: 'extract-function',
                description: `Extracted function '${functionName}' from lines ${startLine}-${endLine}`,
                lineRange: { start: startLine, end: endLine },
                before: extractedCode,
                after: extractedFunction,
            },
        ];
        return {
            code: newLines.join('\n'),
            changes,
            success: true,
        };
    }
    catch (error) {
        return {
            code,
            changes: [],
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during function extraction',
        };
    }
}
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
/**
 * Calculate code metrics for quality analysis
 *
 * @param code - Source code to analyze
 * @returns Code metrics object
 */
export function calculateMetrics(code) {
    const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
    const functionCount = (code.match(/function\s+\w+/g) || []).length +
        (code.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || []).length;
    const complexity = calculateCyclomaticComplexity(code);
    const maxNestingDepth = Math.max(...lines.map((_, idx) => getNestingDepth(lines, idx)));
    return {
        complexity,
        linesOfCode: lines.length,
        functionCount,
        maxNestingDepth,
        maintainabilityIndex: calculateMaintainabilityIndex(lines.length, complexity, functionCount),
    };
}
// Helper functions
function analyzeCodeBlock(code) {
    const variables = new Set();
    const declarations = new Set();
    // Find variable usages
    const usagePattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    let match;
    while ((match = usagePattern.exec(code)) !== null) {
        const varName = match[1];
        if (!['if', 'else', 'for', 'while', 'return', 'const', 'let', 'var'].includes(varName)) {
            variables.add(varName);
        }
    }
    // Find variable declarations
    const declPattern = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = declPattern.exec(code)) !== null) {
        declarations.add(match[1]);
    }
    // Parameters are variables used but not declared
    const parameters = Array.from(variables).filter(v => !declarations.has(v));
    // Check for return value
    const returnMatch = code.match(/return\s+([^;]+);?/);
    const returnValue = returnMatch ? returnMatch[1].trim() : null;
    return { parameters, returnValue };
}
function getIndentation(line) {
    const match = line.match(/^(\s*)/);
    return match ? match[1] : '';
}
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
function applySingletonPattern(code, _options) {
    const className = code.match(/class\s+(\w+)/)?.[1] || 'Singleton';
    return `class ${className} {
  private static instance: ${className};

  private constructor() {
    // Private constructor prevents direct instantiation
  }

  public static getInstance(): ${className} {
    if (!${className}.instance) {
      ${className}.instance = new ${className}();
    }
    return ${className}.instance;
  }

${code.replace(/class\s+\w+\s*\{/, '').replace(/}\s*$/, '')}
}`;
}
function applyFactoryPattern(code, options) {
    const className = options.className || 'Product';
    return `interface ${className} {
  operation(): string;
}

class Concrete${className}A implements ${className} {
  operation(): string {
    return 'ConcreteProductA';
  }
}

class Concrete${className}B implements ${className} {
  operation(): string {
    return 'ConcreteProductB';
  }
}

class ${className}Factory {
  static create(type: 'A' | 'B'): ${className} {
    switch (type) {
      case 'A':
        return new Concrete${className}A();
      case 'B':
        return new Concrete${className}B();
      default:
        throw new Error('Unknown product type');
    }
  }
}

${code}`;
}
function applyObserverPattern(code, _options) {
    return `interface Observer {
  update(data: any): void;
}

class Subject {
  private observers: Observer[] = [];

  attach(observer: Observer): void {
    this.observers.push(observer);
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: any): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

${code}`;
}
function applyStrategyPattern(code, _options) {
    return `interface Strategy {
  execute(data: any): any;
}

class Context {
  private strategy: Strategy;

  constructor(strategy: Strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: Strategy): void {
    this.strategy = strategy;
  }

  executeStrategy(data: any): any {
    return this.strategy.execute(data);
  }
}

${code}`;
}
function applyDecoratorPattern(code, _options) {
    return `interface Component {
  operation(): string;
}

class ConcreteComponent implements Component {
  operation(): string {
    return 'ConcreteComponent';
  }
}

abstract class Decorator implements Component {
  protected component: Component;

  constructor(component: Component) {
    this.component = component;
  }

  operation(): string {
    return this.component.operation();
  }
}

${code}`;
}
function applyAdapterPattern(code, _options) {
    return `interface Target {
  request(): string;
}

class Adaptee {
  specificRequest(): string {
    return 'Adaptee specific request';
  }
}

class Adapter implements Target {
  private adaptee: Adaptee;

  constructor(adaptee: Adaptee) {
    this.adaptee = adaptee;
  }

  request(): string {
    return this.adaptee.specificRequest();
  }
}

${code}`;
}
function applyFacadePattern(code, _options) {
    return `class SubsystemA {
  operationA(): string {
    return 'SubsystemA operation';
  }
}

class SubsystemB {
  operationB(): string {
    return 'SubsystemB operation';
  }
}

class Facade {
  private subsystemA: SubsystemA;
  private subsystemB: SubsystemB;

  constructor() {
    this.subsystemA = new SubsystemA();
    this.subsystemB = new SubsystemB();
  }

  operation(): string {
    return this.subsystemA.operationA() + ' ' + this.subsystemB.operationB();
  }
}

${code}`;
}
function applyProxyPattern(code, _options) {
    return `interface Subject {
  request(): void;
}

class RealSubject implements Subject {
  request(): void {
    // Handle request logic here
  }
}

class Proxy implements Subject {
  private realSubject: RealSubject;

  request(): void {
    if (!this.realSubject) {
      this.realSubject = new RealSubject();
    }
    this.preRequest();
    this.realSubject.request();
    this.postRequest();
  }

  private preRequest(): void {
    // Pre-processing logic here
  }

  private postRequest(): void {
    // Post-processing logic here
  }
}

${code}`;
}
function applyCommandPattern(code, _options) {
    return `interface Command {
  execute(): void;
}

class ConcreteCommand implements Command {
  private receiver: Receiver;

  constructor(receiver: Receiver) {
    this.receiver = receiver;
  }

  execute(): void {
    this.receiver.action();
  }
}

class Receiver {
  action(): void {
    // Perform action logic here
  }
}

class Invoker {
  private command: Command;

  setCommand(command: Command): void {
    this.command = command;
  }

  executeCommand(): void {
    this.command.execute();
  }
}

${code}`;
}
function applyChainOfResponsibilityPattern(code, _options) {
    return `abstract class Handler {
  protected nextHandler: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: any): any {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

class ConcreteHandler1 extends Handler {
  handle(request: any): any {
    if (request === 'handler1') {
      return 'Handled by ConcreteHandler1';
    }
    return super.handle(request);
  }
}

class ConcreteHandler2 extends Handler {
  handle(request: any): any {
    if (request === 'handler2') {
      return 'Handled by ConcreteHandler2';
    }
    return super.handle(request);
  }
}

${code}`;
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
function getNestingDepth(lines, index) {
    let depth = 0;
    for (let i = 0; i <= index; i++) {
        const line = lines[i];
        depth += (line.match(/\{/g) || []).length;
        depth -= (line.match(/\}/g) || []).length;
    }
    return Math.max(0, depth);
}
function findDuplicateBlocks(code) {
    // Simplified duplicate detection
    const lines = code.split('\n');
    const duplicates = [];
    const minBlockSize = 3;
    for (let i = 0; i < lines.length - minBlockSize; i++) {
        const block1 = lines.slice(i, i + minBlockSize).join('\n').trim();
        if (!block1)
            continue;
        for (let j = i + minBlockSize; j < lines.length - minBlockSize; j++) {
            const block2 = lines.slice(j, j + minBlockSize).join('\n').trim();
            if (block1 === block2) {
                duplicates.push({ line1: i + 1, line2: j + 1 });
            }
        }
    }
    return duplicates;
}
function calculateCyclomaticComplexity(code) {
    const decisionPoints = [
        /\bif\b/g,
        /\belse\b/g,
        /\bfor\b/g,
        /\bwhile\b/g,
        /\bcase\b/g,
        /\bcatch\b/g,
        /\b&&\b/g,
        /\b\|\|\b/g,
        /\?/g,
    ];
    let complexity = 1; // Base complexity
    decisionPoints.forEach(pattern => {
        const matches = code.match(pattern);
        complexity += matches ? matches.length : 0;
    });
    return complexity;
}
function calculateMaintainabilityIndex(loc, complexity, functionCount) {
    // Simplified maintainability index calculation
    // Real formula: 171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)
    const volume = loc * Math.log2(functionCount || 1);
    const index = Math.max(0, Math.min(100, 171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(loc)));
    return Math.round(index);
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
//# sourceMappingURL=refactorer.js.map