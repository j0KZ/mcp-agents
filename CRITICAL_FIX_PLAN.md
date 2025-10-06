# 🚨 CRITICAL FIX PLAN - 3 Phases to Perfect

## 🎯 Goal: Fix all issues WITHOUT breaking working code

### Current State:

- ✅ 994/1022 tests passing (97.3%)
- ❌ Build FAILING (TypeScript error)
- ❌ 28 tests failing
- ⚠️ 1000+ formatting issues
- ⚠️ Coverage ~59-65%

### Principles:

1. **NEVER modify working tests**
2. **NEVER change passing functionality**
3. **Fix incrementally with validation**
4. **Test after EVERY change**

---

## 🔴 PHASE 1: CRITICAL BUILD FIXES (30 mins)

**Goal:** Get build passing, maintain all working tests

### Step 1.1: Fix TypeScript Build Error

```typescript
// packages/config-wizard/src/wizard.ts:58
// PROBLEM: Type 'ProjectInfo' not assignable to null type
// FIX: Make types compatible
const detected: {
  editor: string | null;
  project: ProjectInfo | { language: null; framework: null; hasTests: false };
  testFramework: string | null;
} = {
  editor: null,
  project: { language: null, framework: null, hasTests: false },
  testFramework: null,
};

// Then safely assign
try {
  detected.project = await detectProject();
} catch (e) {
  // Keep default null-like object
}
```

### Step 1.2: Validate No Regression

```bash
# After fix, immediately verify:
npm run build
npm test -- --run --reporter=verbose | grep "PASS"
# Ensure still 994+ passing
```

### Step 1.3: Fix Memory Profiler Import

```typescript
// Add to packages/shared/src/index.ts
export * from './performance/memory-profiler.js';
```

---

## 🟠 PHASE 2: TEST FAILURES (2 hours)

**Goal:** Fix 28 failing tests WITHOUT touching working ones

### Step 2.1: Config-Wizard Tests (18 failures)

**Strategy:** Replace dynamic imports with dependency injection

```typescript
// packages/config-wizard/src/wizard.ts
// ADD: Dependency injection interface
export interface WizardDeps {
  spinner?: (text: string) => any;
  writeConfigFile?: (
    config: any,
    editor: string,
    path?: string,
    force?: boolean
  ) => Promise<string>;
  detectEditor?: () => Promise<string | null>;
  detectProject?: () => Promise<ProjectInfo>;
  detectTestFramework?: () => Promise<string | null>;
}

// MODIFY: runWizard to accept deps
export async function runWizard(args: WizardArgs, deps: WizardDeps = {}): Promise<void> {
  // Use injected deps with defaults
  const {
    spinner = (await import('./utils/spinner.js')).spinner,
    writeConfigFile = (await import('./utils/file-system.js')).writeConfigFile,
    detectEditor = (await import('./detectors/editor.js')).detectEditor,
    // ... etc
  } = deps;

  // Rest of code uses injected functions
  const spin = spinner('Analyzing environment...');
}
```

```typescript
// packages/config-wizard/src/wizard.test.ts
// SIMPLIFY: Direct injection in tests
describe('Configuration Wizard', () => {
  const mockDeps: WizardDeps = {
    spinner: () => ({
      succeed: vi.fn(),
      fail: vi.fn(),
      stop: vi.fn(),
      start: vi.fn(),
    }),
    writeConfigFile: vi.fn().mockResolvedValue('/path/to/config.json'),
    detectEditor: vi.fn().mockResolvedValue('vscode'),
    detectProject: vi.fn().mockResolvedValue({
      language: 'typescript',
      framework: 'react',
      hasTests: true,
    }),
    detectTestFramework: vi.fn().mockResolvedValue('jest'),
  };

  it('should complete full wizard flow with detections', async () => {
    await runWizard({}, mockDeps);
    expect(mockDeps.detectEditor).toHaveBeenCalled();
    // ... rest of test
  });
});
```

### Step 2.2: MCP Pipeline Tests (9 failures)

**Strategy:** Implement missing functionality

