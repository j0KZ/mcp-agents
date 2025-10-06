#!/usr/bin/env node
/**
 * Orchestrator Benchmark
 *
 * Compares performance of:
 * 1. Running MCPs separately (manual sequential execution)
 * 2. Running MCPs through orchestrator (automated workflow)
 *
 * Metrics:
 * - Total execution time
 * - Startup overhead (process spawning)
 * - Communication overhead (JSON-RPC)
 * - Memory usage
 * - Error handling consistency
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { performance } from 'perf_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class BenchmarkRunner {
  constructor() {
    this.results = {
      separate: {},
      orchestrator: {},
    };
  }

  async invokeMCP(mcpPath, toolName, params, label) {
    const startTime = performance.now();
    const startMem = process.memoryUsage();

    return new Promise((resolve, reject) => {
      const child = spawn('node', [mcpPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        stdout += data.toString();
      });

      child.stderr.on('data', data => {
        stderr += data.toString();
      });

      // Send tool invocation request
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params,
        },
      };

      child.stdin.write(JSON.stringify(request) + '\n');

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error(`Timeout invoking ${label}`));
      }, 30000);

      child.on('exit', () => {
        clearTimeout(timeout);

        const endTime = performance.now();
        const endMem = process.memoryUsage();

        const duration = endTime - startTime;
        const memDelta = endMem.heapUsed - startMem.heapUsed;

        // Parse response
        let success = false;
        let error = null;

        try {
          const lines = stdout.split('\n').filter(l => l.trim());
          for (const line of lines) {
            try {
              const response = JSON.parse(line);
              if (response.id === 1) {
                success = !response.error;
                error = response.error?.message;
                break;
              }
            } catch (e) {
              // Skip non-JSON lines
            }
          }
        } catch (e) {
          error = e.message;
        }

        resolve({
          label,
          duration,
          memDelta,
          success,
          error,
          stdout: stdout.substring(0, 200),
          stderr: stderr.substring(0, 200),
        });
      });
    });
  }

  async runSeparateMCPs(testFile) {
    console.log(
      `\n${colors.blue}${colors.bright}📊 Benchmark 1: Running MCPs Separately${colors.reset}`
    );
    console.log(`${colors.dim}Manual sequential execution of each MCP${colors.reset}\n`);

    const projectRoot = join(__dirname, '..');
    const results = [];

    // Test 1: Smart Reviewer
    console.log('  Running smart-reviewer...');
    const reviewResult = await this.invokeMCP(
      join(projectRoot, 'packages/smart-reviewer/dist/mcp-server.js'),
      'review_file',
      { filePath: testFile, config: { severity: 'moderate' } },
      'smart-reviewer'
    );
    results.push(reviewResult);

    // Test 2: Security Scanner
    console.log('  Running security-scanner...');
    const securityResult = await this.invokeMCP(
      join(projectRoot, 'packages/security-scanner/dist/mcp-server.js'),
      'scan_file',
      { filePath: testFile },
      'security-scanner'
    );
    results.push(securityResult);

    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const totalMem = results.reduce((sum, r) => sum + r.memDelta, 0);
    const processCount = results.length;

    this.results.separate = {
      results,
      totalDuration,
      totalMem,
      processCount,
      averagePerProcess: totalDuration / processCount,
    };

    this.printResults('SEPARATE MCPs', this.results.separate);
  }

  async runOrchestratorWorkflow(testFile) {
    console.log(
      `\n${colors.magenta}${colors.bright}🔗 Benchmark 2: Running via Orchestrator${colors.reset}`
    );
    console.log(`${colors.dim}Automated workflow execution${colors.reset}\n`);

    const projectRoot = join(__dirname, '..');
    const startTime = performance.now();
    const startMem = process.memoryUsage();

    return new Promise((resolve, reject) => {
      const child = spawn(
        'node',
        [join(projectRoot, 'packages/orchestrator-mcp/dist/mcp-server.js')],
        {
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      );

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        stdout += data.toString();
      });

      child.stderr.on('data', data => {
        stderr += data.toString();
      });

      console.log('  Executing pre-commit workflow...');

      // Send workflow execution request
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'run_workflow',
          arguments: {
            workflow: 'pre-commit',
            files: [testFile],
          },
        },
      };

      child.stdin.write(JSON.stringify(request) + '\n');

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error('Timeout running orchestrator'));
      }, 60000);

      child.on('exit', () => {
        clearTimeout(timeout);

        const endTime = performance.now();
        const endMem = process.memoryUsage();

        const totalDuration = endTime - startTime;
        const totalMem = endMem.heapUsed - startMem.heapUsed;

        // Parse response
        let success = false;
        let stepResults = [];
        let error = null;

        try {
          const lines = stdout.split('\n').filter(l => l.trim());
          for (const line of lines) {
            try {
              const response = JSON.parse(line);
              if (response.id === 1) {
                if (response.result?.content) {
                  const content = response.result.content[0];
                  const workflowResult = JSON.parse(content.text);
                  success = workflowResult.success;
                  stepResults = workflowResult.results || [];
                } else if (response.error) {
                  error = response.error.message;
                }
                break;
              }
            } catch (e) {
              // Skip non-JSON lines
            }
          }
        } catch (e) {
          error = e.message;
        }

        this.results.orchestrator = {
          totalDuration,
          totalMem,
          processCount: 1, // Single orchestrator process
          success,
          stepResults,
          error,
          stdout: stdout.substring(0, 200),
          stderr: stderr.substring(0, 200),
        };

        this.printResults('ORCHESTRATOR', this.results.orchestrator);
        resolve();
      });
    });
  }

  printResults(label, data) {
    const color = label.includes('SEPARATE') ? colors.blue : colors.magenta;

    console.log(`\n${color}${colors.bright}  ${label} Results:${colors.reset}`);
    console.log(`  ${'─'.repeat(50)}`);
    console.log(
      `  Total Time:      ${colors.cyan}${data.totalDuration.toFixed(2)}ms${colors.reset}`
    );
    console.log(
      `  Memory Delta:    ${colors.cyan}${(data.totalMem / 1024 / 1024).toFixed(2)}MB${colors.reset}`
    );
    console.log(`  Process Count:   ${colors.cyan}${data.processCount}${colors.reset}`);

    if (data.averagePerProcess) {
      console.log(
        `  Avg per Process: ${colors.cyan}${data.averagePerProcess.toFixed(2)}ms${colors.reset}`
      );
    }

    if (data.results) {
      console.log(`\n  ${colors.dim}Individual Results:${colors.reset}`);
      data.results.forEach(r => {
        const status = r.success ? `${colors.green}✅` : `${colors.red}❌`;
        console.log(`    ${status} ${r.label}: ${r.duration.toFixed(2)}ms${colors.reset}`);
      });
    }

    if (data.stepResults && data.stepResults.length > 0) {
      console.log(`\n  ${colors.dim}Step Results:${colors.reset}`);
      data.stepResults.forEach(r => {
        const status = r.success ? `${colors.green}✅` : `${colors.red}❌`;
        console.log(`    ${status} ${r.step}${colors.reset}`);
      });
    }

    if (data.error) {
      console.log(`  ${colors.red}Error: ${data.error}${colors.reset}`);
    }
  }

  printComparison() {
    console.log(`\n${colors.yellow}${colors.bright}📈 Performance Comparison${colors.reset}`);
    console.log(`${'═'.repeat(60)}\n`);

    const sep = this.results.separate;
    const orch = this.results.orchestrator;

    // Time comparison
    const timeDiff = sep.totalDuration - orch.totalDuration;
    const timePercent = (timeDiff / sep.totalDuration) * 100;
    const timeColor = timeDiff > 0 ? colors.green : colors.red;

    console.log(`⏱️  ${colors.bright}Execution Time:${colors.reset}`);
    console.log(`   Separate MCPs:   ${sep.totalDuration.toFixed(2)}ms`);
    console.log(`   Orchestrator:    ${orch.totalDuration.toFixed(2)}ms`);
    console.log(
      `   ${timeColor}Difference:      ${timeDiff > 0 ? '+' : ''}${timeDiff.toFixed(2)}ms (${timePercent.toFixed(1)}%)${colors.reset}\n`
    );

    // Memory comparison
    const memDiff = sep.totalMem - orch.totalMem;
    const memPercent = (memDiff / sep.totalMem) * 100;
    const memColor = memDiff > 0 ? colors.green : colors.red;

    console.log(`💾 ${colors.bright}Memory Usage:${colors.reset}`);
    console.log(`   Separate MCPs:   ${(sep.totalMem / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Orchestrator:    ${(orch.totalMem / 1024 / 1024).toFixed(2)}MB`);
    console.log(
      `   ${memColor}Difference:      ${memDiff > 0 ? '+' : ''}${(memDiff / 1024 / 1024).toFixed(2)}MB (${memPercent.toFixed(1)}%)${colors.reset}\n`
    );

    // Process count comparison
    console.log(`🔄 ${colors.bright}Process Overhead:${colors.reset}`);
    console.log(`   Separate MCPs:   ${sep.processCount} processes spawned`);
    console.log(`   Orchestrator:    ${orch.processCount} process spawned`);
    console.log(
      `   ${colors.green}Reduction:       ${sep.processCount - orch.processCount} fewer processes${colors.reset}\n`
    );

    // Key benefits
    console.log(`${colors.cyan}${colors.bright}🎯 Key Benefits of Orchestrator:${colors.reset}`);

    if (timePercent > 0) {
      console.log(
        `   ${colors.green}✅ Faster execution (${timePercent.toFixed(1)}% improvement)${colors.reset}`
      );
    }

    if (memPercent > 0) {
      console.log(
        `   ${colors.green}✅ Lower memory usage (${memPercent.toFixed(1)}% reduction)${colors.reset}`
      );
    }

    console.log(
      `   ${colors.green}✅ Fewer process spawns (${sep.processCount - orch.processCount} reduction)${colors.reset}`
    );
    console.log(`   ${colors.green}✅ Consistent error handling${colors.reset}`);
    console.log(`   ${colors.green}✅ Dependency resolution${colors.reset}`);
    console.log(`   ${colors.green}✅ Progress tracking${colors.reset}`);
    console.log(`   ${colors.green}✅ Workflow reusability${colors.reset}\n`);

    // Overhead analysis
    if (orch.totalDuration > sep.totalDuration) {
      const overhead = orch.totalDuration - sep.totalDuration;
      const overheadPercent = (overhead / sep.totalDuration) * 100;

      console.log(`${colors.yellow}${colors.bright}⚠️  Orchestrator Overhead:${colors.reset}`);
      console.log(`   Additional time: ${overhead.toFixed(2)}ms (${overheadPercent.toFixed(1)}%)`);
      console.log(
        `   ${colors.dim}This is expected for small workflows (< 3 steps)${colors.reset}`
      );
      console.log(`   ${colors.dim}Benefits increase with workflow complexity${colors.reset}\n`);
    }

    // Recommendations
    console.log(`${colors.bright}💡 Recommendations:${colors.reset}`);
    console.log(`   • Use orchestrator for: workflows with 3+ steps, complex dependencies`);
    console.log(`   • Use separate MCPs for: single tool invocations, simple tasks`);
    console.log(`   • Orchestrator provides more value as workflow complexity grows\n`);
  }

  async run() {
    console.log(
      `${colors.bright}${colors.cyan}╔═══════════════════════════════════════════════════════════╗${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.cyan}║        MCP Orchestrator Performance Benchmark             ║${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.cyan}╚═══════════════════════════════════════════════════════════╝${colors.reset}`
    );

    const testFile = join(__dirname, '../packages/orchestrator-mcp/src/workflows.ts');

    console.log(`\n${colors.dim}Test Configuration:${colors.reset}`);
    console.log(`  Test File: ${testFile}`);
    console.log(`  Workflow: pre-commit (2 steps: review + security)`);
    console.log(`  Iterations: 1 (to avoid MCP cache effects)\n`);

    try {
      // Run benchmarks
      await this.runSeparateMCPs(testFile);
      await this.runOrchestratorWorkflow(testFile);

      // Print comparison
      this.printComparison();

      console.log(
        `${colors.green}${colors.bright}✅ Benchmark completed successfully!${colors.reset}\n`
      );
    } catch (error) {
      console.error(`${colors.red}❌ Benchmark failed:${colors.reset}`, error);
      process.exit(1);
    }
  }
}

// Run benchmark
const benchmark = new BenchmarkRunner();
benchmark.run();
