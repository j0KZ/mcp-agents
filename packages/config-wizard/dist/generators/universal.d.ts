/**
 * Universal config generator
 * Works with ANY MCP-compatible IDE by including explicit type field
 */
import type { WizardSelections } from '../wizard.js';
/**
 * Generate universal MCP config that works with ALL IDEs
 * Including Qoder, Claude Code, Cursor, Windsurf, VSCode, etc.
 */
export declare function generateUniversalConfig(selections: WizardSelections): any;
/**
 * Generate config for specific IDE with adaptations
 */
export declare function generateIDESpecificConfig(selections: WizardSelections, ide: 'claude' | 'cursor' | 'windsurf' | 'qoder' | 'vscode' | 'roo'): any;
//# sourceMappingURL=universal.d.ts.map