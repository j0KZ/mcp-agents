/**
 * GitHooks: Automated git hooks installation and management
 * Ensures code quality BEFORE it gets committed
 */
export declare class GitHooks {
    private hooksPath;
    constructor();
    /**
     * Install a git hook
     */
    install(hookName: string, handler: (files: string[]) => Promise<void>): Promise<void>;
    /**
     * Generate pre-commit hook script
     */
    private generatePreCommitHook;
    /**
     * Generate pre-push hook script
     */
    private generatePrePushHook;
    /**
     * Generate commit-msg hook script
     */
    private generateCommitMsgHook;
    /**
     * Install all recommended hooks
     */
    installAll(): Promise<void>;
    /**
     * Create husky configuration (alternative to git hooks)
     */
    setupHusky(): Promise<void>;
    /**
     * Create lint-staged configuration
     */
    setupLintStaged(): Promise<void>;
    /**
     * Get list of staged files
     */
    getStagedFiles(): Promise<string[]>;
    /**
     * Check if hooks are installed
     */
    areHooksInstalled(): Promise<boolean>;
}
//# sourceMappingURL=git-hooks.d.ts.map