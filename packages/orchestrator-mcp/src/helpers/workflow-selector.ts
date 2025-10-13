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
export function selectWorkflowByFocus(
  focus: FocusArea,
  files: string[]
): WorkflowName {

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
 * Get clarification options with labeled choices
 * Matches test pattern from test-mcp-ambiguity (Oct 11, 2025)
 */
export function getClarificationOptions() {
  return [
    {
      value: 'security',
      label: 'a) Security Analysis',
      description: 'Fast security scan for vulnerabilities (uses pre-commit workflow)'
    },
    {
      value: 'quality',
      label: 'b) Code Quality',
      description: 'Review with complexity and test coverage (uses pre-merge workflow)'
    },
    {
      value: 'performance',
      label: 'c) Performance',
      description: 'Architecture analysis and bottleneck detection (uses quality-audit workflow)'
    },
    {
      value: 'comprehensive',
      label: 'd) Everything',
      description: 'Complete analysis across all areas (uses pre-merge workflow)'
    }
  ];
}

/**
 * Validate focus area
 * Type guard for FocusArea
 */
export function isValidFocus(value: string): value is FocusArea {
  return ['security', 'quality', 'performance', 'comprehensive'].includes(value);
}
