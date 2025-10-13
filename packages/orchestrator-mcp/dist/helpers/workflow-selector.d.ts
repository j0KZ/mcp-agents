/**
 * Smart workflow selection based on focus area
 * Maps focus to appropriate existing workflows
 */
import { FocusArea, WorkflowName } from '../types.js';
/**
 * Select workflow based on focus area
 * Reuses EXISTING workflows - no new pipeline creation needed
 *
 * Mapping logic:
 * - Security → pre-commit (has security-scan step)
 * - Quality → pre-merge (has review + architecture + tests)
 * - Performance → quality-audit (has architecture analysis)
 * - Comprehensive → pre-merge (most complete workflow)
 */
export declare function selectWorkflowByFocus(focus: FocusArea, files: string[]): WorkflowName;
/**
 * Get clarification options with labeled choices
 * Matches test pattern from test-mcp-ambiguity (Oct 11, 2025)
 */
export declare function getClarificationOptions(): {
    value: string;
    label: string;
    description: string;
}[];
/**
 * Validate focus area
 * Type guard for FocusArea
 */
export declare function isValidFocus(value: string): value is FocusArea;
//# sourceMappingURL=workflow-selector.d.ts.map