```typescript
// packages/shared/src/mcp-pipeline/pipeline.ts
export class MCPPipeline {
  private steps: PipelineStep[] = [];
  private subPipelines: Map<string, MCPPipeline> = new Map();
  private executionOrder: string[] = [];
  private retryAttempts = new Map<string, number>();

  // ADD: Missing method
  addSubPipeline(name: string, pipeline: MCPPipeline): this {
    this.subPipelines.set(name, pipeline);
    return this;
  }

  // FIX: Execute with proper result tracking
  async execute(): Promise<PipelineResult> {
    const results: StepResult[] = [];
    const startTime = Date.now();

    try {
      // Execute steps with dependency order
      const sortedSteps = this.topologicalSort(this.steps);

      for (const step of sortedSteps) {
        this.executionOrder.push(step.name);

        // Handle retries
        let attempts = 0;
        let lastError: any;

        while (attempts <= (step.retryCount || 0)) {
          try {
            const result = await this.executeStep(step);
            results.push(result);
            break;
          } catch (error) {
            lastError = error;
            attempts++;
            this.retryAttempts.set(step.name, attempts);

            if (attempts > (step.retryCount || 0)) {
              if (step.continueOnError) {
                results.push({
                  step: step.name,
                  success: false,
                  error: lastError,
                });
                break;
              } else {
                return {
                  success: false,
                  results,
                  error: lastError.message,
                  metadata: {
                    duration: Date.now() - startTime,
                    executionOrder: this.executionOrder,
                    failedStep: step.name,
                    retryAttempts: Object.fromEntries(this.retryAttempts),
                  },
                };
              }
            }
          }
        }
      }

      return {
        success: true,
        results,
        metadata: {
          duration: Date.now() - startTime,
          executionOrder: this.executionOrder,
          retryAttempts: Object.fromEntries(this.retryAttempts),
        },
      };
    } catch (error) {
      return {
        success: false,
        results,
        error: error.message,
        metadata: {
          duration: Date.now() - startTime,
          executionOrder: this.executionOrder,
          failedStep: this.executionOrder[this.executionOrder.length - 1],
        },
      };
    }
  }

  // ADD: Conditional execution
  addConditionalStep(step: PipelineStep & { condition: () => boolean }): this {
    if (step.condition()) {
      this.addStep(step);
    }
    return this;
  }

  // ADD: Topological sort for dependencies
  private topologicalSort(steps: PipelineStep[]): PipelineStep[] {
    // Implementation of topological sort
    const sorted: PipelineStep[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (stepName: string) => {
      if (visited.has(stepName)) return;
      if (visiting.has(stepName)) {
        throw new Error(`Circular dependency detected: ${stepName}`);
      }

      visiting.add(stepName);
      const step = steps.find(s => s.name === stepName);

      if (step?.dependsOn) {
        for (const dep of step.dependsOn) {
          visit(dep);
        }
      }

      visiting.delete(stepName);
      visited.add(stepName);

      if (step) {
        sorted.push(step);
      }
    };

    for (const step of steps) {
      visit(step.name);
    }

    return sorted;
  }
}
```

### Step 2.3: Validate Each Fix

```bash
# After each package fix:
cd packages/[package-name]
npm test
cd ../..
npm test -- --run | grep -E "PASS|FAIL"
# Ensure number of passing tests NEVER decreases
```

---

## 🟢 PHASE 3: QUALITY & COVERAGE (1 hour)

**Goal:** Clean code, 75% coverage WITHOUT breaking anything

### Step 3.1: Auto-fix Formatting (5 mins)

```bash
# Fix line endings globally
git config core.autocrlf false
dos2unix **/*.ts **/*.js **/*.json

# Run prettier
npm run prettier:write

# Verify nothing broke
npm test -- --run | grep "passed"
```

### Step 3.2: Fix ESLint Issues (15 mins)

```typescript
// Replace 'any' with proper types
// FROM:
const steps = (pipeline as any).steps || [];

// TO:
interface PipelineInternal {
  steps?: PipelineStep[];
}
const steps = (pipeline as unknown as PipelineInternal).steps || [];

// Remove non-null assertions safely
// FROM:
this.metrics.get(name)!.push(value);

// TO:
const metricArray = this.metrics.get(name);
if (metricArray) {
  metricArray.push(value);
}
```

### Step 3.3: Strategic Coverage Boost (40 mins)

**Target low-hanging fruit in low-coverage packages**

```typescript
// Add tests for uncovered error paths
describe('Error Handling', () => {
  it('should handle null inputs', () => {
    expect(() => analyzeFile(null)).toThrow();
  });

  it('should handle empty files', () => {
    const result = analyzeFile('');
    expect(result.issues).toEqual([]);
  });

  it('should handle malformed code', () => {
    const result = analyzeFile('function {');
    expect(result.success).toBe(false);
  });
});

// Add edge case tests
describe('Edge Cases', () => {
  it('should handle maximum file size', () => {
    const largeFile = 'x'.repeat(100 * 1024 * 1024); // 100MB
    expect(() => analyzeFile(largeFile)).toThrow('File too large');
  });

  it('should handle special characters', () => {
    const result = analyzeFile('const emoji = "🚀"');
    expect(result.success).toBe(true);
  });
});
```

---

## 🔄 Validation Protocol

### After EVERY change:

```bash
# 1. Check build
npm run build

# 2. Check test count
npm test -- --run | grep "Tests"
# MUST show: 994+ passing (never less)

# 3. Check specific package
cd packages/[changed-package]
npm test

# 4. Check coverage didn't drop
npm run test:coverage | grep "%"
```

### Rollback Protocol:

```bash
# If tests drop below 994 passing:
git stash  # Save work
git checkout HEAD~1  # Go back
git stash pop  # Reapply more carefully
```

---

## 📋 Success Criteria

### Phase 1 Complete When:

- [x] Build passes (`npm run build` succeeds)
- [x] Still have 994+ tests passing
- [x] Memory profiler exports correctly

### Phase 2 Complete When:

- [x] 1022/1022 tests passing (100%)
- [x] Config-wizard tests working
- [x] Pipeline tests working
- [x] No new failures introduced

### Phase 3 Complete When:

- [x] 0 ESLint errors/warnings
- [x] 0 Prettier issues
- [x] Coverage ≥75%
- [x] All builds passing

---

## 🚀 Execution Timeline

**Total Time:** 3.5 hours

1. **0:00-0:30** - Phase 1: Build fixes
2. **0:30-2:30** - Phase 2: Test fixes (bulk of work)
3. **2:30-3:30** - Phase 3: Quality & coverage

**Checkpoints:**

- Every 30 mins: Commit working state
- Every fix: Run validation protocol
- Any regression: Immediate rollback

---

## 🎯 Final State

- ✅ Build: PASSING
- ✅ Tests: 1022/1022 (100%)
- ✅ Coverage: ≥75%
- ✅ Lint: 0 issues
- ✅ Format: Clean
- ✅ Types: Fully typed
- ✅ Security: 0 vulnerabilities
