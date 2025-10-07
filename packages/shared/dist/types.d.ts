/**
 * Shared types for all MCP packages
 */
export interface Codebase {
    path: string;
    domain?: string;
    files?: CodeFile[];
    history?: any;
}
export interface CodeFile {
    path: string;
    content?: string;
    complexity?: number;
    lines?: number;
    functions?: any[];
    dependencies?: string[];
    patterns?: any[];
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
    data: any;
}
//# sourceMappingURL=types.d.ts.map