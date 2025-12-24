/**
 * Code-mode workflow templates
 *
 * These templates run in the Docker MCP Gateway sandbox.
 * Only the final result returns to the model context, saving tokens.
 *
 * Available in sandbox:
 * - mcp.call(server, tool, params) - Call MCP tool
 * - params - Parameters passed from orchestrator
 * - console.log() - Logging (captured but not returned)
 */
/**
 * Pre-commit workflow template
 * Runs code review and security scan on changed files
 */
export const PRE_COMMIT_CODE = `
// Pre-commit workflow - runs in sandbox
const results = {
  review: null,
  security: null,
  passed: true,
  issues: []
};

// 1. Run batch code review
results.review = await mcp.call('smart-reviewer', 'batch_review', {
  filePaths: params.files,
  config: { severity: 'moderate', response_format: 'concise' }
});

// 2. Run security scan in parallel
results.security = await mcp.call('security-scanner', 'scan_project', {
  projectPath: params.projectPath || '.',
  config: {
    includePatterns: params.files,
    minSeverity: 'medium',
    response_format: 'concise'
  }
});

// 3. Determine pass/fail
const criticalReviewIssues = results.review?.issues?.filter(i => i.severity === 'critical') || [];
const criticalSecurityIssues = results.security?.issues?.filter(i => i.severity === 'critical' || i.severity === 'high') || [];

results.passed = criticalReviewIssues.length === 0 && criticalSecurityIssues.length === 0;
results.issues = [...criticalReviewIssues, ...criticalSecurityIssues];

// Return summary only (not full results)
return {
  status: results.passed ? 'passed' : 'blocked',
  filesReviewed: params.files.length,
  reviewScore: results.review?.overallScore || 0,
  securityIssues: results.security?.totalIssues || 0,
  criticalIssues: results.issues.length,
  actionItems: results.issues.slice(0, 5).map(i => ({
    file: i.file,
    line: i.line,
    message: i.message,
    severity: i.severity
  }))
};
`;
/**
 * Pre-merge workflow template
 * Comprehensive checks before merging PR
 */
export const PRE_MERGE_CODE = `
// Pre-merge workflow - runs in sandbox
const results = {
  review: null,
  security: null,
  architecture: null,
  tests: null
};

// 1. Run security scan first (blocking issues)
results.security = await mcp.call('security-scanner', 'scan_project', {
  projectPath: params.projectPath,
  config: { minSeverity: 'medium', response_format: 'minimal' }
});

// Check for critical security issues
if (results.security?.criticalCount > 0) {
  return {
    status: 'blocked',
    reason: 'Critical security issues found',
    securityIssues: results.security.issues.filter(i => i.severity === 'critical'),
    recommendation: 'Fix critical security issues before merging'
  };
}

// 2. Run remaining checks in parallel
const [review, arch, tests] = await Promise.all([
  mcp.call('smart-reviewer', 'batch_review', {
    filePaths: params.files,
    config: { severity: 'strict', response_format: 'concise' }
  }),
  mcp.call('architecture-analyzer', 'analyze_architecture', {
    projectPath: params.projectPath,
    config: { detectCircular: true, response_format: 'minimal' }
  }),
  mcp.call('test-generator', 'analyze_coverage', {
    sourceFiles: params.files,
    config: { response_format: 'minimal' }
  })
]);

results.review = review;
results.architecture = arch;
results.tests = tests;

// 3. Calculate overall status
const hasCircularDeps = results.architecture?.circularDependencies?.length > 0;
const lowCoverage = (results.tests?.coverage || 0) < 70;
const hasReviewIssues = (results.review?.criticalCount || 0) > 0;

const status = hasCircularDeps || lowCoverage || hasReviewIssues ? 'warning' : 'passed';

// Return summary only
return {
  status,
  summary: {
    filesChanged: params.files.length,
    reviewScore: results.review?.overallScore || 0,
    securityIssues: results.security?.totalIssues || 0,
    testCoverage: results.tests?.coverage || 0,
    circularDeps: results.architecture?.circularDependencies?.length || 0,
    architectureScore: results.architecture?.score || 0
  },
  warnings: [
    hasCircularDeps && 'Circular dependencies detected',
    lowCoverage && 'Test coverage below 70%',
    hasReviewIssues && 'Critical review issues found'
  ].filter(Boolean),
  actionItems: [
    ...(results.review?.suggestions?.slice(0, 3) || []),
    ...(results.security?.issues?.slice(0, 2) || [])
  ]
};
`;
/**
 * Quality audit workflow template
 * Deep analysis and reporting
 */
export const QUALITY_AUDIT_CODE = `
// Quality audit workflow - runs in sandbox
const results = {
  security: null,
  architecture: null,
  documentation: null
};

// Run all audits in parallel
const [security, architecture, docs] = await Promise.all([
  mcp.call('security-scanner', 'generate_security_report', {
    projectPath: params.projectPath,
    outputPath: params.reportPath + '/security.md'
  }),
  mcp.call('architecture-analyzer', 'analyze_architecture', {
    projectPath: params.projectPath,
    config: {
      detectCircular: true,
      generateGraph: true,
      maxDepth: 5,
      response_format: 'detailed'
    }
  }),
  mcp.call('doc-generator', 'generate_full_docs', {
    projectPath: params.projectPath,
    outputPath: params.reportPath + '/docs'
  })
]);

results.security = security;
results.architecture = architecture;
results.documentation = docs;

// Generate audit summary
return {
  status: 'complete',
  projectPath: params.projectPath,
  reports: {
    security: params.reportPath + '/security.md',
    architecture: params.reportPath + '/architecture.md',
    documentation: params.reportPath + '/docs'
  },
  metrics: {
    securityScore: results.security?.score || 0,
    architectureScore: results.architecture?.score || 0,
    documentationCoverage: results.documentation?.coverage || 0,
    totalIssues: (results.security?.totalIssues || 0) +
                 (results.architecture?.issues?.length || 0)
  },
  highlights: {
    criticalSecurityIssues: results.security?.criticalCount || 0,
    circularDependencies: results.architecture?.circularDependencies?.length || 0,
    undocumentedExports: results.documentation?.undocumented || 0
  }
};
`;
/**
 * Get code template by workflow name
 */
export function getCodeTemplate(workflowName) {
    switch (workflowName) {
        case 'pre-commit':
            return PRE_COMMIT_CODE;
        case 'pre-merge':
            return PRE_MERGE_CODE;
        case 'quality-audit':
            return QUALITY_AUDIT_CODE;
        default:
            throw new Error(`Unknown workflow: ${workflowName}`);
    }
}
/**
 * Get servers required for workflow
 */
export function getWorkflowServers(workflowName) {
    switch (workflowName) {
        case 'pre-commit':
            return ['smart-reviewer', 'security-scanner'];
        case 'pre-merge':
            return ['smart-reviewer', 'security-scanner', 'architecture-analyzer', 'test-generator'];
        case 'quality-audit':
            return ['security-scanner', 'architecture-analyzer', 'doc-generator'];
        default:
            throw new Error(`Unknown workflow: ${workflowName}`);
    }
}
//# sourceMappingURL=code-templates.js.map