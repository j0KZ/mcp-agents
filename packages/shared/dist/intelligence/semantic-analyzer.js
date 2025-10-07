/**
 * Semantic Analyzer - Phase 2.1 of Evolution Plan
 * Understands code MEANING, not just structure
 */
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import * as t from '@babel/types';
import { getMessageBus } from '../communication/message-bus.js';
import { getPerformanceTracker } from '../metrics/performance-tracker.js';
const traverse = _traverse.default || _traverse;
export class SemanticAnalyzer {
    knowledgeBase = new Map();
    patterns = new Map();
    messageBus = getMessageBus();
    tracker = getPerformanceTracker();
    constructor() {
        this.initializePatterns();
        this.initializeKnowledge();
    }
    /**
     * Analyze code to understand its intent and meaning
     */
    async analyzeIntent(code, context) {
        const startTime = Date.now();
        try {
            // Parse code into AST
            const ast = parse(code, {
                sourceType: 'module',
                plugins: ['typescript', 'jsx', 'decorators-legacy'],
                errorRecovery: true,
            });
            // Extract semantic information
            const purpose = await this.detectPurpose(ast, context);
            const dataFlows = this.analyzeDataFlow(ast);
            const sideEffects = this.detectSideEffects(ast);
            const dependencies = this.extractDependencies(ast);
            const complexity = this.analyzeComplexity(ast);
            const patterns = this.detectPatterns(ast, code);
            const antiPatterns = this.detectAntiPatterns(ast, code);
            // Generate suggestions based on analysis
            const suggestions = this.generateSuggestions({
                purpose,
                dataFlows,
                sideEffects,
                patterns,
                antiPatterns,
                complexity,
            });
            // Calculate confidence
            const confidence = this.calculateConfidence({
                hasTypes: code.includes(':'),
                hasComments: code.includes('//') || code.includes('/*'),
                hasTests: context?.fileName?.includes('test'),
                patternMatches: patterns.length,
                knownPurpose: purpose !== 'unknown',
            });
            const intent = {
                purpose,
                category: this.categorizeCode(purpose, patterns),
                actions: this.extractActions(ast),
                inputs: dataFlows.inputs,
                outputs: dataFlows.outputs,
                sideEffects,
                dependencies,
                complexity,
                patterns,
                antiPatterns,
                suggestions,
                confidence,
            };
            // Track performance
            await this.tracker.track({
                toolId: 'semantic-analyzer',
                operation: 'analyze-intent',
                timestamp: new Date(),
                duration: Date.now() - startTime,
                success: true,
                input: { type: 'code', size: code.length },
                output: { type: 'intent', size: JSON.stringify(intent).length },
                confidence,
            });
            // Share insights with other tools
            if (intent.antiPatterns.length > 0 || intent.sideEffects.some(e => e.risk === 'high')) {
                await this.messageBus.shareInsight('semantic-analyzer', {
                    type: 'code-issues',
                    data: {
                        antiPatterns: intent.antiPatterns,
                        riskyEffects: intent.sideEffects.filter(e => e.risk === 'high'),
                    },
                    confidence,
                    affects: ['security-scanner', 'smart-reviewer'],
                });
            }
            return intent;
        }
        catch (error) {
            await this.tracker.track({
                toolId: 'semantic-analyzer',
                operation: 'analyze-intent',
                timestamp: new Date(),
                duration: Date.now() - startTime,
                success: false,
                input: { type: 'code', size: code.length },
                output: { type: 'error', size: 0 },
                confidence: 0,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    /**
     * Detect the purpose of the code
     */
    async detectPurpose(ast, context) {
        const purposes = [];
        traverse(ast, {
            // API endpoints
            Decorator: (path) => {
                const name = path.node.expression?.callee?.name;
                if (['Get', 'Post', 'Put', 'Delete', 'Controller'].includes(name)) {
                    purposes.push('API endpoint');
                }
            },
            // Database operations
            CallExpression: (path) => {
                const callee = path.node.callee;
                if (callee.type === 'MemberExpression') {
                    const methods = ['find', 'save', 'update', 'delete', 'query', 'insert'];
                    const property = callee.property?.name;
                    if (methods.includes(property)) {
                        purposes.push('Database operation');
                    }
                }
                // Authentication
                if (this.isAuthCall(path.node)) {
                    purposes.push('Authentication');
                }
                // Validation
                if (this.isValidationCall(path.node)) {
                    purposes.push('Input validation');
                }
            },
            // React/Vue components
            JSXElement: () => {
                purposes.push('UI component');
            },
            // Event handlers
            FunctionDeclaration: (path) => {
                const name = path.node.id?.name || '';
                if (name.startsWith('handle') || name.startsWith('on')) {
                    purposes.push('Event handler');
                }
            },
            // Class analysis
            ClassDeclaration: (path) => {
                const name = path.node.id?.name || '';
                if (name.includes('Controller'))
                    purposes.push('Controller');
                if (name.includes('Service'))
                    purposes.push('Service layer');
                if (name.includes('Repository'))
                    purposes.push('Data access');
                if (name.includes('Model'))
                    purposes.push('Data model');
            },
        });
        // Combine and prioritize purposes
        if (purposes.length === 0) {
            // Try to infer from context
            if (context?.fileName) {
                if (context.fileName.includes('controller'))
                    return 'Controller';
                if (context.fileName.includes('service'))
                    return 'Service layer';
                if (context.fileName.includes('util'))
                    return 'Utility function';
                if (context.fileName.includes('test'))
                    return 'Test suite';
            }
            return 'General purpose code';
        }
        // Return most specific purpose
        return purposes.join(' + ');
    }
    /**
     * Analyze how data flows through the code
     */
    analyzeDataFlow(ast) {
        const inputs = [];
        const outputs = [];
        const transformations = new Map();
        traverse(ast, {
            // Function parameters (inputs)
            FunctionDeclaration: (path) => {
                path.node.params.forEach((param) => {
                    if (param.type === 'Identifier') {
                        inputs.push({
                            name: param.name,
                            type: this.inferType(param),
                            source: 'parameter',
                            validation: this.findValidations(path.node, param.name),
                            transformations: transformations.get(param.name) || [],
                            sensitivity: this.detectSensitivity(param.name),
                        });
                    }
                });
            },
            // Return statements (outputs)
            ReturnStatement: (path) => {
                if (path.node.argument) {
                    outputs.push({
                        name: 'return',
                        type: this.inferType(path.node.argument),
                        source: 'internal',
                        validation: [],
                        transformations: this.getTransformationChain(path),
                        sensitivity: 'public',
                    });
                }
            },
            // Variable transformations
            AssignmentExpression: (path) => {
                const left = path.node.left;
                const right = path.node.right;
                if (left.type === 'Identifier') {
                    const transforms = transformations.get(left.name) || [];
                    transforms.push(this.describeOperation(right));
                    transformations.set(left.name, transforms);
                }
            },
        });
        return { inputs, outputs };
    }
    /**
     * Detect side effects in the code
     */
    detectSideEffects(ast) {
        const effects = [];
        traverse(ast, {
            // Database writes
            CallExpression: (path) => {
                const callee = path.node.callee;
                // Database operations
                if (this.isDatabaseWrite(callee)) {
                    effects.push({
                        type: 'database',
                        action: 'write',
                        target: this.extractTarget(callee),
                        risk: 'medium',
                    });
                }
                // File system
                if (this.isFileOperation(callee)) {
                    effects.push({
                        type: 'file',
                        action: this.extractAction(callee),
                        target: this.extractTarget(callee),
                        risk: 'medium',
                    });
                }
                // Network calls
                if (this.isNetworkCall(callee)) {
                    effects.push({
                        type: 'network',
                        action: 'request',
                        target: this.extractUrl(path.node),
                        risk: 'high',
                    });
                }
                // Console logging
                if (this.isConsoleLog(callee)) {
                    effects.push({
                        type: 'console',
                        action: 'log',
                        risk: 'low',
                    });
                }
            },
            // Global mutations
            AssignmentExpression: (path) => {
                if (this.isGlobalAssignment(path.node)) {
                    effects.push({
                        type: 'global',
                        action: 'mutation',
                        target: this.extractTarget(path.node.left),
                        risk: 'high',
                    });
                }
            },
            // Async operations
            AwaitExpression: () => {
                if (!effects.some(e => e.type === 'async')) {
                    effects.push({
                        type: 'async',
                        action: 'await',
                        risk: 'low',
                    });
                }
            },
        });
        return effects;
    }
    /**
     * Extract dependencies
     */
    extractDependencies(ast) {
        const deps = [];
        const seen = new Set();
        traverse(ast, {
            ImportDeclaration: (path) => {
                const source = path.node.source.value;
                if (!seen.has(source)) {
                    seen.add(source);
                    deps.push({
                        name: source,
                        type: this.classifyDependency(source),
                        purpose: this.inferDependencyPurpose(source, path.node),
                        critical: this.isCriticalDependency(source),
                    });
                }
            },
            CallExpression: (path) => {
                if (path.node.callee.name === 'require') {
                    const source = path.node.arguments[0]?.value;
                    if (source && !seen.has(source)) {
                        seen.add(source);
                        deps.push({
                            name: source,
                            type: this.classifyDependency(source),
                            purpose: this.inferDependencyPurpose(source, path.node),
                            critical: this.isCriticalDependency(source),
                        });
                    }
                }
            },
        });
        return deps;
    }
    /**
     * Analyze code complexity
     */
    analyzeComplexity(ast) {
        let cognitive = 0;
        let cyclomatic = 1;
        let maxDepth = 0;
        let currentDepth = 0;
        let coupling = 0;
        let cohesion = 0;
        const functionCount = { total: 0, related: 0 };
        traverse(ast, {
            enter(path) {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
                // Cognitive complexity
                if (t.isIfStatement(path.node))
                    cognitive += 1 + (path.node.alternate ? 1 : 0);
                if (t.isForStatement(path.node))
                    cognitive += 2;
                if (t.isWhileStatement(path.node))
                    cognitive += 2;
                if (t.isSwitchStatement(path.node))
                    cognitive += 2;
                if (t.isTryStatement(path.node))
                    cognitive += 2;
                if (t.isConditionalExpression(path.node))
                    cognitive += 1;
                // Cyclomatic complexity
                if (t.isIfStatement(path.node))
                    cyclomatic++;
                if (t.isForStatement(path.node))
                    cyclomatic++;
                if (t.isWhileStatement(path.node))
                    cyclomatic++;
                if (t.isSwitchCase(path.node))
                    cyclomatic++;
                if (t.isCatchClause(path.node))
                    cyclomatic++;
                if (t.isConditionalExpression(path.node))
                    cyclomatic++;
                if (t.isLogicalExpression(path.node) && path.node.operator === '&&')
                    cyclomatic++;
                if (t.isLogicalExpression(path.node) && path.node.operator === '||')
                    cyclomatic++;
                // Coupling (external calls)
                if (t.isCallExpression(path.node)) {
                    const callee = path.node.callee;
                    if (t.isMemberExpression(callee) && !this.isBuiltIn(callee)) {
                        coupling++;
                    }
                }
                // Cohesion (related functions)
                if (t.isFunctionDeclaration(path.node) || t.isArrowFunctionExpression(path.node)) {
                    functionCount.total++;
                    if (this.functionsAreRelated(path)) {
                        functionCount.related++;
                    }
                }
            },
            exit() {
                currentDepth--;
            },
        });
        // Calculate cohesion score (0-100)
        cohesion =
            functionCount.total > 0
                ? Math.round((functionCount.related / functionCount.total) * 100)
                : 100;
        return {
            cognitive: Math.min(cognitive, 100),
            cyclomatic,
            depth: maxDepth,
            coupling: Math.min(coupling, 100),
            cohesion,
        };
    }
    /**
     * Detect design patterns
     */
    detectPatterns(ast, code) {
        const patterns = [];
        // Singleton pattern
        if (this.detectSingleton(ast, code)) {
            patterns.push('Singleton');
        }
        // Factory pattern
        if (this.detectFactory(ast)) {
            patterns.push('Factory');
        }
        // Observer pattern
        if (this.detectObserver(ast, code)) {
            patterns.push('Observer/EventEmitter');
        }
        // Repository pattern
        if (this.detectRepository(ast)) {
            patterns.push('Repository');
        }
        // Dependency Injection
        if (this.detectDependencyInjection(ast)) {
            patterns.push('Dependency Injection');
        }
        // Builder pattern
        if (this.detectBuilder(ast, code)) {
            patterns.push('Builder');
        }
        // Middleware pattern
        if (this.detectMiddleware(ast, code)) {
            patterns.push('Middleware');
        }
        return patterns;
    }
    /**
     * Detect anti-patterns
     */
    detectAntiPatterns(ast, code) {
        const antiPatterns = [];
        // God object/function
        if (this.detectGodObject(ast)) {
            antiPatterns.push('God Object - too many responsibilities');
        }
        // Callback hell
        if (this.detectCallbackHell(ast)) {
            antiPatterns.push('Callback Hell - use async/await');
        }
        // Magic numbers
        if (this.detectMagicNumbers(ast)) {
            antiPatterns.push('Magic Numbers - use named constants');
        }
        // Copy-paste code
        if (this.detectDuplication(code)) {
            antiPatterns.push('Code Duplication - extract common logic');
        }
        // Long parameter list
        if (this.detectLongParameterList(ast)) {
            antiPatterns.push('Long Parameter List - use object parameters');
        }
        // Nested conditionals
        if (this.detectDeepNesting(ast)) {
            antiPatterns.push('Deep Nesting - simplify logic');
        }
        // Unused variables
        if (this.detectUnusedVariables(ast)) {
            antiPatterns.push('Unused Variables - remove dead code');
        }
        return antiPatterns;
    }
    /**
     * Generate intelligent suggestions
     */
    generateSuggestions(analysis) {
        const suggestions = [];
        // Complexity suggestions
        if (analysis.complexity.cyclomatic > 10) {
            suggestions.push('Consider breaking down complex functions');
        }
        if (analysis.complexity.cognitive > 15) {
            suggestions.push('Simplify logic to improve readability');
        }
        if (analysis.complexity.coupling > 20) {
            suggestions.push('Reduce external dependencies');
        }
        // Pattern suggestions
        if (!analysis.patterns.includes('Repository') && analysis.purpose.includes('Database')) {
            suggestions.push('Consider using Repository pattern for data access');
        }
        if (analysis.sideEffects.filter((e) => e.type === 'async').length > 3) {
            suggestions.push('Consider using Promise.all for parallel async operations');
        }
        // Security suggestions
        const criticalEffects = analysis.sideEffects.filter((e) => e.risk === 'high');
        if (criticalEffects.length > 0) {
            suggestions.push('Add error handling for critical operations');
        }
        // Data flow suggestions
        const sensitiveData = analysis.dataFlows.inputs.filter((d) => d.sensitivity === 'sensitive');
        if (sensitiveData.length > 0 &&
            !sensitiveData.every((d) => d.validation.length > 0)) {
            suggestions.push('Add validation for sensitive data inputs');
        }
        return suggestions;
    }
    /**
     * Helper methods
     */
    initializePatterns() {
        this.patterns.set('singleton', /getInstance|instance\s*=\s*new|private\s+constructor/);
        this.patterns.set('factory', /create[A-Z]\w*|factory|make[A-Z]\w*/);
        this.patterns.set('observer', /addEventListener|on[A-Z]\w*|emit|subscribe|notify/);
        this.patterns.set('repository', /Repository|find|save|delete|update.*ById/);
        this.patterns.set('auth', /auth|login|logout|token|jwt|session/i);
        this.patterns.set('validation', /validate|check|verify|assert|ensure/i);
    }
    initializeKnowledge() {
        // Domain knowledge about common patterns
        this.knowledgeBase.set('auth-libraries', ['passport', 'jsonwebtoken', 'bcrypt']);
        this.knowledgeBase.set('db-libraries', ['mongoose', 'typeorm', 'sequelize', 'prisma']);
        this.knowledgeBase.set('test-libraries', ['jest', 'mocha', 'vitest', 'chai']);
        this.knowledgeBase.set('critical-operations', ['payment', 'auth', 'delete', 'transfer']);
    }
    categorizeCode(purpose, patterns) {
        if (purpose.includes('Auth') || patterns.includes('Authentication'))
            return 'security';
        if (purpose.includes('Database') || purpose.includes('Repository'))
            return 'data';
        if (purpose.includes('Controller') || purpose.includes('API'))
            return 'business';
        if (purpose.includes('Service') || purpose.includes('Helper'))
            return 'utility';
        return 'infrastructure';
    }
    inferType(node) {
        if (node.typeAnnotation) {
            return this.typeToString(node.typeAnnotation.typeAnnotation);
        }
        if (t.isStringLiteral(node))
            return 'string';
        if (t.isNumericLiteral(node))
            return 'number';
        if (t.isBooleanLiteral(node))
            return 'boolean';
        if (t.isArrayExpression(node))
            return 'array';
        if (t.isObjectExpression(node))
            return 'object';
        if (t.isFunction(node))
            return 'function';
        return 'unknown';
    }
    typeToString(type) {
        if (!type)
            return 'unknown';
        if (type.type === 'TSStringKeyword')
            return 'string';
        if (type.type === 'TSNumberKeyword')
            return 'number';
        if (type.type === 'TSBooleanKeyword')
            return 'boolean';
        if (type.type === 'TSArrayType')
            return 'array';
        if (type.type === 'TSObjectKeyword')
            return 'object';
        return type.type || 'unknown';
    }
    detectSensitivity(name) {
        const sensitive = ['password', 'token', 'secret', 'key', 'ssn', 'credit'];
        const critical = ['payment', 'transfer', 'balance'];
        const lower = name.toLowerCase();
        if (critical.some(c => lower.includes(c)))
            return 'critical';
        if (sensitive.some(s => lower.includes(s)))
            return 'sensitive';
        if (lower.includes('email') || lower.includes('phone'))
            return 'private';
        return 'public';
    }
    findValidations(node, paramName) {
        const validations = [];
        // Simplified - would need deeper analysis
        traverse(node, {
            CallExpression: (path) => {
                const callee = path.node.callee;
                if (callee.name?.includes('validate')) {
                    validations.push(callee.name);
                }
            },
        });
        return validations;
    }
    extractActions(ast) {
        const actions = [];
        traverse(ast, {
            CallExpression: (path) => {
                const callee = path.node.callee;
                if (t.isMemberExpression(callee)) {
                    const objName = t.isIdentifier(callee.object) ? callee.object.name : 'unknown';
                    const propName = t.isIdentifier(callee.property) ? callee.property.name : 'unknown';
                    actions.push(`${objName}.${propName}`);
                }
                else if (t.isIdentifier(callee)) {
                    actions.push(callee.name);
                }
            },
        });
        return [...new Set(actions)].slice(0, 10); // Top 10 actions
    }
    calculateConfidence(factors) {
        let confidence = 0.5;
        if (factors.hasTypes)
            confidence += 0.15;
        if (factors.hasComments)
            confidence += 0.1;
        if (factors.hasTests)
            confidence += 0.1;
        if (factors.patternMatches > 0)
            confidence += Math.min(0.1, factors.patternMatches * 0.02);
        if (factors.knownPurpose)
            confidence += 0.1;
        return Math.min(0.95, confidence);
    }
    isAuthCall(node) {
        const authMethods = ['authenticate', 'authorize', 'login', 'logout', 'verifyToken'];
        return (t.isCallExpression(node) &&
            t.isIdentifier(node.callee) &&
            authMethods.includes(node.callee.name));
    }
    isValidationCall(node) {
        const validationMethods = ['validate', 'check', 'verify', 'assert'];
        if (!t.isCallExpression(node) || !t.isIdentifier(node.callee))
            return false;
        const calleeName = node.callee.name;
        return validationMethods.some(m => calleeName?.includes(m));
    }
    isDatabaseWrite(node) {
        const writeMethods = ['save', 'update', 'insert', 'delete', 'create'];
        return (t.isMemberExpression(node) &&
            t.isIdentifier(node.property) &&
            writeMethods.includes(node.property.name));
    }
    isFileOperation(node) {
        return (t.isMemberExpression(node) &&
            t.isIdentifier(node.object) &&
            ['fs', 'path'].includes(node.object.name));
    }
    isNetworkCall(node) {
        const networkMethods = ['fetch', 'axios', 'request', 'http'];
        if (t.isIdentifier(node))
            return networkMethods.includes(node.name);
        if (t.isMemberExpression(node) && t.isIdentifier(node.object))
            return networkMethods.includes(node.object.name);
        return false;
    }
    isConsoleLog(node) {
        return (t.isMemberExpression(node) &&
            t.isIdentifier(node.object) &&
            node.object.name === 'console' &&
            t.isIdentifier(node.property) &&
            ['log', 'error', 'warn'].includes(node.property.name));
    }
    isGlobalAssignment(node) {
        return (t.isMemberExpression(node.left) &&
            t.isIdentifier(node.left.object) &&
            ['window', 'global', 'process'].includes(node.left.object.name));
    }
    extractTarget(node) {
        if (t.isMemberExpression(node)) {
            const objName = t.isIdentifier(node.object) ? node.object.name : 'unknown';
            const propName = t.isIdentifier(node.property) ? node.property.name : 'unknown';
            return `${objName}.${propName}`;
        }
        if (t.isIdentifier(node)) {
            return node.name;
        }
        return 'unknown';
    }
    extractAction(node) {
        if (t.isMemberExpression(node) && t.isIdentifier(node.property)) {
            return node.property.name;
        }
        return 'unknown';
    }
    extractUrl(node) {
        if (node.arguments?.[0] && t.isStringLiteral(node.arguments[0])) {
            return node.arguments[0].value;
        }
        return 'unknown';
    }
    classifyDependency(source) {
        if (source.startsWith('.'))
            return 'internal';
        if (source.startsWith('node:') || ['fs', 'path', 'crypto'].includes(source))
            return 'system';
        return 'external';
    }
    inferDependencyPurpose(source, node) {
        const purposes = {
            express: 'Web framework',
            react: 'UI library',
            mongoose: 'Database ORM',
            axios: 'HTTP client',
            lodash: 'Utility functions',
            jsonwebtoken: 'Authentication',
            bcrypt: 'Password hashing',
        };
        for (const [lib, purpose] of Object.entries(purposes)) {
            if (source.includes(lib))
                return purpose;
        }
        return 'General dependency';
    }
    isCriticalDependency(source) {
        const critical = ['auth', 'security', 'payment', 'database'];
        return critical.some(c => source.toLowerCase().includes(c));
    }
    isBuiltIn(node) {
        const builtIns = ['console', 'Math', 'JSON', 'Object', 'Array', 'Promise'];
        return builtIns.includes(node.object?.name);
    }
    functionsAreRelated(path) {
        // Simplified - check if functions work with same data
        return true; // Would need more complex analysis
    }
    detectSingleton(ast, code) {
        return this.patterns.get('singleton').test(code);
    }
    detectFactory(ast) {
        let found = false;
        traverse(ast, {
            FunctionDeclaration: (path) => {
                if (this.patterns.get('factory').test(path.node.id?.name || '')) {
                    found = true;
                }
            },
        });
        return found;
    }
    detectObserver(ast, code) {
        return this.patterns.get('observer').test(code);
    }
    detectRepository(ast) {
        let found = false;
        traverse(ast, {
            ClassDeclaration: (path) => {
                if (path.node.id?.name?.includes('Repository')) {
                    found = true;
                }
            },
        });
        return found;
    }
    detectDependencyInjection(ast) {
        let found = false;
        traverse(ast, {
            ClassDeclaration: (path) => {
                const constructor = path.node.body.body.find((m) => m.type === 'MethodDefinition' && m.key.name === 'constructor');
                if (constructor?.value?.params?.length > 0) {
                    found = true;
                }
            },
        });
        return found;
    }
    detectBuilder(ast, code) {
        return code.includes('.with') && code.includes('.build()');
    }
    detectMiddleware(ast, code) {
        return code.includes('next()') || code.includes('middleware');
    }
    detectGodObject(ast) {
        let methodCount = 0;
        traverse(ast, {
            ClassDeclaration: (path) => {
                methodCount = path.node.body.body.filter((m) => m.type === 'MethodDefinition').length;
            },
        });
        return methodCount > 20;
    }
    detectCallbackHell(ast) {
        let maxDepth = 0;
        let currentDepth = 0;
        traverse(ast, {
            CallExpression: {
                enter() {
                    currentDepth++;
                    maxDepth = Math.max(maxDepth, currentDepth);
                },
                exit() {
                    currentDepth--;
                },
            },
        });
        return maxDepth > 5;
    }
    detectMagicNumbers(ast) {
        let magicCount = 0;
        traverse(ast, {
            NumericLiteral: (path) => {
                if (![0, 1, -1, 10, 100].includes(path.node.value)) {
                    magicCount++;
                }
            },
        });
        return magicCount > 5;
    }
    detectDuplication(code) {
        const lines = code.split('\n');
        const duplicates = new Set();
        for (let i = 0; i < lines.length - 5; i++) {
            const chunk = lines.slice(i, i + 5).join('\n');
            if (duplicates.has(chunk))
                return true;
            duplicates.add(chunk);
        }
        return false;
    }
    detectLongParameterList(ast) {
        let hasLong = false;
        traverse(ast, {
            FunctionDeclaration: (path) => {
                if (path.node.params.length > 4) {
                    hasLong = true;
                }
            },
        });
        return hasLong;
    }
    detectDeepNesting(ast) {
        let maxDepth = 0;
        let currentDepth = 0;
        traverse(ast, {
            BlockStatement: {
                enter() {
                    currentDepth++;
                    maxDepth = Math.max(maxDepth, currentDepth);
                },
                exit() {
                    currentDepth--;
                },
            },
        });
        return maxDepth > 4;
    }
    detectUnusedVariables(ast) {
        const declared = new Set();
        const used = new Set();
        traverse(ast, {
            VariableDeclarator: (path) => {
                if (path.node.id.type === 'Identifier') {
                    declared.add(path.node.id.name);
                }
            },
            Identifier: (path) => {
                if (path.isReferencedIdentifier()) {
                    used.add(path.node.name);
                }
            },
        });
        const unused = [...declared].filter(v => !used.has(v));
        return unused.length > 2;
    }
    describeOperation(node) {
        if (t.isCallExpression(node)) {
            if (t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.property)) {
                return `${node.callee.property.name} operation`;
            }
            return 'function call';
        }
        if (t.isBinaryExpression(node)) {
            return `${node.operator} operation`;
        }
        return 'transformation';
    }
    getTransformationChain(path) {
        // Simplified - would trace back through data flow
        return ['processed'];
    }
}
//# sourceMappingURL=semantic-analyzer.js.map