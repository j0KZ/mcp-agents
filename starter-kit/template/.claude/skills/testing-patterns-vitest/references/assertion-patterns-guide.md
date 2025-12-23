# Assertion Patterns Guide

Complete guide to writing effective assertions in Vitest based on function types and return values.

---

## Smart Assertion Selection

**Key principle:** Match assertion to function name and return type

---

## Boolean Functions

### is*, has*, can* → `.toBe(true/false)`

**Functions that return true/false:**

```typescript
isValid(input: string): boolean
hasErrors(result: Result): boolean
canProcess(file: string): boolean
shouldRetry(error: Error): boolean
```

**Assertions:**
```typescript
it('should validate correct input', () => {
  expect(isValid('test')).toBe(true);
  expect(isValid('')).toBe(false);
});

it('should check for errors', () => {
  expect(hasErrors({ issues: [] })).toBe(false);
  expect(hasErrors({ issues: [error1] })).toBe(true);
});

it('should determine if processing is possible', () => {
  expect(canProcess('/valid/path.ts')).toBe(true);
  expect(canProcess('')).toBe(false);
});
```

**Why `.toBe()` not `.toBeTruthy()`:**
- More specific
- Catches bugs (e.g., function returning 1 instead of true)
- Better error messages

---

## Validation Functions

### validate*, check*, verify* → `.toBe(true)` or throw

**Functions that validate:**

```typescript
validateInput(data: unknown): boolean
checkPermissions(user: User): boolean
verifyChecksum(file: string): boolean
```

**Assertions for boolean return:**
```typescript
it('should validate valid input', () => {
  expect(validateInput({ name: 'test' })).toBe(true);
});

it('should reject invalid input', () => {
  expect(validateInput(null)).toBe(false);
});
```

**Assertions for throw on invalid:**
```typescript
it('should validate valid input', () => {
  expect(() => validateInput({ name: 'test' })).not.toThrow();
});

it('should throw for invalid input', () => {
  expect(() => validateInput(null)).toThrow('Invalid input');
});
```

---

## Numeric Functions

### count*, calculate*, *total, *sum → `.toBeGreaterThanOrEqual(0)`

**Functions that return numbers:**

```typescript
countTests(suite: TestSuite): number
calculateScore(metrics: Metrics): number
getTotal(items: Item[]): number
sumValues(arr: number[]): number
```

**Assertions:**
```typescript
it('should count tests', () => {
  const count = countTests(suite);
  expect(count).toBeGreaterThanOrEqual(0);
  expect(typeof count).toBe('number');
});

it('should calculate score in valid range', () => {
  const score = calculateScore(metrics);
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(100);
});

it('should sum values correctly', () => {
  expect(sumValues([1, 2, 3])).toBe(6);
  expect(sumValues([])).toBe(0);
});
```

**For scores/percentages (0-100):**
```typescript
it('should return score between 0 and 100', () => {
  const score = calculateScore(data);
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(100);
});
```

---

## Retrieval Functions

### get*, find*, fetch*, load*, read* → `.toBeDefined()`

**Functions that retrieve data:**

```typescript
getUser(id: string): User | undefined
findMatch(pattern: string): Match | null
loadConfig(path: string): Config
readFile(path: string): Promise<string>
```

**Assertions:**
```typescript
it('should retrieve user', () => {
  const user = getUser('123');
  expect(user).toBeDefined();
  expect(user.id).toBe('123');
});

it('should find match', () => {
  const match = findMatch(/test/);
  expect(match).toBeDefined();
  expect(match.value).toContain('test');
});

it('should load configuration', () => {
  const config = loadConfig('/config.json');
  expect(config).toBeDefined();
  expect(config).toHaveProperty('version');
});
```

**For async functions:**
```typescript
it('should read file content', async () => {
  const content = await readFile('/test.txt');
  expect(content).toBeDefined();
  expect(typeof content).toBe('string');
  expect(content.length).toBeGreaterThan(0);
});
```

---

## Collection Functions

### list*, filter*, map*, select* → `.toBeDefined()` + `Array.isArray()`

**Functions that return arrays:**

```typescript
listFiles(dir: string): string[]
filterItems(items: Item[], predicate: Fn): Item[]
mapValues(obj: Record<string, any>): any[]
selectMatches(pattern: RegExp): Match[]
```

