/**
 * Health Check System for MCP Servers
 * Provides comprehensive diagnostics and status monitoring
 */
import { EnvironmentDetector } from '../runtime/environment-detector.js';
export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
        stdio: CheckResult;
        filesystem: CheckResult;
        dependencies: CheckResult;
        performance: CheckResult;
    };
    issues: HealthIssue[];
    timestamp: string;
    uptime: number;
    version: string;
    environment: ReturnType<typeof EnvironmentDetector.detect>;
}
export interface CheckResult {
    passed: boolean;
    message: string;
    details?: Record<string, unknown>;
    error?: string;
    warning?: string;
    fix?: string;
}
export interface HealthIssue {
    severity: 'critical' | 'warning' | 'info';
    message: string;
    fix: string;
    component: string;
}
export declare class HealthChecker {
    private version;
    private serverName;
    constructor(serverName: string, version: string);
    /**
     * Run complete health check
     */
    check(_verbose?: boolean): Promise<HealthCheckResult>;
    /**
     * Check stdio communication
     */
    private checkStdio;
    /**
     * Check filesystem access
     */
    private checkFilesystem;
    /**
     * Check critical dependencies
     */
    private checkDependencies;
    /**
     * Check performance metrics
     */
    private checkPerformance;
    /**
     * Test file access
     */
    private testFileAccess;
    /**
     * Check if module is available
     */
    private checkModule;
    /**
     * Identify issues from check results
     */
    private identifyIssues;
    /**
     * Determine overall health status
     */
    private determineStatus;
    /**
     * Format health check result as human-readable string
     */
    static format(result: HealthCheckResult): string;
}
//# sourceMappingURL=health-checker.d.ts.map