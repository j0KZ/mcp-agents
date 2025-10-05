/**
 * Pre-built workflows for common development tasks
 */
import { MCPPipeline } from '@j0kz/shared';
/**
 * Workflow metadata
 */
export const WORKFLOWS = {
    'pre-commit': {
        name: 'Pre-commit Quality Check',
        description: 'Fast quality checks for local commits - code review and security scan',
        steps: 2,
    },
    'pre-merge': {
        name: 'Pre-merge Validation',
        description: 'Comprehensive checks before merging PR - review, architecture, security, and tests',
        steps: 4,
    },
    'quality-audit': {
        name: 'Quality Audit',
        description: 'Deep analysis and reporting - security report, architecture analysis, and documentation',
        steps: 3,
    },
};
/**
 * Create pre-commit workflow
 *
 * Steps:
 * 1. Code review (moderate severity)
 * 2. Security scan
 *
 * @param files - Files to check
 */
export function createPreCommitWorkflow(files) {
    const pipeline = new MCPPipeline();
    // Step 1: Code review
    pipeline.addStep({
        name: 'code-review',
        tool: 'smart-reviewer',
        config: {
            action: 'review_file',
            params: {
                filePath: files[0],
                config: { severity: 'moderate' },
            },
        },
    });
    // Step 2: Security scan
    pipeline.addStep({
        name: 'security-scan',
        tool: 'security-scanner',
        config: {
            action: 'scan_file',
            params: { filePath: files[0] },
        },
    });
    return pipeline;
}
/**
 * Create pre-merge workflow
 *
 * Steps:
 * 1. Batch code review (strict)
 * 2. Architecture analysis
 * 3. Security audit
 * 4. Test coverage check (depends on review passing)
 *
 * @param files - Files changed in PR
 * @param projectPath - Project root path
 */
export function createPreMergeWorkflow(files, projectPath) {
    const pipeline = new MCPPipeline();
    // Step 1: Batch code review
    pipeline.addStep({
        name: 'batch-review',
        tool: 'smart-reviewer',
        config: {
            action: 'batch_review',
            params: {
                filePaths: files,
                config: { severity: 'strict' },
            },
        },
    });
    // Step 2: Architecture analysis
    pipeline.addStep({
        name: 'architecture-analysis',
        tool: 'architecture-analyzer',
        config: {
            action: 'analyze_architecture',
            params: {
                projectPath,
                config: {
                    detectCircular: true,
                    generateGraph: false,
                },
            },
        },
    });
    // Step 3: Security audit
    pipeline.addStep({
        name: 'security-audit',
        tool: 'security-scanner',
        config: {
            action: 'scan_project',
            params: {
                projectPath,
                config: { minSeverity: 'medium' },
            },
        },
    });
    // Step 4: Test coverage (depends on review)
    pipeline.addStep({
        name: 'test-coverage',
        tool: 'test-generator',
        config: {
            action: 'batch_generate',
            params: {
                sourceFiles: files,
                config: {
                    coverage: 70,
                    framework: 'vitest',
                },
            },
        },
        dependsOn: ['batch-review'],
    });
    return pipeline;
}
/**
 * Create quality audit workflow
 *
 * Steps:
 * 1. Security report generation
 * 2. Architecture analysis with dependency graph
 * 3. Documentation generation
 *
 * @param projectPath - Project root path
 */
export function createQualityAuditWorkflow(projectPath) {
    const pipeline = new MCPPipeline();
    // Step 1: Security report
    pipeline.addStep({
        name: 'security-report',
        tool: 'security-scanner',
        config: {
            action: 'generate_security_report',
            params: {
                projectPath,
                outputPath: `${projectPath}/reports/security.md`,
            },
        },
    });
    // Step 2: Architecture analysis
    pipeline.addStep({
        name: 'architecture-analysis',
        tool: 'architecture-analyzer',
        config: {
            action: 'analyze_architecture',
            params: {
                projectPath,
                config: {
                    detectCircular: true,
                    generateGraph: true,
                    maxDepth: 5,
                },
            },
        },
    });
    // Step 3: Generate documentation
    pipeline.addStep({
        name: 'generate-docs',
        tool: 'doc-generator',
        config: {
            action: 'generate_full_docs',
            params: { projectPath },
        },
    });
    return pipeline;
}
/**
 * Create workflow by name
 *
 * @param name - Workflow name
 * @param files - Files to process
 * @param projectPath - Project root path
 */
export function createWorkflow(name, files, projectPath) {
    switch (name) {
        case 'pre-commit':
            return createPreCommitWorkflow(files);
        case 'pre-merge':
            return createPreMergeWorkflow(files, projectPath);
        case 'quality-audit':
            return createQualityAuditWorkflow(projectPath);
        default:
            throw new Error(`Unknown workflow: ${name}`);
    }
}
//# sourceMappingURL=workflows.js.map