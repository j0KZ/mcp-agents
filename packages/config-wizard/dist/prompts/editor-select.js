/**
 * Editor selection prompt
 */
export function editorPrompt(detectedEditor) {
    return {
        type: 'list',
        name: 'editor',
        message: 'Select your editor:',
        choices: [
            { name: 'Claude Code (Anthropic)', value: 'claude-code' },
            { name: 'Cursor (Anysphere)', value: 'cursor' },
            { name: 'Windsurf (Codeium)', value: 'windsurf' },
            { name: 'VS Code + Continue', value: 'vscode' },
            { name: 'Roo Code', value: 'roo' }
        ],
        default: detectedEditor || 'claude-code'
    };
}
//# sourceMappingURL=editor-select.js.map