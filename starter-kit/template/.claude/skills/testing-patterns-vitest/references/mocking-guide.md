# Mocking Guide for Vitest

Complete guide to mocking modules, functions, timers, and external dependencies in Vitest.

---

## Basic Mocking Concepts

**Why mock?**
- Isolate unit under test
- Avoid external dependencies (network, file system)
- Control test conditions
- Faster test execution

**What to mock:**
- ✅ External APIs/network calls
- ✅ File system operations
- ✅ Database connections
- ✅ Time-dependent functions
- ✅ Random number generation

**What NOT to mock:**
- ❌ Code you're testing
- ❌ Simple utilities (unless slow)
- ❌ Everything (over-mocking makes tests brittle)

---

## Mock Functions

### Creating Mock Functions

```typescript
import { vi } from 'vitest';

it('should call callback', () => {
  const mockCallback = vi.fn();

  processData('test', mockCallback);

  expect(mockCallback).toHaveBeenCalled();
  expect(mockCallback).toHaveBeenCalledTimes(1);
  expect(mockCallback).toHaveBeenCalledWith('processed: test');
});
```

### Mock with Return Value

```typescript
it('should use mocked return value', () => {
  const mockFn = vi.fn().mockReturnValue(42);

  const result = calculate(mockFn);

  expect(mockFn).toHaveBeenCalled();
  expect(result).toBe(42);
});
```

### Mock with Resolved Promise

```typescript
it('should handle async mock', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    status: 200,
    data: { id: '123' }
  });

  const result = await fetchUser(mockFetch);

  expect(mockFetch).toHaveBeenCalled();
  expect(result.id).toBe('123');
});
```

### Mock with Rejected Promise

```typescript
it('should handle async errors', async () => {
  const mockFetch = vi.fn().mockRejectedValue(
    new Error('Network error')
  );

  await expect(fetchUser(mockFetch)).rejects.toThrow('Network error');
  expect(mockFetch).toHaveBeenCalled();
});
```

### Mock with Implementation

```typescript
it('should use custom implementation', () => {
  const mockFn = vi.fn((x) => x * 2);

  expect(mockFn(5)).toBe(10);
  expect(mockFn(10)).toBe(20);
  expect(mockFn).toHaveBeenCalledTimes(2);
});
```

---

## Module Mocking

### Mock Entire Module

```typescript
import { vi } from 'vitest';
import { readFile } from 'fs/promises';

// Mock at top of file
vi.mock('fs/promises');

describe('FileProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read file content', async () => {
    const mockContent = 'file content';
    vi.mocked(readFile).mockResolvedValue(mockContent);

    const result = await processFile('/test.txt');

    expect(readFile).toHaveBeenCalledWith('/test.txt', 'utf-8');
    expect(result).toContain(mockContent);
  });

  it('should handle read errors', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));

    await expect(processFile('/fake.txt')).rejects.toThrow('ENOENT');
  });
});
```

### Partial Module Mock

```typescript
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  // Don't mock other exports
  ...vi.importActual('fs/promises')
}));
```

### Mock ES Module

```typescript
import { vi } from 'vitest';
import { analyzer } from '../src/analyzer.js';  // .js extension!

vi.mock('../src/analyzer.js', () => ({
  analyzer: {
    analyze: vi.fn().mockResolvedValue({
      issues: [],
      metrics: { linesOfCode: 100 }
    })
  }
}));

it('should use mocked analyzer', async () => {
  const result = await analyzer.analyze('/test.ts');
  expect(result.issues).toEqual([]);
});
```

---

## Mocking Patterns

### Mock File System Operations

```typescript
import { vi } from 'vitest';
import { readFile, writeFile } from 'fs/promises';

vi.mock('fs/promises');

describe('FileManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read and process file', async () => {
    vi.mocked(readFile).mockResolvedValue('content');

    const result = await manager.processFile('/test.txt');

    expect(readFile).toHaveBeenCalledWith('/test.txt', 'utf-8');
    expect(result).toBeDefined();
  });

  it('should write processed content', async () => {
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await manager.saveFile('/out.txt', 'processed');

    expect(writeFile).toHaveBeenCalledWith(
      '/out.txt',
      'processed',
      'utf-8'
    );
  });
});
```

### Mock HTTP Requests

```typescript
import { vi } from 'vitest';
import fetch from 'node-fetch';

vi.mock('node-fetch');

it('should fetch data from API', async () => {
  const mockResponse = {
    ok: true,
    json: async () => ({ id: '123', name: 'Test' })
  };

  vi.mocked(fetch).mockResolvedValue(mockResponse as any);

  const data = await fetchUserData('123');

  expect(fetch).toHaveBeenCalledWith('https://api.example.com/users/123');
  expect(data.name).toBe('Test');
});

it('should handle API errors', async () => {
  const mockResponse = {
    ok: false,
    status: 404
  };

  vi.mocked(fetch).mockResolvedValue(mockResponse as any);

  await expect(fetchUserData('999')).rejects.toThrow('User not found');
});
```

