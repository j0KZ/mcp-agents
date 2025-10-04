/**
 * MCP selection prompt
 */
import { type ProjectInfo } from '../detectors/project.js';
export declare function mcpPrompt(project: ProjectInfo): {
    type: string;
    name: string;
    message: string;
    choices: {
        name: string;
        value: string;
        checked: boolean;
    }[];
    validate: (answer: string[]) => true | "You must select at least one MCP tool.";
};
//# sourceMappingURL=mcp-select.d.ts.map