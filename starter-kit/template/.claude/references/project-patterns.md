# Project Patterns Reference

Common patterns and conventions for this project.

## Code Organization

```
src/           # Main source code
tests/         # Test files  
docs/          # Documentation
scripts/       # Build/automation scripts
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-service.ts` |
| Functions | camelCase | `getUserById()` |
| Classes | PascalCase | `UserService` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |

## Git Conventions

### Commit Messages
```
type(scope): message

Types: feat, fix, docs, style, refactor, test, chore
```

### Branch Names
```
feature/description
fix/description
docs/description
```

## Testing Patterns

### Test File Location
- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/`

### Test Naming
```
describe('ComponentName', () => {
  it('should do something when condition', () => {
    // Arrange, Act, Assert
  });
});
```

## Error Handling

```javascript
// Prefer explicit error types
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Always log errors with context
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { error, context });
  throw error;
}
```

## Security Checklist

- [ ] Input validation at boundaries
- [ ] Parameterized queries (no SQL injection)
- [ ] Output encoding (no XSS)
- [ ] Authentication on protected routes
- [ ] Authorization checks
- [ ] Secrets in environment variables
