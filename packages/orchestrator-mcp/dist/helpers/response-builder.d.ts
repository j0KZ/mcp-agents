/**
 * Response builders for MCP protocol
 * Extracted to keep mcp-server.ts under 300 LOC
 */
/**
 * Build clarification response when workflow/focus is missing
 */
export declare function buildClarificationResponse(): {
    content: {
        type: string;
        text: string;
    }[];
};
/**
 * Build clarification response for invalid focus
 */
export declare function buildInvalidFocusResponse(invalidFocus: string): {
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