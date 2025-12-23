# Mocking Strategies Guide - Vitest

Comprehensive patterns for mocking, stubbing, and spying in Vitest tests.

## Module Mocking

### Basic Module Mock

```typescript
// Mock an entire module
vi.mock('../src/utils.js', () => ({
  calculateTotal: vi.fn().mockReturnValue(100),
  validateInput: vi.fn().mockReturnValue(true),
  formatDate: vi.fn().mockReturnValue('2025-01-01')
}));
```

### Partial Module Mock

```typescript
// Keep some real implementations
vi.mock('../src/utils.js', async () => {
  const actual = await vi.importActual('../src/utils.js');
  return {
    ...actual,
    calculateTotal: vi.fn().mockReturnValue(100) // Only mock this
  };
});
```

## File System Mocking

### Mock fs/promises

```typescript
import { vi } from 'vitest';
import * as fs from 'fs/promises';

vi.mock('fs/promises');

describe('File Operations', () => {
  beforeEach(() => {
    vi.mocked(fs.readFile).mockResolvedValue('file content');
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.access).mockResolvedValue(undefined);
  });

  it('should read configuration', async () => {
    const content = await readConfig('config.json');

    expect(fs.readFile).toHaveBeenCalledWith('config.json', 'utf-8');
    expect(content).toBe('file content');
  });
});
```

## Class Mocking

### Mock Class Constructor

```typescript
class Database {
  connect() { return Promise.resolve(); }
  query(sql: string) { return Promise.resolve([]); }
}

vi.mock('../src/database.js', () => ({
  Database: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }])
  }))
}));
```

## Spy Patterns

### Spy on Methods

```typescript
describe('UserService', () => {
  it('should log user actions', () => {
    const logger = { log: vi.fn() };
    const service = new UserService(logger);

    const spy = vi.spyOn(logger, 'log');

    service.createUser('John');

    expect(spy).toHaveBeenCalledWith('User created: John');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
```

## Timer Mocking

### Mock setTimeout/setInterval

```typescript
describe('Timer Functions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 1000);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
```

## HTTP Request Mocking

### Mock fetch

```typescript
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' })
    } as Response);
  });

  it('should fetch data', async () => {
    const result = await apiClient.getData();

    expect(fetch).toHaveBeenCalledWith('https://api.example.com/data');
    expect(result).toEqual({ data: 'test' });
  });
});
```

## Environment Variable Mocking

```typescript
describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use production URL', () => {
    process.env.NODE_ENV = 'production';
    process.env.API_URL = 'https://prod.api.com';

    const config = require('../src/config').default;
    expect(config.apiUrl).toBe('https://prod.api.com');
  });
});
```

## Mock Return Values

### Different Returns Per Call

```typescript
const mock = vi.fn();

mock
  .mockReturnValueOnce('first')
  .mockReturnValueOnce('second')
  .mockReturnValue('default');

expect(mock()).toBe('first');
expect(mock()).toBe('second');
expect(mock()).toBe('default');
expect(mock()).toBe('default');
```

### Mock Implementation

```typescript
const mock = vi.fn().mockImplementation((x: number) => x * 2);

expect(mock(5)).toBe(10);
expect(mock(3)).toBe(6);
```

## Best Practices

1. **Clear mocks between tests** - Use `vi.clearAllMocks()` in afterEach
2. **Mock at the right level** - Mock external dependencies, not internal logic
3. **Verify mock calls** - Check both arguments and call count
4. **Use type-safe mocks** - Leverage `vi.mocked()` for TypeScript
5. **Restore original implementations** - Clean up after tests
6. **Mock only what's necessary** - Keep as much real behavior as possible
7. **Document complex mocks** - Add comments explaining mock behavior

## Common Gotchas

- Remember to await async mocks
- Clear timers after timer tests
- Restore environment variables
- Reset module cache when needed
- Mock before importing the module under test