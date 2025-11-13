# Security Fixes Required (from CodeRabbit Review)

## Critical Security Issues to Address

### 1. Shell Command Injection Vulnerabilities in auto-pilot

**Files affected:**
- `packages/auto-pilot/src/auto-fixer.ts` (lines 124, 238, 267)
- `packages/auto-pilot/src/smart-analyzer.ts`

**Issue:** Using string interpolation with `execAsync()` allows potential command injection.

**Fix Required:**
```typescript
// Instead of:
await execAsync(`npx prettier --write "${filePath}"`);

// Use:
await execFileAsync('npx', ['prettier', '--write', filePath]);
```

### 2. Case-Sensitivity Bug in security-scanner

**File:** `packages/security-scanner/src/scanner.ts`

**Issue:** File extension check preserves case, could skip `.TS` or `.JSX` files.

**Fix Required:**
```typescript
// Lowercase extensions before Set lookup
const ext = path.extname(filePath).toLowerCase();
```

## Code Quality Issues to Address

### 1. Unused Variables
- `auto-fixer.ts`: Remove unused `stdout` variables (3 instances)
- `smart-analyzer.ts`: Remove unused `ext` variable
- `index.ts`: Remove unused `keybindings` object

### 2. Private Method Access
- `cli.ts:163`: Create public `startWatchOnly()` method instead of accessing private `watchFiles()`

### 3. Test Helper Duplication
- Extract identical `createContext()` functions to shared test utility

## Performance Issues

### 1. Regex-Based Code Transformations
- Consider AST-based transformations for safer code modifications
- Current regex could match within strings/comments

### 2. Complexity Documentation
- Update O(n²) worst-case complexity documentation in `metrics-calculator.ts`

## Testing Gaps

Add security-focused tests for AutoFixer:
- Path traversal attempts
- Shell metacharacter handling
- Command injection prevention

---

**Note:** These fixes should be addressed in a separate PR after v1.1.0 release to avoid destabilizing the current release.