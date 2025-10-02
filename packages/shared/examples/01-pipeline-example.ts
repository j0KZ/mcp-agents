/**
 * Example 1: Using MCPPipeline to chain multiple tools
 *
 * This example shows how to orchestrate architecture-analyzer → smart-reviewer → refactor-assistant
 * in a pipeline to analyze code quality and suggest improvements.
 */

import { MCPPipeline, MCPIntegration } from '../src/integration/index.js';
import { FileSystemManager } from '../src/fs/index.js';
import { PerformanceMonitor } from '../src/performance/index.js';

async function analyzeAndImproveCode(projectPath: string) {
  const pipeline = new MCPPipeline();
  const fsManager = new FileSystemManager();
  const performance = new PerformanceMonitor();

  performance.start();

  // Step 1: Analyze architecture
  pipeline.addStep({
    name: 'analyze-architecture',
    tool: 'architecture-analyzer',
    input: { projectPath },
    async execute(input) {
      console.log('📊 Analyzing project architecture...');
      // Find all TypeScript files
      const files = await fsManager.findFiles('**/*.ts', {
        cwd: input.projectPath,
        ignore: ['node_modules/**', 'dist/**'],
      });

      return {
        success: true,
        data: {
          totalFiles: files.length,
          complexity: 45.2,
          modularity: 78,
          dependencies: ['@types/node', 'typescript'],
        },
      };
    },
  });

  // Step 2: Review code quality (depends on architecture analysis)
  pipeline.addStep({
    name: 'review-code',
    tool: 'smart-reviewer',
    dependsOn: ['analyze-architecture'],
    async execute(input) {
      console.log('🔍 Reviewing code quality...');
      const archResults = input[0];

      return {
        success: true,
        data: {
          issues: [
            { severity: 'high', message: 'High complexity detected', line: 42 },
            { severity: 'medium', message: 'Unused import', line: 15 },
          ],
          maintainability: 65,
          score: archResults.data.modularity,
        },
      };
    },
  });

  // Step 3: Suggest refactorings (depends on code review)
  pipeline.addStep({
    name: 'suggest-refactorings',
    tool: 'refactor-assistant',
    dependsOn: ['review-code'],
    async execute(input) {
      console.log('🔧 Suggesting refactorings...');
      const reviewResults = input[0];

      const suggestions = reviewResults.data.issues.map((issue: any) => ({
        type: 'extract-function',
        location: issue.line,
        reason: issue.message,
      }));

      return {
        success: true,
        data: {
          suggestions,
          estimatedImprovement: '+15 maintainability score',
        },
      };
    },
  });

  // Execute pipeline
  const result = await pipeline.execute();
  const metrics = performance.stop();

  console.log('\n✨ Pipeline Results:');
  console.log(`Total duration: ${metrics.duration}ms`);
  console.log(`Steps completed: ${result.steps.length}`);
  console.log(`Success: ${result.success}`);

  if (result.errors.length > 0) {
    console.log('❌ Errors:', result.errors);
  }

  // Access specific step results
  const refactoringResult = pipeline.getResult('suggest-refactorings');
  if (refactoringResult) {
    console.log('\n🎯 Refactoring suggestions:', refactoringResult.data.suggestions);
  }

  return result;
}

// Run example
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeAndImproveCode('./src')
    .then(() => console.log('\n✅ Pipeline completed successfully'))
    .catch(err => console.error('❌ Pipeline failed:', err));
}
