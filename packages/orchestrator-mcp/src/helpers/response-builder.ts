/**
 * Response builders for MCP protocol
 * Extracted to keep mcp-server.ts under 300 LOC
 * BILINGUAL: Supports English and Spanish responses
 */

import { getClarificationOptions } from './workflow-selector.js';
import { getClarificationMessage, getInvalidFocusMessage, Language } from '@j0kz/shared';

/**
 * Build clarification response when workflow/focus is missing
 * Returns response in specified language
 */
export function buildClarificationResponse(language: Language = 'en') {
  const messages = getClarificationMessage(language);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            status: 'needs_clarification',
            message: messages.message,
            question: messages.question,
            options: getClarificationOptions(language),
          },
          null,
          2
        ),
      },
    ],
  };
}

/**
 * Build clarification response for invalid focus
 * Returns response in specified language
 */
export function buildInvalidFocusResponse(invalidFocus: string, language: Language = 'en') {
  const messages = getInvalidFocusMessage(invalidFocus, language);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            status: 'needs_clarification',
            message: messages.message,
            question: messages.question,
            options: getClarificationOptions(language),
          },
          null,
          2
        ),
      },
    ],
  };
}

/**
 * Build success response with workflow results
 */
export function buildSuccessResponse(
  selectedWorkflow: string,
  focus: string | undefined,
  result: any
) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            status: 'success',
            workflow: selectedWorkflow,
            focus: focus || 'N/A',
            success: result.success,
            duration: result.totalDuration,
            steps: result.steps.map((s: any) => ({
              name: s.name,
              success: s.result.success,
              duration: s.duration,
              data: s.result.data,
              error: s.result.error,
            })),
            errors: result.errors,
          },
          null,
          2
        ),
      },
    ],
  };
}
