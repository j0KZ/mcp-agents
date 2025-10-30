/**
 * Auto-Pilot: Smart automation system that runs everything automatically
 * For lazy developers who just want their code to be perfect without thinking
 */
export declare class AutoPilot {
    private analyzer;
    private fixer;
    private context;
    private isRunning;
    constructor();
    /**
     * ONE COMMAND TO RULE THEM ALL
     * Just run this and forget about it
     */
    start(): Promise<void>;
    /**
     * Watch files and run appropriate tools AUTOMATICALLY
     */
    private watchFiles;
    /**
     * SMART decision engine - knows what to do without being told
     */
    private decideActions;
    /**
     * Execute actions WITHOUT user intervention
     */
    private executeAction;
    /**
     * Git hooks - run EVERYTHING automatically before commit/push
     */
    private installGitHooks;
    /**
     * VS Code / IDE Integration - real-time assistance
     */
    private setupIDEIntegration;
    /**
     * Smart code detection algorithms
     */
    private looksLikeBadCode;
    private hasNoTests;
    private hasSecurityRisks;
    private isComplexCode;
    private hasConsoleLog;
    private lacksComments;
    /**
     * Run initial analysis on the project
     */
    private runInitialAnalysis;
    /**
     * Helper methods
     */
    private readFile;
    private writeJSON;
    private fileExists;
    private hasCriticalIssues;
    private generateTestsFor;
}
export declare function activate(): Promise<void>;
//# sourceMappingURL=index.d.ts.map