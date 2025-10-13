/**
 * Smart workflow selection based on focus area
 * Maps focus to appropriate existing workflows
 * BILINGUAL: Supports English and Spanish for frictionless usage
 */
import { FocusArea, WorkflowName } from '../types.js';
import { Language } from '@j0kz/shared';
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
 * Get clarification options in specified language
 * Supports English and Spanish
 */
export declare function getClarificationOptions(language?: Language): {
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