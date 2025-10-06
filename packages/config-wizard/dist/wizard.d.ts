/**
 * Main wizard orchestration
 */
import { type ProjectInfo } from './detectors/project.js';
export interface WizardArgs {
    editor?: string;
    mcps?: string;
    dryRun?: boolean;
    force?: boolean;
    output?: string;
    verbose?: boolean;
    help?: boolean;
    version?: boolean;
}
export interface WizardDeps {
    spinner?: (text: string) => any;
    detectEditor?: () => Promise<string | null>;
    detectProject?: () => Promise<ProjectInfo>;
    detectTestFramework?: () => Promise<string | null>;
    generateConfig?: (selections: WizardSelections) => Promise<any>;
    validateConfig?: (selections: WizardSelections, detected: any) => Promise<string[]>;
    installMCPs?: (mcps: string[], verbose?: boolean) => Promise<void>;
    writeConfigFile?: (config: any, editor: string, path?: string, force?: boolean) => Promise<string>;
    inquirerPrompt?: (questions: any) => Promise<any>;
    editorPrompt?: (defaultEditor: string | null) => any;
    mcpPrompt?: (project: any) => any;
    preferencesPrompt?: (detected: any) => any[];
}
export interface WizardSelections {
    editor: string;
    mcps: string[];
    preferences: {
        reviewSeverity: 'lenient' | 'moderate' | 'strict';
        testFramework?: string;
        installGlobally: boolean;
    };
}
export declare function runWizard(args: WizardArgs, deps?: WizardDeps): Promise<void>;
export declare function gatherSelections(args: WizardArgs, detected: any, deps?: WizardDeps): Promise<WizardSelections>;
//# sourceMappingURL=wizard.d.ts.map