**Assertions:**
```typescript
it('should return array of files', () => {
  const files = listFiles('/src');
  expect(files).toBeDefined();
  expect(Array.isArray(files)).toBe(true);
});

it('should filter items correctly', () => {
  const filtered = filterItems(items, item => item.active);
  expect(filtered).toBeDefined();
  expect(Array.isArray(filtered)).toBe(true);
  expect(filtered.length).toBeGreaterThanOrEqual(0);
  expect(filtered.every(item => item.active)).toBe(true);
});

it('should handle empty results', () => {
  const result = listFiles('/empty');
  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBe(0);
});
```

---

## Object Construction

### create*, build*, make* → Structure assertions

**Functions that build objects:**

```typescript
createUser(data: UserData): User
buildConfig(options: Options): Config
makeRequest(url: string): Request
```

**Assertions:**
```typescript
it('should create user with required properties', () => {
  const user = createUser({ name: 'Test', email: 'test@example.com' });

  expect(user).toBeDefined();
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('name', 'Test');
  expect(user).toHaveProperty('email', 'test@example.com');
  expect(user).toHaveProperty('createdAt');
});

it('should build config with defaults', () => {
  const config = buildConfig({});

  expect(config).toBeDefined();
  expect(config).toMatchObject({
    timeout: 30000,
    retries: 3,
    verbose: false
  });
});
```

---

## Transformation Functions

### format*, convert*, transform*, parse* → Type + structure checks

**Functions that transform data:**

```typescript
formatDate(date: Date): string
convertToJson(obj: any): string
transformData(input: Data): TransformedData
parseInput(str: string): ParsedResult
```

**Assertions:**
```typescript
it('should format date correctly', () => {
  const formatted = formatDate(new Date('2025-01-15'));
  expect(formatted).toBeDefined();
  expect(typeof formatted).toBe('string');
  expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

it('should convert to valid JSON', () => {
  const json = convertToJson({ key: 'value' });
  expect(json).toBeDefined();
  expect(typeof json).toBe('string');
  expect(() => JSON.parse(json)).not.toThrow();
});

it('should transform data structure', () => {
  const transformed = transformData(inputData);
  expect(transformed).toBeDefined();
  expect(transformed).toHaveProperty('processedAt');
  expect(transformed.values).toBeInstanceOf(Array);
});
```

---

## Async Functions

### Any async function → `await` + appropriate assertion

**Async patterns:**

```typescript
async function analyzeFile(path: string): Promise<Analysis>
async function fetchData(url: string): Promise<Response>
async function processQueue(): Promise<void>
```

**Assertions:**
```typescript
it('should analyze file', async () => {
  const result = await analyzeFile('/test.ts');

  expect(result).toBeDefined();
  expect(result).toHaveProperty('issues');
  expect(result).toHaveProperty('metrics');
});

it('should fetch data successfully', async () => {
  const response = await fetchData('https://api.example.com');

  expect(response).toBeDefined();
  expect(response.status).toBe(200);
  expect(response.data).toBeDefined();
});

it('should complete without errors', async () => {
  await expect(processQueue()).resolves.not.toThrow();
});
```

**Error handling:**
```typescript
it('should reject for invalid input', async () => {
  await expect(
    analyzeFile('')
  ).rejects.toThrow('Invalid file path');
});

it('should handle network errors', async () => {
  await expect(
    fetchData('invalid-url')
  ).rejects.toThrow();
});
```

---

## Specific Assertion Types

### Exact Equality: `.toBe()`

**Use for:** Primitives, exact matches

```typescript
it('should return exact value', () => {
  expect(getValue()).toBe(42);
  expect(getName()).toBe('test');
  expect(isEnabled()).toBe(true);
  expect(getNull()).toBe(null);
});
```

### Object Equality: `.toEqual()`

**Use for:** Objects, arrays (deep comparison)

```typescript
it('should return matching object', () => {
  expect(getUser()).toEqual({
    id: '123',
    name: 'Test User',
    active: true
  });
});

it('should return matching array', () => {
  expect(getItems()).toEqual([1, 2, 3]);
});
```

### Partial Match: `.toMatchObject()`

**Use for:** Partial object comparison

```typescript
it('should include required properties', () => {
  const result = analyze(file);

  expect(result).toMatchObject({
    success: true,
    issueCount: expect.any(Number)
  });
  // Other properties can exist
});
```

### String Patterns: `.toMatch()`

**Use for:** Regex matching