### Mock Database Operations

```typescript
import { vi } from 'vitest';
import { database } from '../src/database.js';

vi.mock('../src/database.js', () => ({
  database: {
    query: vi.fn(),
    insert: vi.fn(),
    update: vi.fn()
  }
}));

it('should query database', async () => {
  const mockResults = [
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' }
  ];

  vi.mocked(database.query).mockResolvedValue(mockResults);

  const users = await getUsers();

  expect(database.query).toHaveBeenCalledWith('SELECT * FROM users');
  expect(users).toHaveLength(2);
});
```

---

## Spy on Methods

### Spy on Object Method

```typescript
import { vi } from 'vitest';

it('should call internal method', () => {
  const analyzer = new CodeAnalyzer();
  const spy = vi.spyOn(analyzer, 'parseCode');

  analyzer.analyzeFile('/test.ts');

  expect(spy).toHaveBeenCalled();
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('test'));

  spy.mockRestore();  // Clean up
});
```

### Spy with Mock Implementation

```typescript
it('should override method behavior', () => {
  const analyzer = new CodeAnalyzer();
  const spy = vi.spyOn(analyzer, 'parseCode')
    .mockReturnValue({ ast: mockAST });

  const result = analyzer.analyzeFile('/test.ts');

  expect(spy).toHaveBeenCalled();
  expect(result.ast).toBe(mockAST);

  spy.mockRestore();
});
```

---

## Mock Timers

### Basic Timer Mocking

```typescript
import { vi } from 'vitest';

it('should execute after delay', async () => {
  vi.useFakeTimers();

  const mockCallback = vi.fn();
  setTimeout(mockCallback, 1000);

  // Advance time by 1 second
  vi.advanceTimersByTime(1000);

  expect(mockCallback).toHaveBeenCalled();

  vi.useRealTimers();
});
```

### Fast-Forward Time

```typescript
it('should retry after delays', async () => {
  vi.useFakeTimers();

  const promise = retryOperation();

  // Fast-forward through retry delays
  vi.advanceTimersByTime(1000);  // First retry
  vi.advanceTimersByTime(2000);  // Second retry
  vi.advanceTimersByTime(4000);  // Third retry

  await promise;

  vi.useRealTimers();
});
```

### Run All Timers

```typescript
it('should complete all pending timers', () => {
  vi.useFakeTimers();

  const mock1 = vi.fn();
  const mock2 = vi.fn();

  setTimeout(mock1, 1000);
  setTimeout(mock2, 2000);

  vi.runAllTimers();  // Run all pending timers

  expect(mock1).toHaveBeenCalled();
  expect(mock2).toHaveBeenCalled();

  vi.useRealTimers();
});
```

---

## Mock Dates

```typescript
it('should use fixed date', () => {
  const fixedDate = new Date('2025-01-15T00:00:00Z');
  vi.setSystemTime(fixedDate);

  const result = generateTimestamp();

  expect(result).toBe(fixedDate.toISOString());

  vi.useRealTimers();  // Restore real time
});
```

---

## Mock Randomness

```typescript
it('should generate predictable random values', () => {
  const mockRandom = vi.spyOn(Math, 'random')
    .mockReturnValue(0.5);

  const result = generateRandomId();

  expect(result).toBe('id-500000');  // Deterministic

  mockRandom.mockRestore();
});
```

---

## Cleanup and Reset

### Clear All Mocks (Before Each Test)

```typescript
beforeEach(() => {
  vi.clearAllMocks();  // Clear call history
});
```

### Reset All Mocks

```typescript
beforeEach(() => {
  vi.resetAllMocks();  // Clear history + implementations
});
```

### Restore All Mocks

```typescript
afterEach(() => {
  vi.restoreAllMocks();  // Restore original implementations
});
```

**Differences:**
- `clearAllMocks()` - Clears call history only
- `resetAllMocks()` - Clears history + removes mock implementations
- `restoreAllMocks()` - Restores original implementations (for spies)

---

## Advanced Patterns

### Mock Different Return Values per Call

```typescript
it('should handle multiple calls', () => {
  const mockFn = vi.fn()
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(3);

  expect(mockFn()).toBe(1);
  expect(mockFn()).toBe(2);
  expect(mockFn()).toBe(3);
});
```

### Mock with Call Count

