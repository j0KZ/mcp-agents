/**
 * Detect project type and characteristics
 */
export interface ProjectInfo {
    language: 'typescript' | 'javascript' | 'python' | 'unknown';
    framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'next' | 'express' | 'fastify' | 'nest';
    packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
    hasTests: boolean;
}
export declare function detectProject(): Promise<ProjectInfo>;
export declare function getRecommendedMCPs(project: ProjectInfo): string[];
//# sourceMappingURL=project.d.ts.map