```typescript
it('should match pattern', () => {
  expect(generateId()).toMatch(/^[a-z0-9-]+$/);
  expect(formatOutput()).toMatch(/^\d{4}-\d{2}-\d{2}/);
});
```

### Array Contents: `.toContain()`

**Use for:** Array membership

```typescript
it('should include item', () => {
  expect(getLanguages()).toContain('typescript');
  expect(getErrors()).toContain('FILE_NOT_FOUND');
});
```

### Type Checking: `.toBeInstanceOf()`

**Use for:** Class instances

```typescript
it('should return correct instance', () => {
  expect(createAnalyzer()).toBeInstanceOf(CodeAnalyzer);
  expect(getDate()).toBeInstanceOf(Date);
  expect(getError()).toBeInstanceOf(Error);
});
```

---

## Edge Case Assertions

### Empty Values

```typescript
it('should handle empty string', () => {
  expect(() => process('')).toThrow('Empty input');
});

it('should handle empty array', () => {
  const result = process([]);
  expect(result).toBeDefined();
  expect(result.length).toBe(0);
});

it('should handle empty object', () => {
  const result = process({});
  expect(result).toBeDefined();
  expect(Object.keys(result).length).toBeGreaterThan(0);
});
```

### Null/Undefined

```typescript
it('should handle null', () => {
  expect(() => process(null)).toThrow();
});

it('should handle undefined', () => {
  expect(() => process(undefined)).toThrow();
});

it('should return null for not found', () => {
  expect(findItem('nonexistent')).toBe(null);
});
```

### Boundary Values

```typescript
it('should handle zero', () => {
  expect(calculate(0)).toBe(0);
});

it('should handle negative numbers', () => {
  expect(calculate(-1)).toBeLessThan(0);
});

it('should handle MAX_SAFE_INTEGER', () => {
  expect(calculate(Number.MAX_SAFE_INTEGER)).toBeDefined();
});

it('should handle very long strings', () => {
  const long = 'x'.repeat(10000);
  expect(process(long)).toBeDefined();
});
```

---

## Anti-Patterns (DON'T)

### ❌ Too Generic

```typescript
// BAD: Doesn't verify behavior
it('should work', () => {
  const result = analyze(file);
  expect(result).toBeDefined();  // Too vague
});

// GOOD: Specific verification
it('should return analysis with issues array', () => {
  const result = analyze(file);
  expect(result).toBeDefined();
  expect(result.issues).toBeInstanceOf(Array);
  expect(result.metrics.linesOfCode).toBeGreaterThan(0);
});
```

### ❌ Using `.toBeTruthy()` for booleans

```typescript
// BAD: Accepts any truthy value
it('should validate', () => {
  expect(isValid('test')).toBeTruthy();  // Passes for 1, "yes", {}, etc.
});

// GOOD: Explicit boolean check
it('should validate', () => {
  expect(isValid('test')).toBe(true);  // Only passes for true
});
```

### ❌ Multiple Unrelated Assertions

```typescript
// BAD: Testing too many things
it('should do everything', () => {
  expect(func1()).toBe(1);
  expect(func2()).toBe(2);
  expect(func3()).toBe(3);
});

// GOOD: Separate tests
it('should return 1', () => {
  expect(func1()).toBe(1);
});

it('should return 2', () => {
  expect(func2()).toBe(2);
});
```

---

## Quick Reference Table

| Function Pattern | Return Type | Assertion |
|-----------------|-------------|-----------|
| `isValid()` | `boolean` | `.toBe(true/false)` |
| `countTests()` | `number` | `.toBeGreaterThanOrEqual(0)` |
| `getUser()` | `User \| undefined` | `.toBeDefined()` + properties |
| `listFiles()` | `string[]` | `.toBeDefined()` + `Array.isArray()` |
| `formatDate()` | `string` | `.toBeDefined()` + `.toMatch()` |
| `async analyze()` | `Promise<Result>` | `await` + `.toBeDefined()` |
| `calculateScore()` | `number (0-100)` | `.toBeGreaterThanOrEqual(0)` + `.toBeLessThanOrEqual(100)` |

---

## Related

- See `mocking-guide.md` for mocking strategies
- See `coverage-guide.md` for coverage targets
- See main SKILL.md for complete testing patterns

---

**Reference:** 388 tests across @j0kz/mcp-agents monorepo
**Framework:** Vitest
**Project:** @j0kz/mcp-agents
