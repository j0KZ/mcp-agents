/**
 * Main wizard orchestration
 */
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
export interface WizardSelections {
    editor: string;
    mcps: string[];
    preferences: {
        reviewSeverity: 'lenient' | 'moderate' | 'strict';
        testFramework?: string;
        installGlobally: boolean;
    };
}
export declare function runWizard(args: WizardArgs): Promise<void>;
//# sourceMappingURL=wizard.d.ts.map