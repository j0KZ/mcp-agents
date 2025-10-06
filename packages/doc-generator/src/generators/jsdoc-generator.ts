/**
 * JSDoc Generator Module
 * Generates JSDoc comments for TypeScript/JavaScript files
 */

import * as fs from 'fs';
import { JSDocConfig, DocResult, DocError } from '../types.js';
import { parseSourceFile } from '../parsers/source-parser.js';

/**
 * Infer return value description from function name and return type
 */
function inferReturnDescription(funcName: string, returnType: string): string {
  const lowerReturnType = returnType.toLowerCase();

  // Promise return types
  if (lowerReturnType.includes('promise')) {
    const innerType = returnType.match(/Promise<(.+)>/)?.[1];
    if (innerType === 'void') return 'Promise that resolves when operation completes';
    if (innerType) return `Promise that resolves with ${innerType}`;
    return 'Promise that resolves with the result';
  }

  // Specific return types
  if (lowerReturnType === 'boolean' || lowerReturnType === 'bool') {
    if (funcName.startsWith('is') || funcName.startsWith('has')) {
      return 'True if condition is met, false otherwise';
    }
    return 'Boolean result';
  }

  if (lowerReturnType === 'string') return 'The resulting string';
  if (lowerReturnType === 'number') return 'The calculated number';
  if (lowerReturnType === 'void') return 'No return value';
  if (lowerReturnType.includes('[]')) return `Array of ${lowerReturnType.replace('[]', '')}`;
  if (lowerReturnType === 'any') return 'The return value';

  return `The ${returnType} result`;
}

export async function generateJSDoc(
  filePath: string,
  config: JSDocConfig = {}
): Promise<DocResult> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new DocError('File not found', 'FILE_NOT_FOUND', { filePath });
    }

    const { functions, classes, interfaces } = parseSourceFile(filePath);
    const warnings: string[] = [];
    let itemsDocumented = 0;

    const jsdocContent: string[] = [];

    // Generate JSDoc for functions
    functions.forEach(func => {
      jsdocContent.push('/**');
      jsdocContent.push(` * ${func.description || `Function: ${func.name}`}`);

      func.parameters.forEach(param => {
        const typeStr = param.type?.raw || 'any';
        const paramName = param.optional ? `[${param.name}]` : param.name;
        jsdocContent.push(
          ` * @param {${typeStr}} ${paramName} - ${param.description || 'Parameter description'}`
        );
      });

      if (func.returnType) {
        const returnDesc = inferReturnDescription(func.name, func.returnType.raw);
        jsdocContent.push(` * @returns {${func.returnType.raw}} ${returnDesc}`);
      }

      if (config.addTodoTags && !func.description) {
        jsdocContent.push(' * @todo Add function description');
        warnings.push(`Missing description for function: ${func.name}`);
      }

      jsdocContent.push(' */');
      jsdocContent.push('');
      itemsDocumented++;
    });

    // Generate JSDoc for classes
    classes.forEach(cls => {
      jsdocContent.push('/**');
      jsdocContent.push(` * ${cls.description || `Class: ${cls.name}`}`);

      if (cls.extends) {
        jsdocContent.push(` * @extends ${cls.extends}`);
      }

      cls.implements?.forEach(iface => {
        jsdocContent.push(` * @implements ${iface}`);
      });

      if (config.addTodoTags && !cls.description) {
        jsdocContent.push(' * @todo Add class description');
        warnings.push(`Missing description for class: ${cls.name}`);
      }

      jsdocContent.push(' */');
      jsdocContent.push('');
      itemsDocumented++;
    });

    // Generate JSDoc for interfaces
    interfaces.forEach(iface => {
      jsdocContent.push('/**');
      jsdocContent.push(` * ${iface.description || `Interface: ${iface.name}`}`);

      if (config.addTodoTags && !iface.description) {
        jsdocContent.push(' * @todo Add interface description');
        warnings.push(`Missing description for interface: ${iface.name}`);
      }

      jsdocContent.push(' */');
      jsdocContent.push('');
      itemsDocumented++;
    });

    return {
      content: jsdocContent.join('\n'),
      filePath,
      format: 'markdown',
      metadata: {
        generatedAt: new Date().toISOString(),
        filesProcessed: 1,
        itemsDocumented,
        warnings,
      },
    };
  } catch (error) {
    if (error instanceof DocError) {
      throw error;
    }
    throw new DocError('Failed to generate JSDoc', 'JSDOC_GENERATION_FAILED', error);
  }
}
