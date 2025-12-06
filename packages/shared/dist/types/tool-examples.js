/**
 * Tool Use Examples - Anthropic Advanced Tool Use (Nov 2025)
 *
 * Types for implementing Tool Use Examples following Anthropic's best practices.
 * Examples improve parameter accuracy from 72% to 90%.
 *
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */
/**
 * Helper to create a tool example with type safety
 */
export function createToolExample(name, description, input, output) {
    return {
        name,
        description,
        input: input,
        output: output,
    };
}
/**
 * Validate that a tool definition has proper examples
 */
export function validateToolExamples(tool) {
    const errors = [];
    if (!tool.examples || tool.examples.length === 0) {
        errors.push(`Tool "${tool.name}" has no examples`);
        return { valid: false, errors };
    }
    // Recommendation: 2+ examples, but 1 is acceptable minimum
    if (tool.examples.length < 1) {
        errors.push(`Tool "${tool.name}" should have at least 1 example`);
    }
    for (const example of tool.examples) {
        if (!example.name || example.name.length < 3) {
            errors.push(`Example in "${tool.name}" has invalid name`);
        }
        if (!example.description || example.description.length < 10) {
            errors.push(`Example "${example.name}" in "${tool.name}" has insufficient description`);
        }
        // Allow empty input only if no required fields
        const hasRequiredFields = tool.inputSchema.required && tool.inputSchema.required.length > 0;
        if (hasRequiredFields && (!example.input || Object.keys(example.input).length === 0)) {
            errors.push(`Example "${example.name}" in "${tool.name}" has empty input but tool requires fields`);
        }
        if (!example.output || Object.keys(example.output).length === 0) {
            errors.push(`Example "${example.name}" in "${tool.name}" has empty output`);
        }
        // Validate required fields are in example input
        if (tool.inputSchema.required) {
            for (const required of tool.inputSchema.required) {
                if (!(required in example.input)) {
                    errors.push(`Example "${example.name}" in "${tool.name}" missing required field: ${required}`);
                }
            }
        }
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Format examples for MCP tool definition
 * Converts examples to the format expected by MCP SDK
 */
export function formatExamplesForMCP(examples) {
    return examples.map(ex => ({
        name: ex.name,
        description: ex.description,
        value: {
            input: ex.input,
            output: ex.output,
        },
    }));
}
//# sourceMappingURL=tool-examples.js.map