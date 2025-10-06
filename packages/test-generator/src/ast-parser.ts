/**
 * AST-based code parser using Babel
 * Replaces regex-based parsing for better accuracy and TypeScript support
 */

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { FunctionInfo, ClassInfo } from './types.js';
import { AnalysisCache, generateHash } from '@j0kz/shared';
import type {
  FunctionDeclaration,
  ClassDeclaration,
  ClassMethod,
  ArrowFunctionExpression,
  FunctionExpression,
} from '@babel/types';

export class ASTParser {
  private cache?: AnalysisCache;

  constructor(cache?: AnalysisCache) {
    this.cache = cache;
  }

  /**
   * Parse source code to extract functions and classes using AST
   */
  parseCode(
    content: string,
    filePath: string = 'unknown'
  ): { functions: FunctionInfo[]; classes: ClassInfo[] } {
    // Check cache if available
    if (this.cache) {
      const contentHash = generateHash(content);
      const cached = this.cache.get(filePath, 'ast-parse', contentHash);

      if (cached) {
        return cached as { functions: FunctionInfo[]; classes: ClassInfo[] };
      }
    }
    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties', 'objectRestSpread'],
        errorRecovery: true,
      });

      const functions: FunctionInfo[] = [];
      const classes: ClassInfo[] = [];

      traverse(ast, {
        // Extract function declarations
        FunctionDeclaration: path => {
          const node = path.node as FunctionDeclaration;
          if (node.id) {
            functions.push(this.extractFunctionInfo(node, node.id.name));
          }
        },

        // Extract arrow functions assigned to variables
        VariableDeclarator: path => {
          const { id, init } = path.node;
          if (
            init &&
            (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')
          ) {
            if (id.type === 'Identifier') {
              functions.push(this.extractFunctionInfo(init, id.name));
            }
          }
        },

        // Extract class declarations
        ClassDeclaration: path => {
          const node = path.node as ClassDeclaration;
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
    } catch (error) {
      // If AST parsing fails, return empty results
      // This can happen with invalid syntax
      console.error('AST parsing failed:', error);
      return { functions: [], classes: [] };
    }
  }

  /**
   * Extract function information from AST node
   */
  private extractFunctionInfo(
    node: FunctionDeclaration | ArrowFunctionExpression | FunctionExpression,
    name: string
  ): FunctionInfo {
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
  private extractClassInfo(node: ClassDeclaration): ClassInfo {
    const className = node.id?.name || 'AnonymousClass';
    const methods: FunctionInfo[] = [];
    let constructorInfo: FunctionInfo | undefined;

    // Extract methods from class body
    for (const member of node.body.body) {
      if (member.type === 'ClassMethod') {
        const method = member as ClassMethod;
        if (method.key.type === 'Identifier') {
          const methodName = method.key.name;
          const methodInfo = this.extractMethodInfo(method, methodName);

          if (methodName === 'constructor') {
            constructorInfo = methodInfo;
          } else {
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
  private extractMethodInfo(node: ClassMethod, name: string): FunctionInfo {
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
