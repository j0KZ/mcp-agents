/**
 * Shared types for all MCP packages
 */
export interface Codebase {
    path: string;
    domain?: string;
    files?: CodeFile[];
    history?: Record<string, unknown>;
}
export interface FunctionInfo {
    name: string;
    parameters?: string[];
    returnType?: string;
    complexity?: number;
}
export interface CodeFile {
    path: string;
    content?: string;
    complexity?: number;
    lines?: number;
    functions?: FunctionInfo[];
    dependencies?: string[];
    patterns?: Pattern[];
}
export interface Pattern {
    id: string;
    type: string;
    confidence: number;
}
export interface Insight {
    description: string;
    impact: string;
    recommendation: string;
}
export interface Visualization {
    type: string;
    data: Record<string, unknown>;
}
//# sourceMappingURL=types.d.ts.map