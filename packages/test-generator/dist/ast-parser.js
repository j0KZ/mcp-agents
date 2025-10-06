/**
 * AST-based code parser using Babel
 * Replaces regex-based parsing for better accuracy and TypeScript support
 */
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { generateHash } from '@j0kz/shared';
export class ASTParser {
    cache;
    constructor(cache) {
        this.cache = cache;
    }
    /**
     * Parse source code to extract functions and classes using AST
     */
    parseCode(content, filePath = 'unknown') {
        // Check cache if available
        if (this.cache) {
            const contentHash = generateHash(content);
            const cached = this.cache.get(filePath, 'ast-parse', contentHash);
            if (cached) {
                return cached;
            }
        }
        try {
            const ast = parse(content, {
                sourceType: 'module',
                plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties', 'objectRestSpread'],
                errorRecovery: true,
            });
            const functions = [];
            const classes = [];
            traverse(ast, {
                // Extract function declarations
                FunctionDeclaration: path => {
                    const node = path.node;
                    if (node.id) {
                        functions.push(this.extractFunctionInfo(node, node.id.name));
                    }
                },
                // Extract arrow functions assigned to variables
                VariableDeclarator: path => {
                    const { id, init } = path.node;
                    if (init &&
                        (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
                        if (id.type === 'Identifier') {
                            functions.push(this.extractFunctionInfo(init, id.name));
                        }
                    }
                },
                // Extract class declarations
                ClassDeclaration: path => {
                    const node = path.node;
                    if (node.id) {
                        classes.push(this.extractClassInfo(node));
                    }
                },
            });
            const result = { functions, classes };
            // Cache the result if cache is available
            if (this.cache) {
                const contentHash = generateHash(content);
                this.cache.set(filePath, 'ast-parse', contentHash, result);
            }
            return result;
        }
        catch (error) {
            // If AST parsing fails, return empty results
            // This can happen with invalid syntax
            console.error('AST parsing failed:', error);
            return { functions: [], classes: [] };
        }
    }
    /**
     * Extract function information from AST node
     */
    extractFunctionInfo(node, name) {
        const params = node.params.map(param => {
            if (param.type === 'Identifier') {
                return param.name;
            }
            if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
                return param.left.name;
            }
            if (param.type === 'RestElement' && param.argument.type === 'Identifier') {
                return `...${param.argument.name}`;
            }
            if (param.type === 'ObjectPattern' || param.type === 'ArrayPattern') {
                return '{}'; // Simplified representation for destructured params
            }
            return '_'; // Fallback for complex patterns
        });
        return {
            name,
            params,
            async: node.async || false,
            line: node.loc?.start.line || 0,
        };
    }
    /**
     * Extract class information from AST node
     */
    extractClassInfo(node) {
        const className = node.id?.name || 'AnonymousClass';
        const methods = [];
        let constructorInfo;
        // Extract methods from class body
        for (const member of node.body.body) {
            if (member.type === 'ClassMethod') {
                const method = member;
                if (method.key.type === 'Identifier') {
                    const methodName = method.key.name;
                    const methodInfo = this.extractMethodInfo(method, methodName);
                    if (methodName === 'constructor') {
                        constructorInfo = methodInfo;
                    }
                    else {
                        methods.push(methodInfo);
                    }
                }
            }
        }
        return {
            name: className,
            methods,
            constructor: constructorInfo,
            line: node.loc?.start.line || 0,
        };
    }
    /**
     * Extract method information from class method node
     */
    extractMethodInfo(node, name) {
        const params = node.params.map(param => {
            if (param.type === 'Identifier') {
                return param.name;
            }
            if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
                return param.left.name;
            }
            if (param.type === 'RestElement' && param.argument.type === 'Identifier') {
                return `...${param.argument.name}`;
            }
            if (param.type === 'ObjectPattern' || param.type === 'ArrayPattern') {
                return '{}';
            }
            return '_';
        });
        return {
            name,
            params,
            async: node.async || false,
            line: node.loc?.start.line || 0,
        };
    }
}
//# sourceMappingURL=ast-parser.js.map