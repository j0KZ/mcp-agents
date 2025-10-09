/**
 * Editor selection prompt
 */
import type { SupportedEditor } from '../detectors/editor.js';
export declare function editorPrompt(detectedEditor: SupportedEditor): {
    type: string;
    name: string;
    message: string;
    choices: {
        name: string;
        value: string;
    }[];
    default: "claude-code" | "cursor" | "windsurf" | "vscode" | "roo" | "qoder";
};
//# sourceMappingURL=editor-select.d.ts.map