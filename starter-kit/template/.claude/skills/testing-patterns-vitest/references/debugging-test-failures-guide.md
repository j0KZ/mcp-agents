# Debugging Test Failures Guide - Vitest

Systematic approaches to diagnose and fix failing tests.

## Quick Debugging Commands

### Isolate Failing Test

```bash
# Run single test file
npx vitest run src/analyzer.test.ts

# Run specific test by name pattern
npx vitest run -t "should handle edge case"

# Run tests in specific describe block
npx vitest run -t "SecurityScanner"
```

### Verbose Output

```bash
# Show detailed output
npx vitest run --reporter=verbose

# Show full stack traces
npx vitest run --full-trace

# Print console output
npx vitest run --no-silence
```

## Node Inspector Debugging

### Launch with Inspector

```bash
# Start debugger
node --inspect-brk ./node_modules/.bin/vitest run

# Then open Chrome DevTools
# Navigate to: chrome://inspect
# Click "inspect" under Remote Target
```

### VSCode Debugging

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npx",
  "runtimeArgs": ["vitest", "run", "${file}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Common Test Failures

### Async/Await Issues

**Problem:** Test completes before async operation
```typescript
// ❌ WRONG
it('should fetch data', () => {
  const result = fetchData(); // Missing await
  expect(result).toBe('data');
});
```

**Solution:**
```typescript
// ✅ CORRECT
it('should fetch data', async () => {
  const result = await fetchData();
  expect(result).toBe('data');
});
```

### Mock Not Working

**Problem:** Mock not being used
```typescript
// ❌ Module imported before mock
import { utils } from '../src/utils';
vi.mock('../src/utils');
```

**Solution:**
```typescript
// ✅ Mock before import
vi.mock('../src/utils');
import { utils } from '../src/utils';
```

### Timing Issues

**Problem:** Test depends on timing
```typescript
// ❌ Flaky test
it('should debounce', async () => {
  debounce(fn, 100);
  await new Promise(r => setTimeout(r, 101));
  expect(fn).toHaveBeenCalled();
});
```

**Solution:**
```typescript
// ✅ Use fake timers
it('should debounce', () => {
  vi.useFakeTimers();
  debounce(fn, 100);
  vi.advanceTimersByTime(100);
  expect(fn).toHaveBeenCalled();
  vi.useRealTimers();
});
```

### Cleanup Issues

**Problem:** Tests affecting each other
```typescript
// ❌ No cleanup
describe('Tests', () => {
  const cache = new Map();
  // Tests modify shared cache
});
```

**Solution:**
```typescript
// ✅ Proper cleanup
describe('Tests', () => {
  let cache: Map<string, any>;

  beforeEach(() => {
    cache = new Map();
  });

  afterEach(() => {
    cache.clear();
  });
});
```

## Debugging Strategies

### 1. Console Logging

```typescript
it('should process data', () => {
  const input = { value: 10 };
  console.log('Input:', JSON.stringify(input, null, 2));

  const result = processData(input);
  console.log('Result:', result);

  expect(result).toBe(20);
});
```

### 2. Snapshot Debugging

```typescript
it('should generate correct output', () => {
  const result = complexFunction();

  // Temporarily create snapshot to see actual output
  expect(result).toMatchSnapshot();

  // Then update to specific assertion
  // expect(result).toEqual({ ... });
});
```

### 3. Step-by-Step Verification

```typescript
it('should process pipeline', () => {
  const step1 = processStep1(input);
  expect(step1).toBeDefined();
  console.log('Step 1:', step1);

  const step2 = processStep2(step1);
  expect(step2).toHaveProperty('data');
  console.log('Step 2:', step2);

  const final = processStep3(step2);
  expect(final).toBe(expected);
});
```

## Error Message Analysis

### Understanding Stack Traces

```
AssertionError: expected 'received' to be 'expected'
  ❯ tests/example.test.ts:15:18
    13| it('should match', () => {
    14|   const result = getValue();
    15|   expect(result).toBe('expected');
       |                  ^
```

**Key Information:**
- Line 15: Where assertion failed
- Shows actual code context
- File path for navigation

### Mock Call Analysis

```typescript
// See what mock was called with
console.log('Mock calls:', mock.mock.calls);
console.log('Last call:', mock.mock.lastCall);
console.log('Call count:', mock.mock.calls.length);

// Better assertion messages
expect(mock).toHaveBeenCalledWith(
  expect.objectContaining({
    id: expect.any(Number),
    name: 'test'
  })
);
```

## Performance Issues

### Identify Slow Tests

```bash
# Show test durations
npx vitest run --reporter=verbose

# Set timeout for slow tests
npx vitest run --test-timeout=5000
```

### Optimize Slow Tests

```typescript
describe('Performance', () => {
  // Share expensive setup
  let expensiveResource: Resource;

  beforeAll(async () => {
    expensiveResource = await createExpensiveResource();
  });

  afterAll(async () => {
    await expensiveResource.cleanup();
  });

  // Tests use shared resource
});
```

## Memory Leaks

### Detect Leaks

```bash
# Run with memory inspection
node --expose-gc --inspect ./node_modules/.bin/vitest run
```

### Common Leak Sources

```typescript
// ❌ Event listener not removed
beforeEach(() => {
  emitter.on('event', handler);
});

// ✅ Proper cleanup
beforeEach(() => {
  emitter.on('event', handler);
});

afterEach(() => {
  emitter.off('event', handler);
});
```

## CI/CD Failures

### Environment Differences

```typescript
// Handle CI environment
const isCI = process.env.CI === 'true';

if (isCI) {
  // Adjust timeouts for CI
  vi.setConfig({ testTimeout: 10000 });
}
```

### Debugging CI-Only Failures

```yaml
# GitHub Actions: Enable debug logging
- name: Run tests
  run: npm test
  env:
    DEBUG: '*'
    NODE_OPTIONS: --trace-warnings
```

## Best Practices

1. **Run tests in isolation first** - Identify if it's a test interaction issue
2. **Use --no-coverage temporarily** - Speeds up debugging
3. **Add strategic console.logs** - But remove before committing
4. **Check test order dependence** - Run with --shuffle
5. **Verify mock cleanup** - Ensure afterEach clears mocks
6. **Use debugger statements** - When using inspector
7. **Compare with passing tests** - Find the difference
8. **Check recent changes** - git diff may reveal the issue
9. **Simplify failing test** - Remove code until it passes
10. **Read error messages carefully** - They often contain the solution