/**
 * Pre-built workflows for common development tasks
 */
import { MCPPipeline } from '@j0kz/shared';
import { WorkflowName, WorkflowMetadata } from './types.js';
/**
 * Workflow metadata
 */
export declare const WORKFLOWS: Record<WorkflowName, WorkflowMetadata>;
/**
 * Create pre-commit workflow
 *
 * Steps:
 * 1. Code review (moderate severity) - reviews ALL files
 * 2. Security scan - scans ALL files
 *
 * @param files - Files to check
 */
export declare function createPreCommitWorkflow(files: string[]): MCPPipeline;
/**
 * Create pre-merge workflow
 *
 * Steps:
 * 1. Batch code review (strict)
 * 2. Architecture analysis
 * 3. Security audit
 * 4. Test coverage check (depends on review passing)
 *
 * @param files - Files changed in PR
 * @param projectPath - Project root path
 */
export declare function createPreMergeWorkflow(files: string[], projectPath: string): MCPPipeline;
/**
 * Create quality audit workflow
 *
 * Steps:
 * 1. Security report generation
 * 2. Architecture analysis with dependency graph
 * 3. Documentation generation
 *
 * @param projectPath - Project root path
 */
export declare function createQualityAuditWorkflow(projectPath: string): MCPPipeline;
/**
 * Create workflow by name
 *
 * @param name - Workflow name
 * @param files - Files to process
 * @param projectPath - Project root path
 */
export declare function createWorkflow(name: WorkflowName, files: string[], projectPath: string): MCPPipeline;
//# sourceMappingURL=workflows.d.ts.map