/**
 * JSDoc Generator Module
 * Generates JSDoc comments for TypeScript/JavaScript files
 */
import * as fs from 'fs';
import { DocError } from '../types.js';
import { parseSourceFile } from '../parsers/source-parser.js';
export async function generateJSDoc(filePath, config = {}) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new DocError('File not found', 'FILE_NOT_FOUND', { filePath });
        }
        const { functions, classes, interfaces } = parseSourceFile(filePath);
        const warnings = [];
        let itemsDocumented = 0;
        const jsdocContent = [];
        // Generate JSDoc for functions
        functions.forEach(func => {
            jsdocContent.push('/**');
            jsdocContent.push(` * ${func.description || `Function: ${func.name}`}`);
            func.parameters.forEach(param => {
                const typeStr = param.type?.raw || 'any';
                const optionalStr = param.optional ? '=' : '';
                jsdocContent.push(` * @param {${typeStr}} ${optionalStr}${param.name} - ${param.description || 'Parameter description'}`);
            });
            if (func.returnType) {
                jsdocContent.push(` * @returns {${func.returnType.raw}} Return value description`);
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
    }
    catch (error) {
        if (error instanceof DocError) {
            throw error;
        }
        throw new DocError('Failed to generate JSDoc', 'JSDOC_GENERATION_FAILED', error);
    }
}
//# sourceMappingURL=jsdoc-generator.js.map