/**
 * Detect installed editors
 */
export type SupportedEditor = 'claude-code' | 'cursor' | 'windsurf' | 'vscode' | 'roo' | 'qoder' | null;
export declare function detectEditor(): Promise<SupportedEditor>;
export declare function detectInstalledEditors(): Promise<SupportedEditor[]>;
export declare function getEditorConfigPath(editor: SupportedEditor): string | null;
//# sourceMappingURL=editor.d.ts.map