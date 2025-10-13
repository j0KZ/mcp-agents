/**
 * Smart workflow selection based on focus area
 * Maps focus to appropriate existing workflows
 * BILINGUAL: Supports English and Spanish for frictionless usage
 */

import { FocusArea, WorkflowName } from '../types.js';
import {
  getClarificationOptions as getBilingualOptions,
  Language
} from '@j0kz/shared';

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
export function selectWorkflowByFocus(focus: FocusArea): WorkflowName {
  // Security focus → use pre-commit (has security-scan step)
  if (focus === 'security') {
    return 'pre-commit';
  }

  // Quality focus → use pre-merge (has review + tests + architecture)
  if (focus === 'quality') {
    return 'pre-merge';
  }

  // Performance focus → use quality-audit (has architecture analysis)
  if (focus === 'performance') {
    return 'quality-audit';
  }

  // Comprehensive → use pre-merge (most complete workflow)
  return 'pre-merge';
}

/**
 * Get clarification options in specified language
 * Supports English and Spanish
 */
export function getClarificationOptions(language: Language = 'en') {
  return getBilingualOptions(language);
}

/**
 * Validate focus area
 * Type guard for FocusArea
 */
export function isValidFocus(value: string): value is FocusArea {
  return ['security', 'quality', 'performance', 'comprehensive'].includes(value);
}
