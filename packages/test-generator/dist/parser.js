export class CodeParser {
    /**
     * Parse source code to extract functions and classes
     */
    parseCode(content) {
        const functions = this.extractFunctions(content);
        const classes = this.extractClasses(content);
        return { functions, classes };
    }
    /**
     * Extract function declarations
     */
    extractFunctions(content) {
        const functions = [];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Match function declarations (safe pattern with limits to prevent ReDoS)
            const funcMatch = line.match(/(?:async\s)?(?:function\s|const\s|let\s|var\s)?(\w+)[=:]?(?:async\s)?\(([^)]{0,500})\)/);
            if (funcMatch) {
                const isAsync = line.includes('async');
                const name = funcMatch[1];
                const paramsStr = funcMatch[2];
                const params = paramsStr
                    .split(',')
                    .map(p => p.trim().split(/[:=]/)[0].trim())
                    .filter(p => p.length > 0);
                // Skip if inside a class (basic heuristic)
                const precedingText = content.substring(0, content.indexOf(line));
                const openBraces = (precedingText.match(/class\s+\w+\s*{/g) || []).length;
                const closeBraces = (precedingText.match(/^}/gm) || []).length;
                if (openBraces <= closeBraces) {
                    functions.push({
                        name,
                        params,
                        async: isAsync,
                        line: i + 1,
                    });
                }
            }
        }
        return functions;
    }
    /**
     * Extract class declarations and methods
     */
    extractClasses(content) {
        const classes = [];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Match class declarations
            const classMatch = line.match(/class\s+(\w+)/);
            if (classMatch) {
                const className = classMatch[1];
                const methods = [];
                let constructorInfo;
                // Find class body
                let braceCount = 0;
                let inClass = false;
                for (let j = i; j < lines.length; j++) {
                    const currentLine = lines[j];
                    if (currentLine.includes('{')) {
                        braceCount++;
                        inClass = true;
                    }
                    if (currentLine.includes('}')) {
                        braceCount--;
                        if (braceCount === 0 && inClass)
                            break;
                    }
                    if (inClass && braceCount > 0) {
                        // Extract methods (safe pattern with limits to prevent ReDoS)
                        const methodMatch = currentLine.match(/(?:async\s)?(\w+)\(([^)]{0,500})\)/);
                        if (methodMatch) {
                            const methodName = methodMatch[1];
                            const paramsStr = methodMatch[2];
                            const isAsync = currentLine.includes('async');
                            const params = paramsStr
                                .split(',')
                                .map(p => p.trim().split(/[:=]/)[0].trim())
                                .filter(p => p.length > 0);
                            const methodInfo = {
                                name: methodName,
                                params,
                                async: isAsync,
                                line: j + 1,
                            };
                            if (methodName === 'constructor') {
                                constructorInfo = methodInfo;
                            }
                            else {
                                methods.push(methodInfo);
                            }
                        }
                    }
                }
                classes.push({
                    name: className,
                    methods,
                    constructor: constructorInfo,
                    line: i + 1,
                });
            }
        }
        return classes;
    }
}
//# sourceMappingURL=parser.js.map