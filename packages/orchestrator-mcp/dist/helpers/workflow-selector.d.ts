/**
 * Smart workflow selection based on focus area
 * Maps focus to appropriate existing workflows
 * BILINGUAL: Supports English and Spanish for frictionless usage
 */
import { FocusArea, WorkflowName } from '../types.js';
import { Language } from '@j0kz/shared';
/**
 * Valid focus areas for workflow selection
 */
export declare const VALID_FOCUS_AREAS: readonly FocusArea[];
/**
 * Select workflow based on focus area
 * Reuses EXISTING workflows - no new pipeline creation needed
 *
 * Mapping logic:
 * - Security → pre-commit (has security-scan step)
 * - Quality → pre-merge (has review + architecture + tests)
 * - Performance → quality-audit (has architecture analysis)
 * - Comprehensive → pre-merge (most complete workflow)
 *
 * @param focus - The focus area for workflow selection
 * @returns The name of the workflow to execute
 */
export declare function selectWorkflowByFocus(focus: FocusArea): WorkflowName;
/**
 * Get clarification options in specified language
 * Supports English and Spanish
 */
export declare function getClarificationOptions(language?: Language): any;
/**
 * Validate focus area
 * Type guard for FocusArea
 */
export declare function isValidFocus(value: string): value is FocusArea;
//# sourceMappingURL=workflow-selector.d.ts.map