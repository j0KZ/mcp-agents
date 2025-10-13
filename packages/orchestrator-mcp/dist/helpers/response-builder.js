/**
 * Response builders for MCP protocol
 * Extracted to keep mcp-server.ts under 300 LOC
 */
import { getClarificationOptions } from './workflow-selector.js';
/**
 * Build clarification response when workflow/focus is missing
 */
export function buildClarificationResponse() {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({
                    status: 'needs_clarification',
                    message: 'To provide focused analysis, I need to know what aspect to check.',
                    question: 'What would you like me to focus on?',
                    options: getClarificationOptions(),
                }, null, 2),
            },
        ],
    };
}
/**
 * Build clarification response for invalid focus
 */
export function buildInvalidFocusResponse(invalidFocus) {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({
                    status: 'needs_clarification',
                    message: `Invalid focus "${invalidFocus}". Please choose from valid options.`,
                    question: 'What would you like me to focus on?',
                    options: getClarificationOptions(),
                }, null, 2),
            },
        ],
    };
}
/**
 * Build success response with workflow results
 */
export function buildSuccessResponse(selectedWorkflow, focus, result) {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({
                    status: 'success',
                    workflow: selectedWorkflow,
                    focus: focus || 'N/A',
                    success: result.success,
                    duration: result.totalDuration,
                    steps: result.steps.map((s) => ({
                        name: s.name,
                        success: s.result.success,
                        duration: s.duration,
                        data: s.result.data,
                        error: s.result.error,
                    })),
                    errors: result.errors,
                }, null, 2),
            },
        ],
    };
}
//# sourceMappingURL=response-builder.js.map