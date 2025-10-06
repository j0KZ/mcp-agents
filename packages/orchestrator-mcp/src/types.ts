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
  mcp: string; // MCP name (e.g., 'smart-reviewer')
  tool: string; // Tool name (e.g., 'review_file')
  params?: any; // Tool parameters
  dependsOn?: string[]; // Dependency on other steps
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