```typescript
it('should verify call count', () => {
  const mockFn = vi.fn();

  process(mockFn);

  expect(mockFn).toHaveBeenCalledTimes(3);
  expect(mockFn).toHaveBeenNthCalledWith(1, 'first');
  expect(mockFn).toHaveBeenNthCalledWith(2, 'second');
  expect(mockFn).toHaveBeenNthCalledWith(3, 'third');
});
```

### Conditional Mocking

```typescript
it('should mock conditionally', () => {
  const mockFn = vi.fn((x) => {
    if (x > 10) return 'high';
    return 'low';
  });

  expect(mockFn(5)).toBe('low');
  expect(mockFn(15)).toBe('high');
});
```

---

## Common Pitfalls

### ❌ Forgetting to Clear Mocks

```typescript
// BAD: Mocks carry state between tests
describe('Tests', () => {
  const mockFn = vi.fn();

  it('test 1', () => {
    mockFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('test 2', () => {
    // FAILS: mockFn was called in test 1
    expect(mockFn).toHaveBeenCalledTimes(0);
  });
});

// GOOD: Clear before each test
describe('Tests', () => {
  const mockFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('test 1', () => {
    mockFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('test 2', () => {
    expect(mockFn).toHaveBeenCalledTimes(0);  // PASSES
  });
});
```

### ❌ Over-Mocking

```typescript
// BAD: Mocking everything makes test useless
vi.mock('../src/utils.js');
vi.mock('../src/analyzer.js');
vi.mock('../src/formatter.js');
// Testing nothing real!

// GOOD: Only mock external dependencies
vi.mock('fs/promises');  // External
// Test actual utils, analyzer, formatter
```

### ❌ Not Restoring Timers

```typescript
// BAD: Fake timers leak to other tests
it('test with timers', () => {
  vi.useFakeTimers();
  // ... test ...
  // Forgot to restore!
});

// GOOD: Always restore
it('test with timers', () => {
  vi.useFakeTimers();
  // ... test ...
  vi.useRealTimers();  // Clean up
});
```

---

## Best Practices

### ✅ DO

1. **Clear mocks before each test**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

2. **Mock at module level for consistency**
   ```typescript
   vi.mock('fs/promises');  // Top of file

   describe('Tests', () => {
     // All tests use same mock
   });
   ```

3. **Use descriptive mock values**
   ```typescript
   const mockUser = {
     id: 'test-user-123',
     name: 'Test User',
     email: 'test@example.com'
   };
   ```

4. **Verify mock interactions**
   ```typescript
   expect(mockFn).toHaveBeenCalledWith(expectedArgs);
   expect(mockFn).toHaveBeenCalledTimes(1);
   ```

### ❌ DON'T

1. **Don't mock what you're testing**
   ```typescript
   // BAD
   vi.mock('../src/analyzer.js');  // Testing analyzer!
   ```

2. **Don't create global mocks**
   ```typescript
   // BAD: Leaks between test files
   globalThis.fetch = vi.fn();
   ```

3. **Don't forget async mocks need await**
   ```typescript
   // BAD
   it('test', () => {
     mockFn.mockResolvedValue(data);
     const result = asyncFn();  // Missing await!
   });

   // GOOD
   it('test', async () => {
     mockFn.mockResolvedValue(data);
     const result = await asyncFn();
   });
   ```

---

## Quick Reference

### Mock Functions
```typescript
vi.fn()                           // Create mock
vi.fn().mockReturnValue(x)        // Return value
vi.fn().mockResolvedValue(x)      // Async success
vi.fn().mockRejectedValue(e)      // Async error
vi.fn((x) => x * 2)               // Implementation
```

### Module Mocking
```typescript
vi.mock('module-name')            // Mock entire module
vi.mocked(importedFn)             // Access mocked function
vi.importActual('module')         // Get real module
```

### Spies
```typescript
vi.spyOn(obj, 'method')           // Spy on method
spy.mockReturnValue(x)            // Override return
spy.mockRestore()                 // Restore original
```

### Timers
```typescript
vi.useFakeTimers()                // Enable fake timers
vi.advanceTimersByTime(ms)        // Fast-forward
vi.runAllTimers()                 // Run all pending
vi.useRealTimers()                // Restore real time
```

### Cleanup
```typescript
vi.clearAllMocks()                // Clear call history
vi.resetAllMocks()                // Clear + reset
vi.restoreAllMocks()              // Restore originals
```

---

## Related

- See `assertion-patterns-guide.md` for assertion patterns
- See `coverage-guide.md` for coverage strategies
- See main SKILL.md for complete testing patterns

---

**Reference:** Vitest mocking documentation
**Framework:** Vitest
**Project:** @j0kz/mcp-agents
