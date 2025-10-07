/**
 * Changelog generation helpers
 */
/**
 * Grouped commits by type
 */
export interface GroupedCommits {
    feat: string[];
    fix: string[];
    docs: string[];
    other: string[];
}
/**
 * Group commits by conventional commit type
 *
 * @param commits - Array of commit lines (format: hash|message|author|date)
 * @returns Grouped commits by type
 */
export declare function groupCommitsByType(commits: string[]): GroupedCommits;
/**
 * Build changelog sections from grouped commits
 *
 * @param grouped - Grouped commits
 * @returns Array of section lines
 */
export declare function buildChangelogSections(grouped: GroupedCommits): string[];
//# sourceMappingURL=changelog-builder.d.ts.map