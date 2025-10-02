import { FunctionInfo, ClassInfo } from './types.js';
export declare class CodeParser {
    /**
     * Parse source code to extract functions and classes
     */
    parseCode(content: string): {
        functions: FunctionInfo[];
        classes: ClassInfo[];
    };
    /**
     * Extract function declarations
     */
    private extractFunctions;
    /**
     * Extract class declarations and methods
     */
    private extractClasses;
}
//# sourceMappingURL=parser.d.ts.map