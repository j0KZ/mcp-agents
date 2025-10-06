/**
 * AST-based code parser using Babel
 * Replaces regex-based parsing for better accuracy and TypeScript support
 */
import { FunctionInfo, ClassInfo } from './types.js';
import { AnalysisCache } from '@j0kz/shared';
export declare class ASTParser {
    private cache?;
    constructor(cache?: AnalysisCache);
    /**
     * Parse source code to extract functions and classes using AST
     */
    parseCode(content: string, filePath?: string): {
        functions: FunctionInfo[];
        classes: ClassInfo[];
    };
    /**
     * Extract function information from AST node
     */
    private extractFunctionInfo;
    /**
     * Extract class information from AST node
     */
    private extractClassInfo;
    /**
     * Extract method information from class method node
     */
    private extractMethodInfo;
}
//# sourceMappingURL=ast-parser.d.ts.map