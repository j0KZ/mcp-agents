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
export declare const PRE_COMMIT_CODE = "\n// Pre-commit workflow - runs in sandbox\nconst results = {\n  review: null,\n  security: null,\n  passed: true,\n  issues: []\n};\n\n// 1. Run batch code review\nresults.review = await mcp.call('smart-reviewer', 'batch_review', {\n  filePaths: params.files,\n  config: { severity: 'moderate', response_format: 'concise' }\n});\n\n// 2. Run security scan in parallel\nresults.security = await mcp.call('security-scanner', 'scan_project', {\n  projectPath: params.projectPath || '.',\n  config: {\n    includePatterns: params.files,\n    minSeverity: 'medium',\n    response_format: 'concise'\n  }\n});\n\n// 3. Determine pass/fail\nconst criticalReviewIssues = results.review?.issues?.filter(i => i.severity === 'critical') || [];\nconst criticalSecurityIssues = results.security?.issues?.filter(i => i.severity === 'critical' || i.severity === 'high') || [];\n\nresults.passed = criticalReviewIssues.length === 0 && criticalSecurityIssues.length === 0;\nresults.issues = [...criticalReviewIssues, ...criticalSecurityIssues];\n\n// Return summary only (not full results)\nreturn {\n  status: results.passed ? 'passed' : 'blocked',\n  filesReviewed: params.files.length,\n  reviewScore: results.review?.overallScore || 0,\n  securityIssues: results.security?.totalIssues || 0,\n  criticalIssues: results.issues.length,\n  actionItems: results.issues.slice(0, 5).map(i => ({\n    file: i.file,\n    line: i.line,\n    message: i.message,\n    severity: i.severity\n  }))\n};\n";
/**
 * Pre-merge workflow template
 * Comprehensive checks before merging PR
 */
export declare const PRE_MERGE_CODE = "\n// Pre-merge workflow - runs in sandbox\nconst results = {\n  review: null,\n  security: null,\n  architecture: null,\n  tests: null\n};\n\n// 1. Run security scan first (blocking issues)\nresults.security = await mcp.call('security-scanner', 'scan_project', {\n  projectPath: params.projectPath,\n  config: { minSeverity: 'medium', response_format: 'minimal' }\n});\n\n// Check for critical security issues\nif (results.security?.criticalCount > 0) {\n  return {\n    status: 'blocked',\n    reason: 'Critical security issues found',\n    securityIssues: results.security.issues.filter(i => i.severity === 'critical'),\n    recommendation: 'Fix critical security issues before merging'\n  };\n}\n\n// 2. Run remaining checks in parallel\nconst [review, arch, tests] = await Promise.all([\n  mcp.call('smart-reviewer', 'batch_review', {\n    filePaths: params.files,\n    config: { severity: 'strict', response_format: 'concise' }\n  }),\n  mcp.call('architecture-analyzer', 'analyze_architecture', {\n    projectPath: params.projectPath,\n    config: { detectCircular: true, response_format: 'minimal' }\n  }),\n  mcp.call('test-generator', 'analyze_coverage', {\n    sourceFiles: params.files,\n    config: { response_format: 'minimal' }\n  })\n]);\n\nresults.review = review;\nresults.architecture = arch;\nresults.tests = tests;\n\n// 3. Calculate overall status\nconst hasCircularDeps = results.architecture?.circularDependencies?.length > 0;\nconst lowCoverage = (results.tests?.coverage || 0) < 70;\nconst hasReviewIssues = (results.review?.criticalCount || 0) > 0;\n\nconst status = hasCircularDeps || lowCoverage || hasReviewIssues ? 'warning' : 'passed';\n\n// Return summary only\nreturn {\n  status,\n  summary: {\n    filesChanged: params.files.length,\n    reviewScore: results.review?.overallScore || 0,\n    securityIssues: results.security?.totalIssues || 0,\n    testCoverage: results.tests?.coverage || 0,\n    circularDeps: results.architecture?.circularDependencies?.length || 0,\n    architectureScore: results.architecture?.score || 0\n  },\n  warnings: [\n    hasCircularDeps && 'Circular dependencies detected',\n    lowCoverage && 'Test coverage below 70%',\n    hasReviewIssues && 'Critical review issues found'\n  ].filter(Boolean),\n  actionItems: [\n    ...(results.review?.suggestions?.slice(0, 3) || []),\n    ...(results.security?.issues?.slice(0, 2) || [])\n  ]\n};\n";
/**
 * Quality audit workflow template
 * Deep analysis and reporting
 */
export declare const QUALITY_AUDIT_CODE = "\n// Quality audit workflow - runs in sandbox\nconst results = {\n  security: null,\n  architecture: null,\n  documentation: null\n};\n\n// Run all audits in parallel\nconst [security, architecture, docs] = await Promise.all([\n  mcp.call('security-scanner', 'generate_security_report', {\n    projectPath: params.projectPath,\n    outputPath: params.reportPath + '/security.md'\n  }),\n  mcp.call('architecture-analyzer', 'analyze_architecture', {\n    projectPath: params.projectPath,\n    config: {\n      detectCircular: true,\n      generateGraph: true,\n      maxDepth: 5,\n      response_format: 'detailed'\n    }\n  }),\n  mcp.call('doc-generator', 'generate_full_docs', {\n    projectPath: params.projectPath,\n    outputPath: params.reportPath + '/docs'\n  })\n]);\n\nresults.security = security;\nresults.architecture = architecture;\nresults.documentation = docs;\n\n// Generate audit summary\nreturn {\n  status: 'complete',\n  projectPath: params.projectPath,\n  reports: {\n    security: params.reportPath + '/security.md',\n    architecture: params.reportPath + '/architecture.md',\n    documentation: params.reportPath + '/docs'\n  },\n  metrics: {\n    securityScore: results.security?.score || 0,\n    architectureScore: results.architecture?.score || 0,\n    documentationCoverage: results.documentation?.coverage || 0,\n    totalIssues: (results.security?.totalIssues || 0) +\n                 (results.architecture?.issues?.length || 0)\n  },\n  highlights: {\n    criticalSecurityIssues: results.security?.criticalCount || 0,\n    circularDependencies: results.architecture?.circularDependencies?.length || 0,\n    undocumentedExports: results.documentation?.undocumented || 0\n  }\n};\n";
/**
 * Get code template by workflow name
 */
export declare function getCodeTemplate(workflowName: 'pre-commit' | 'pre-merge' | 'quality-audit'): string;
/**
 * Get servers required for workflow
 */
export declare function getWorkflowServers(workflowName: 'pre-commit' | 'pre-merge' | 'quality-audit'): string[];
//# sourceMappingURL=code-templates.d.ts.map