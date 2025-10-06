# Common Workflows

Real-world workflows combining multiple MCP tools for maximum productivity.

## Workflow 1: Building a New Feature

**Scenario**: Adding a new "User Profile" feature to your app

### Step 1: Design the API

```
Design a REST API for user profiles with endpoints for:
- Get profile
- Update profile
- Upload avatar
- Get user statistics
```

### Step 2: Design the Database Schema

```
Design a PostgreSQL schema for user profiles with:
- Personal information
- Avatar URL
- Statistics (views, followers)
- Privacy settings
```

### Step 3: Generate Documentation

```
Generate API documentation from the OpenAPI spec
```

### Step 4: Write the Code

(You write the implementation)

### Step 5: Generate Tests

```
Generate comprehensive tests for src/ProfileService.js with edge cases
```

### Step 6: Security Scan

```
Scan src/ProfileService.js for security vulnerabilities
```

### Step 7: Code Review

```
Review src/ProfileService.js for bugs, performance, and best practices
```

**Result**: Complete, tested, secure feature in minutes!

---

## Workflow 2: Refactoring Legacy Code

**Scenario**: Modernizing old callback-based code

### Step 1: Analyze Architecture

```
Analyze src/legacy/ for circular dependencies and code smells
```

### Step 2: Security Audit

```
Scan src/legacy/ for vulnerabilities before refactoring
```

### Step 3: Convert to Async/Await

```
Convert all callback functions in src/legacy/data-service.js to async/await
```

### Step 4: Simplify Conditionals

```
Refactor nested if statements in src/legacy/validator.js using guard clauses
```

### Step 5: Extract Functions

```
Extract repeated code blocks into reusable functions
```

### Step 6: Generate Tests

```
Generate tests for refactored code to ensure behavior unchanged
```

### Step 7: Verify

```
Run tests and scan for any new issues
```

**Result**: Clean, maintainable code with test coverage!

---

## Workflow 3: API-First Development

**Scenario**: Building a new microservice

### Step 1: Requirements to API Design

```
Design a REST API for an order processing microservice based on:
- Create orders
- Process payments
- Track shipments
- Handle refunds
```

### Step 2: Generate OpenAPI Spec

```
Generate complete OpenAPI 3.0 specification with:
- All endpoints
- Request/response schemas
- Authentication
- Error responses
```

### Step 3: Design Database

```
Design a database schema based on the API requirements
```

### Step 4: Generate Client SDK

```
Generate a TypeScript client SDK from the OpenAPI spec using axios
```

### Step 5: Generate Mock Server

```
Generate a mock server for testing frontend before backend is ready
```

### Step 6: Generate Documentation

```
Generate API documentation in markdown format
```

**Result**: Complete API specification before writing code!

---

## Workflow 4: Security-First Development

**Scenario**: Ensuring secure code from the start

### Step 1: Initial Security Scan

```
Scan the entire codebase for existing vulnerabilities
```

### Step 2: Fix Critical Issues

```
Show me how to fix the SQL injection vulnerability in UserService.ts
```

### Step 3: Refactor Insecure Code

```
Refactor the authentication logic to use bcrypt instead of MD5
```

### Step 4: Code Review with Security Focus

```
Review AuthService.ts focusing on security issues only
```

### Step 5: Generate Tests for Security

```
Generate tests for auth edge cases including:
- Invalid tokens
- Expired sessions
- Brute force attempts
```

### Step 6: Continuous Scanning

```
Set up security scanning in CI/CD pipeline
```

**Result**: Secure application with defense in depth!

---

## Workflow 5: Documentation Sprint

**Scenario**: Need to document entire project quickly

### Step 1: Generate API Docs

```
Generate API documentation from OpenAPI spec in docs/api.md
```

### Step 2: Add JSDoc Comments

```
Generate JSDoc comments for all functions in src/
```

### Step 3: Generate README

```
Generate a comprehensive README.md with:
- Installation instructions
- Usage examples
- API reference
- Contributing guidelines
```

### Step 4: Generate Changelog

```
Generate changelog from git commits for v2.0.0 release
```

### Step 5: Architecture Documentation

```
Generate architecture diagrams showing:
- Dependency graph
- Layer structure
- Module relationships
```

**Result**: Complete documentation suite!

---

## Workflow 6: Test-Driven Development (TDD)

**Scenario**: Writing tests before implementation

### Step 1: Design API

```
Design the API for a shopping cart service
```

### Step 2: Generate Tests First

```
Generate tests for ShoppingCart class with methods:
- addItem()
- removeItem()
- calculateTotal()
- applyDiscount()

Include edge cases for:
- Empty cart
- Invalid quantities
- Concurrent modifications
```

### Step 3: Run Tests (should fail)

```bash
npm test  # All tests fail - no implementation yet
```

### Step 4: Implement Code

(Write minimal code to pass tests)

### Step 5: Refactor

```
Refactor ShoppingCart.ts to improve performance
```

### Step 6: Review

```
Review ShoppingCart.ts for code quality
```

**Result**: Well-tested, clean implementation!

---

## Workflow 7: Database Migration

**Scenario**: Adding new features to existing database

### Step 1: Design New Schema

```
Design schema changes to add:
- User preferences table
- Notification settings
- Activity log
```

### Step 2: Generate Migration

```
Generate migration files for the schema changes
```

### Step 3: Validate Schema

```
Validate the schema for:
- Missing indexes
- Normalization issues
- Constraint problems
```

### Step 4: Generate ER Diagram

```
Create updated ER diagram in Mermaid format
```

### Step 5: Update Documentation

```
Update database documentation with new schema
```

**Result**: Safe, documented database migration!

---

## Workflow 8: Code Review Preparation

**Scenario**: Preparing PR for team review

### Step 1: Self-Review

```
Review my changes in src/payment/ for any obvious issues
```

### Step 2: Security Check

```
Scan modified files for security vulnerabilities
```

### Step 3: Performance Analysis

```
Check for performance issues in the new code
```

### Step 4: Generate Tests

```
Generate tests for newly added functions
```

### Step 5: Update Documentation

```
Generate JSDoc comments for new functions
```

### Step 6: Architecture Check

```
Verify no new circular dependencies were introduced
```

**Result**: PR ready for team review!

---

## Tips for Combining Tools

1. **Start Broad, Then Narrow**: Architecture analysis → specific refactoring → tests

2. **Security Throughout**: Scan before and after refactoring

3. **Document as You Go**: Generate docs while code is fresh in your mind

4. **Test Early**: Generate tests before/during implementation, not after

5. **Iterate**: Use review feedback to improve, then review again

## Next Steps

- 🚀 Learn [Advanced Usage](./03-advanced-usage.md)
- ✨ Read [Best Practices](./04-best-practices.md)
