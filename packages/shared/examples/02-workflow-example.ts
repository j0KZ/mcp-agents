/**
 * Example 2: Using MCPWorkflow to orchestrate security-scanner → test-generator
 *
 * This example demonstrates a conditional workflow that scans for security issues
 * and generates tests for vulnerable code patterns.
 */

import { MCPWorkflow, MCPIntegration } from '../src/integration/index.js';
import { FileSystemManager } from '../src/fs/index.js';
import { AnalysisCache } from '../src/cache/index.js';

// Mock MCP tools for demonstration
class SecurityScanner {
  async scanProject(data: any, config: any) {
    return {
      vulnerabilities: [
        { severity: 'critical', type: 'sql-injection', file: 'api/users.ts', line: 42 },
        { severity: 'high', type: 'xss', file: 'api/posts.ts', line: 89 },
      ],
      score: 72,
    };
  }
}

class TestGenerator {
  async generateSecurityTests(data: any, config: any) {
    const vulns = data['security-scan'].data.vulnerabilities;
    const tests = vulns.map((v: any) => ({
      file: v.file.replace('.ts', '.test.ts'),
      testCase: `should prevent ${v.type} at line ${v.line}`,
    }));

    return { testsGenerated: tests.length, tests };
  }
}

class DocumentationGenerator {
  async generateSecurityDocs(data: any, config: any) {
    return {
      docFile: 'SECURITY_FINDINGS.md',
      sections: ['Vulnerabilities', 'Mitigations', 'Test Coverage'],
    };
  }
}

async function securityWorkflow(projectPath: string) {
  // Setup
  const integration = new MCPIntegration();
  const fsManager = new FileSystemManager();
  const cache = new AnalysisCache();

  // Register tools
  integration.registerTool('security-scanner', new SecurityScanner());
  integration.registerTool('test-generator', new TestGenerator());
  integration.registerTool('doc-generator', new DocumentationGenerator());

  // Create workflow
  const workflow = new MCPWorkflow('security-audit-workflow');

  // Step 1: Scan for security vulnerabilities
  workflow.step('security-scan', 'security-scanner', 'scanProject', {
    minSeverity: 'high',
    scanSecrets: true,
  });

  // Step 2: Generate tests only if vulnerabilities found
  workflow.step(
    'generate-security-tests',
    'test-generator',
    'generateSecurityTests',
    { framework: 'jest', includeErrorCases: true },
    results => {
      // Condition: only run if vulnerabilities found
      return results['security-scan']?.data?.vulnerabilities?.length > 0;
    }
  );

  // Step 3: Generate documentation always
  workflow.step('document-findings', 'doc-generator', 'generateSecurityDocs', {
    format: 'markdown',
  });

  // Execute workflow
  console.log('🔐 Starting security audit workflow...\n');

  const result = await workflow.run(integration, { projectPath });

  console.log('\n📊 Workflow Results:');
  console.log(JSON.stringify(result, null, 2));

  // Cache the results
  const projectHash = await fsManager.getFileInfo(projectPath).then(info => info.hash);
  cache.set(projectPath, 'security-workflow', projectHash, result);

  return result;
}

// Run example
if (import.meta.url === `file://${process.argv[1]}`) {
  securityWorkflow('./src')
    .then(() => console.log('\n✅ Workflow completed'))
    .catch(err => console.error('❌ Workflow failed:', err));
}
