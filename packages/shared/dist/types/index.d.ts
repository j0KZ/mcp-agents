/**
 * Shared types for all MCP tools
 */
/**
 * Base result type for all MCP operations
 */
export interface MCPResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    warnings?: string[];
    metadata?: Record<string, any>;
    timestamp?: string;
}
/**
 * Base configuration for all MCP tools
 */
export interface MCPConfig {
    verbose?: boolean;
    dryRun?: boolean;
    outputFormat?: 'json' | 'text' | 'markdown';
    cache?: boolean;
    parallel?: boolean;
    maxConcurrency?: number;
}
/**
 * File information shared across MCPs
 */
export interface FileInfo {
    path: string;
    relativePath?: string;
    name: string;
    extension: string;
    size: number;
    mtime: Date;
    content?: string;
    hash?: string;
}
/**
 * Code analysis result (shared between analyzers)
 */
export interface CodeAnalysisResult {
    filePath: string;
    linesOfCode: number;
    complexity: number;
    maintainability: number;
    issues: CodeIssue[];
    metrics: CodeMetrics;
    dependencies: string[];
}
/**
 * Code issue (standardized across reviewers)
 */
export interface CodeIssue {
    line: number;
    column?: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    rule?: string;
    category?: string;
    fix?: CodeFix;
}
/**
 * Code fix suggestion
 */
export interface CodeFix {
    description: string;
    oldCode?: string;
    newCode?: string;
    automatic?: boolean;
}
/**
 * Code metrics (standardized)
 */
export interface CodeMetrics {
    complexity: number;
    maintainability: number;
    linesOfCode: number;
    commentDensity: number;
    duplicateBlocks?: number;
    testCoverage?: number;
}
/**
 * Test result (standardized)
 */
export interface TestResult {
    framework: string;
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    coverage: number;
    duration: number;
}
/**
 * Security finding (standardized)
 */
export interface SecurityFinding {
    id: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    filePath: string;
    line: number;
    column?: number;
    recommendation: string;
}
/**
 * MCP tool metadata
 */
export interface MCPToolMetadata {
    name: string;
    version: string;
    description: string;
    capabilities: string[];
    dependencies: string[];
    outputFormats: string[];
}
/**
 * Pipeline step for MCP integration
 */
export interface PipelineStep {
    name: string;
    tool: string;
    config: MCPConfig & {
        action?: string;
        params?: any;
    };
    input?: any;
    dependsOn?: string[];
}
/**
 * Pipeline result
 */
export interface PipelineResult {
    steps: {
        name: string;
        tool: string;
        result: MCPResult;
        duration: number;
    }[];
    totalDuration: number;
    success: boolean;
    errors: string[];
}
/**
 * Cache entry
 */
export interface CacheEntry<T = any> {
    key: string;
    value: T;
    timestamp: number;
    ttl: number;
    hits: number;
}
/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    startTime: number;
    endTime: number;
    duration: number;
    memoryUsed: number;
    cpuUsed?: number;
    filesProcessed?: number;
    cacheHits?: number;
    cacheMisses?: number;
}
//# sourceMappingURL=index.d.ts.map