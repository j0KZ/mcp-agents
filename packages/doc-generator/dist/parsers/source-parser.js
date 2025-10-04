/**
 * Source Code Parser Module
 * Parses TypeScript/JavaScript files to extract documentation information
 */
import * as fs from 'fs';
export function parseSourceFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const functions = [];
    const classes = [];
    const interfaces = [];
    // Simple regex-based parsing (production implementation would use TypeScript Compiler API)
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\((.*?)\)(?:\s*:\s*([^{]+))?\s*{/g;
    const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*{/g;
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+([\w,\s]+))?\s*{/g;
    let match;
    // Parse functions
    while ((match = functionRegex.exec(content)) !== null) {
        const [, name, params, returnType] = match;
        const parameters = params
            .split(',')
            .map((p) => p.trim())
            .filter((p) => p)
            .map((param) => {
            const [paramName, paramType] = param.split(':').map((s) => s.trim());
            const isOptional = paramName.includes('?');
            const isRest = paramName.startsWith('...');
            const cleanName = paramName.replace(/[?\.]/g, '');
            return {
                name: cleanName,
                type: paramType ? { name: paramType, isArray: paramType.includes('[]'), raw: paramType } : undefined,
                optional: isOptional,
                rest: isRest,
            };
        });
        functions.push({
            name,
            parameters,
            returnType: returnType ? { name: returnType.trim(), isArray: returnType.includes('[]'), raw: returnType.trim() } : undefined,
            isAsync: match[0].includes('async'),
            isExported: match[0].includes('export'),
        });
    }
    // Parse classes
    while ((match = classRegex.exec(content)) !== null) {
        const [, name, extendsClass, implementsInterfaces] = match;
        classes.push({
            name,
            extends: extendsClass,
            implements: implementsInterfaces?.split(',').map((i) => i.trim()),
            properties: [],
            methods: [],
            constructor: undefined,
            isExported: match[0].includes('export'),
            isAbstract: match[0].includes('abstract'),
        });
    }
    // Parse interfaces
    while ((match = interfaceRegex.exec(content)) !== null) {
        const [, name, extendsInterfaces] = match;
        interfaces.push({
            name,
            extends: extendsInterfaces?.split(',').map((i) => i.trim()),
            properties: [],
            methods: [],
            isExported: match[0].includes('export'),
        });
    }
    return { functions, classes, interfaces };
}
//# sourceMappingURL=source-parser.js.map