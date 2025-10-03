# Smart Reviewer Examples

This example shows AI-powered code review capabilities.

## Example 1: Review Pull Request

**Source**: `pull-request.js`

### Using with Claude Code

```
Review the code in examples/smart-reviewer/pull-request.js and provide detailed feedback
```

### Expected Output

```
📝 Code Review Report

File: pull-request.js
Reviewed: 2025-10-03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL ISSUES (2)

1. Missing Authorization Check (Line 28-31)
   Severity: Critical
   Category: Security

   deleteUser(id) {
     // Security: No authorization check
     return this.db.delete('users', { id });
   }

   Issue: Any user can delete any other user's account

   Fix: Add authorization check before deletion:
   ```javascript
   async deleteUser(id, requestingUserId) {
     // Check if user has permission
     const user = await this.getUser(id);
     if (user.id !== requestingUserId && !isAdmin(requestingUserId)) {
       throw new Error('Unauthorized');
     }
     return this.db.delete('users', { id });
   }
   ```

2. Missing Async/Await (Line 23-26)
   Severity: Critical
   Category: Bug

   updateUser(id, data) {
     // Bug: Missing await
     this.db.update('users', { id }, data);
     return { success: true };
   }

   Issue: Function returns before database operation completes

   Fix: Add async/await:
   ```javascript
   async updateUser(id, data) {
     await this.db.update('users', { id }, data);
     return { success: true };
   }
   ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 WARNINGS (3)

3. N+1 Query Problem (Line 13-21)
   Severity: High
   Category: Performance

   async getUser(id) {
     const user = await this.db.findOne('users', { id });
     const posts = [];
     for (const postId of user.postIds) {
       const post = await this.db.findOne('posts', { id: postId });
       posts.push(post);
     }
     user.posts = posts;
     return user;
   }

   Issue: Making N separate queries in a loop causes performance issues

   Fix: Use batch query or JOIN:
   ```javascript
   async getUser(id) {
     const user = await this.db.findOne('users', { id });
     // Fetch all posts in single query
     user.posts = await this.db.find('posts', {
       id: { $in: user.postIds }
     });
     return user;
   }
   ```

4. Missing Input Validation (Line 8-11)
   Severity: Medium
   Category: Security / Best Practices

   async createUser(data) {
     const user = await this.db.insert('users', data);
     return user;
   }

   Issue: No validation of user input before database insertion

   Fix: Add validation:
   ```javascript
   async createUser(data) {
     // Validate input
     if (!data.email || !isValidEmail(data.email)) {
       throw new Error('Invalid email');
     }
     if (!data.name || data.name.length < 2) {
       throw new Error('Name too short');
     }

     const user = await this.db.insert('users', data);
     return user;
   }
   ```

5. Too Many Parameters (Line 34-37)
   Severity: Low
   Category: Code Smell

   sendWelcomeEmail(userId, email, name, template,
                    language, timezone, preferences)

   Issue: Function has 7 parameters, making it hard to use and test

   Fix: Use options object:
   ```javascript
   sendWelcomeEmail(userId, options) {
     const {
       email,
       name,
       template = 'default',
       language = 'en',
       timezone = 'UTC',
       preferences = {}
     } = options;
     // Implementation
   }
   ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ POSITIVE OBSERVATIONS

- Good use of async/await in most methods
- Clear method naming follows conventions
- Dependency injection pattern used (constructor receives db)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 SUMMARY

Total Issues: 5
- Critical: 2
- High: 1
- Medium: 1
- Low: 1

Recommendation: DO NOT MERGE
Fix critical issues before merging this PR.

Estimated Fix Time: 30 minutes
```

## Example 2: Review Specific Aspects

### Security Review Only

```
Review examples/smart-reviewer/pull-request.js focusing only on security issues
```

### Performance Review Only

```
Analyze examples/smart-reviewer/pull-request.js for performance problems
```

### Best Practices Review

```
Check examples/smart-reviewer/pull-request.js against TypeScript/JavaScript best practices
```

## Example 3: Compare Before/After

### Before:
```javascript
updateUser(id, data) {
  this.db.update('users', { id }, data);
  return { success: true };
}
```

### Review Feedback:
```
Missing await - function returns before update completes
```

### After Fix:
```javascript
async updateUser(id, data) {
  await this.db.update('users', { id }, data);
  return { success: true };
}
```

### Re-review:
```
✅ Fixed: Now properly awaits database operation
```

## Example 4: Learning Mode

The Smart Reviewer learns from feedback:

```
Review examples/smart-reviewer/pull-request.js

User: "Actually, the authorization for deleteUser is handled in middleware"
Smart Reviewer: "Thanks for the context! I'll note that authorization
                 checks via middleware are acceptable in this codebase."
```

Next review will remember this pattern.

## Example 5: Custom Rules

```
Review pull-request.js with custom rules:
- All database operations must use transactions
- Functions must have JSDoc comments
- Error messages must be i18n-ready
```

## MCP Tool Reference

### Review File
```json
{
  "tool": "review_file",
  "arguments": {
    "filePath": "examples/smart-reviewer/pull-request.js",
    "options": {
      "depth": "thorough",
      "focus": ["security", "performance", "bugs"]
    }
  }
}
```

### Review Diff
```json
{
  "tool": "review_diff",
  "arguments": {
    "before": "/* old code */",
    "after": "/* new code */",
    "context": "Pull request #123"
  }
}
```

### Learn from Feedback
```json
{
  "tool": "learn_pattern",
  "arguments": {
    "pattern": "authorization via middleware",
    "context": "This project uses Express middleware for auth checks"
  }
}
```

## Review Categories

The Smart Reviewer checks for:

1. **🔴 Security**
   - SQL injection
   - XSS vulnerabilities
   - Authentication/authorization issues
   - Hardcoded secrets
   - Insecure crypto

2. **🐛 Bugs**
   - Missing await
   - Null pointer exceptions
   - Type mismatches
   - Logic errors
   - Edge case handling

3. **⚡ Performance**
   - N+1 queries
   - Inefficient algorithms
   - Memory leaks
   - Unnecessary re-renders
   - Bundle size

4. **🎨 Code Quality**
   - Code duplication
   - Complex functions
   - Poor naming
   - Missing error handling
   - Inconsistent style

5. **📚 Best Practices**
   - SOLID principles
   - Design patterns
   - Framework conventions
   - Documentation
   - Testing

## Tips

- **Context Matters**: Provide context about your codebase for better reviews
- **Incremental**: Review small changes frequently rather than large batches
- **Learning**: The reviewer improves by learning your project's patterns
- **Configurable**: Adjust severity levels and focus areas per project
- **Team Standards**: Define custom rules matching your team's coding standards
