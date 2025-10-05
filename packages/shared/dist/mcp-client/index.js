/**
 * MCP Client - Invoke other MCP tools via stdio
 * Enables MCP-to-MCP communication for workflow orchestration
 */
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
/**
 * Client for invoking MCP tools via stdio
 */
export class MCPClient {
    requestId = 0;
    defaultTimeout = 30000; // 30 seconds
    /**
     * Invoke an MCP tool
     *
     * @param mcpName - Name of MCP (e.g., 'smart-reviewer')
     * @param toolName - Tool to call (e.g., 'review_file')
     * @param params - Tool parameters
     * @param timeout - Optional timeout in milliseconds
     * @returns Tool result
     */
    async invoke(mcpName, toolName, params, timeout) {
        // 1. Resolve MCP binary path
        const mcpPath = this.resolveMCPBinary(mcpName);
        // 2. Spawn MCP process
        const child = spawn('node', [mcpPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: process.env,
        });
        try {
            // 3. Send request
            const request = {
                jsonrpc: '2.0',
                id: ++this.requestId,
                method: 'tools/call',
                params: {
                    name: toolName,
                    arguments: params,
                },
            };
            child.stdin.write(JSON.stringify(request) + '\n');
            child.stdin.end();
            // 4. Read response (with timeout)
            const response = await this.readResponse(child, timeout || this.defaultTimeout);
            // 5. Handle errors
            if (response.error) {
                throw new Error(`MCP error: ${response.error.message}`);
            }
            return response.result;
        }
        finally {
            // 6. Cleanup
            if (!child.killed) {
                child.kill();
            }
        }
    }
    /**
     * Resolve MCP binary path from package name
     */
    resolveMCPBinary(mcpName) {
        const packageMap = {
            'smart-reviewer': '@j0kz/smart-reviewer-mcp',
            'security-scanner': '@j0kz/security-scanner-mcp',
            'test-generator': '@j0kz/test-generator-mcp',
            'architecture-analyzer': '@j0kz/architecture-analyzer-mcp',
            'refactor-assistant': '@j0kz/refactor-assistant-mcp',
            'doc-generator': '@j0kz/doc-generator-mcp',
            'api-designer': '@j0kz/api-designer-mcp',
            'db-schema': '@j0kz/db-schema-mcp',
        };
        const packageName = packageMap[mcpName];
        if (!packageName) {
            throw new Error(`Unknown MCP: ${mcpName}`);
        }
        // Try to resolve from node_modules
        try {
            // Resolve package.json path
            let packageJsonPath;
            try {
                // Try CommonJS require.resolve first
                packageJsonPath = require.resolve(`${packageName}/package.json`);
            }
            catch {
                // Fallback: construct path manually for ESM environments
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = dirname(__filename);
                packageJsonPath = resolve(__dirname, '../../../..', 'node_modules', packageName, 'package.json');
            }
            const packageDir = dirname(packageJsonPath);
            const packageJson = require(packageJsonPath);
            // Get binary path from package.json bin field
            const binName = Object.keys(packageJson.bin)[0];
            const binPath = packageJson.bin[binName];
            return resolve(packageDir, binPath);
        }
        catch (error) {
            throw new Error(`MCP not installed: ${packageName}. Run: npm install ${packageName}`);
        }
    }
    /**
     * Read MCP response from stdout (with timeout)
     */
    async readResponse(child, timeout) {
        return new Promise((resolve, reject) => {
            let output = '';
            let errorOutput = '';
            // Timeout
            const timer = setTimeout(() => {
                child.kill();
                reject(new Error(`MCP invocation timeout (${timeout}ms)`));
            }, timeout);
            // Read stdout
            child.stdout?.on('data', (chunk) => {
                output += chunk.toString();
            });
            // Read stderr (for debugging, not errors)
            child.stderr?.on('data', (chunk) => {
                errorOutput += chunk.toString();
            });
            // Process exit
            child.on('close', (code) => {
                clearTimeout(timer);
                if (code !== 0 && code !== null) {
                    reject(new Error(`MCP exited with code ${code}: ${errorOutput}`));
                    return;
                }
                // Parse response (may have multiple JSON objects, take last one)
                const lines = output.trim().split('\n');
                const lastLine = lines[lines.length - 1];
                try {
                    const response = JSON.parse(lastLine);
                    resolve(response);
                }
                catch (error) {
                    reject(new Error(`Invalid MCP response: ${lastLine}`));
                }
            });
            child.on('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }
    /**
     * Check if an MCP is installed and available
     */
    isInstalled(mcpName) {
        try {
            this.resolveMCPBinary(mcpName);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get list of available (installed) MCPs
     */
    getAvailableMCPs() {
        const allMCPs = [
            'smart-reviewer',
            'security-scanner',
            'test-generator',
            'architecture-analyzer',
            'refactor-assistant',
            'doc-generator',
            'api-designer',
            'db-schema',
        ];
        return allMCPs.filter((mcp) => this.isInstalled(mcp));
    }
}
//# sourceMappingURL=index.js.map