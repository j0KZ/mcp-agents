/**
 * Response builders for MCP protocol
 * Extracted to keep mcp-server.ts under 300 LOC
 * BILINGUAL: Supports English and Spanish responses
 */
import { Language } from '@j0kz/shared';
/**
 * Build clarification response when workflow/focus is missing
 * Returns response in specified language
 */
export declare function buildClarificationResponse(language?: Language): {
    content: {
        type: string;
        text: string;
    }[];
};
/**
 * Build clarification response for invalid focus
 * Returns response in specified language
 */
export declare function buildInvalidFocusResponse(invalidFocus: string, language?: Language): {
    content: {
        type: string;
        text: string;
    }[];
};
/**
 * Build success response with workflow results
 */
export declare function buildSuccessResponse(selectedWorkflow: string, focus: string | undefined, result: any): {
    content: {
        type: string;
        text: string;
    }[];
};
//# sourceMappingURL=response-builder.d.ts.map