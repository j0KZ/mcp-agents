/**
 * Source Code Parser Module
 * Parses TypeScript/JavaScript files to extract documentation information
 */
import { FunctionInfo, ClassInfo, InterfaceInfo } from '../types.js';
export declare function parseSourceFile(filePath: string): {
    functions: FunctionInfo[];
    classes: ClassInfo[];
    interfaces: InterfaceInfo[];
};
//# sourceMappingURL=source-parser.d.ts.map