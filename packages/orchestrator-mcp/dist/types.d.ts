/**
 * Type definitions for Orchestrator MCP
 */
/**
 * Pre-built workflow names
 */
export type WorkflowName = 'pre-commit' | 'pre-merge' | 'quality-audit';
/**
 * Workflow step definition
 */
export interface WorkflowStep {
    name: string;
    mcp: string;
    tool: string;
    params?: any;
    dependsOn?: string[];
}
/**
 * Workflow metadata
 */
export interface WorkflowMetadata {
    name: string;
    description: string;
    steps?: number;
}
/**
 * Workflow result
 */
export interface WorkflowResult {
    workflow: string;
    success: boolean;
    duration: number;
    steps: WorkflowStepResult[];
    errors: string[];
}
/**
 * Individual step result
 */
export interface WorkflowStepResult {
    name: string;
    success: boolean;
    duration: number;
    data?: any;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map