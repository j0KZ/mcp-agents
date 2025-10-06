/**
 * Detect project type and characteristics
 */
import fs from 'fs-extra';
import path from 'path';
export async function detectProject() {
    const cwd = process.cwd();
    const info = {
        language: 'unknown',
        packageManager: 'npm',
        hasTests: false,
    };
    // Check for package.json
    const pkgPath = path.join(cwd, 'package.json');
    if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJSON(pkgPath);
        // Detect language
        if (await fs.pathExists(path.join(cwd, 'tsconfig.json'))) {
            info.language = 'typescript';
        }
        else {
            info.language = 'javascript';
        }
        // Detect framework
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps.react) {
            info.framework = 'react';
            if (deps.next)
                info.framework = 'next';
        }
        else if (deps.vue) {
            info.framework = 'vue';
        }
        else if (deps['@angular/core']) {
            info.framework = 'angular';
        }
        else if (deps.svelte) {
            info.framework = 'svelte';
        }
        else if (deps.express) {
            info.framework = 'express';
        }
        else if (deps.fastify) {
            info.framework = 'fastify';
        }
        else if (deps['@nestjs/core']) {
            info.framework = 'nest';
        }
        // Detect package manager
        if (await fs.pathExists(path.join(cwd, 'pnpm-lock.yaml'))) {
            info.packageManager = 'pnpm';
        }
        else if (await fs.pathExists(path.join(cwd, 'yarn.lock'))) {
            info.packageManager = 'yarn';
        }
        else if (await fs.pathExists(path.join(cwd, 'bun.lockb'))) {
            info.packageManager = 'bun';
        }
        else {
            info.packageManager = 'npm';
        }
        // Check for tests
        info.hasTests = !!(pkg.scripts?.test || deps.jest || deps.vitest || deps.mocha || deps.ava);
    }
    else if (await fs.pathExists(path.join(cwd, 'requirements.txt'))) {
        info.language = 'python';
    }
    return info;
}
export function getRecommendedMCPs(project) {
    const recommendations = ['smart-reviewer', 'security-scanner'];
    // Add framework-specific recommendations
    if (project.framework === 'react' || project.framework === 'next') {
        recommendations.push('test-generator');
    }
    if (project.framework === 'express' ||
        project.framework === 'fastify' ||
        project.framework === 'nest') {
        recommendations.push('api-designer', 'db-schema');
    }
    if (project.hasTests) {
        if (!recommendations.includes('test-generator')) {
            recommendations.push('test-generator');
        }
    }
    // Always suggest architecture analyzer for larger projects
    recommendations.push('architecture-analyzer');
    return recommendations;
}
//# sourceMappingURL=project.js.map