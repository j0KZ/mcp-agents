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
/**
 * Focus areas for smart workflow selection
 */
export type FocusArea = 'security' | 'quality' | 'performance' | 'comprehensive';
/**
 * Clarification response for ambiguous requests
 */
export interface ClarificationResponse {
    status: 'needs_clarification';
    message: string;
    question: string;
    options: Array<{
        value: string;
        label: string;
        description: string;
    }>;
}
//# sourceMappingURL=types.d.ts.map