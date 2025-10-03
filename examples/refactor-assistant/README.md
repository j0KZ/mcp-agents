# Refactor Assistant Examples

This example demonstrates various code refactoring techniques.

## Example 1: Convert Callbacks to Async/Await

**Source**: `legacy-code.js` (getUserData function)

### Using with Claude Code

```
Convert the getUserData function in examples/refactor-assistant/legacy-code.js from callbacks to async/await
```

### Before:
```javascript
function getUserData(userId, callback) {
  db.findUser(userId, (err, user) => {
    if (err) {
      callback(err);
    } else {
      db.findPosts(user.id, (err, posts) => {
        if (err) {
          callback(err);
        } else {
          db.findComments(posts[0].id, (err, comments) => {
            if (err) {
              callback(err);
            } else {
              callback(null, { user, posts, comments });
            }
          });
        }
      });
    }
  });
}
```

### After:
```javascript
async function getUserData(userId) {
  try {
    const user = await db.findUser(userId);
    const posts = await db.findPosts(user.id);
    const comments = await db.findComments(posts[0].id);
    return { user, posts, comments };
  } catch (error) {
    throw error;
  }
}
```

## Example 2: Simplify Nested Conditionals

**Source**: `legacy-code.js` (processOrder function)

### Using with Claude Code

```
Simplify the nested conditionals in processOrder function using guard clauses
```

### Before:
```javascript
function processOrder(order) {
  if (order) {
    if (order.items && order.items.length > 0) {
      if (order.status === 'pending') {
        if (order.total > 0) {
          if (order.paymentMethod) {
            return processPayment(order);
          } else {
            return { error: 'No payment method' };
          }
        } else {
          return { error: 'Invalid total' };
        }
      } else {
        return { error: 'Order not pending' };
      }
    } else {
      return { error: 'No items' };
    }
  } else {
    return { error: 'No order' };
  }
}
```

### After:
```javascript
function processOrder(order) {
  // Guard clauses for early returns
  if (!order) return { error: 'No order' };
  if (!order.items || order.items.length === 0) return { error: 'No items' };
  if (order.status !== 'pending') return { error: 'Order not pending' };
  if (order.total <= 0) return { error: 'Invalid total' };
  if (!order.paymentMethod) return { error: 'No payment method' };

  return processPayment(order);
}
```

## Example 3: Extract Function

**Source**: `legacy-code.js` (calculateUserStats function)

### Using with Claude Code

```
Extract the repeated calculation pattern from calculateUserStats into a reusable function
```

### Before:
```javascript
function calculateUserStats() {
  const totalPosts = user.posts.length;
  const totalComments = user.comments.length;
  const totalLikes = user.likes.length;

  const postsPerDay = totalPosts / user.daysSinceJoined;
  const commentsPerDay = totalComments / user.daysSinceJoined;
  const likesPerDay = totalLikes / user.daysSinceJoined;

  return {
    posts: { total: totalPosts, perDay: postsPerDay },
    comments: { total: totalComments, perDay: commentsPerDay },
    likes: { total: totalLikes, perDay: likesPerDay }
  };
}
```

### After:
```javascript
function calculatePerDay(total, days) {
  return total / days;
}

function calculateStat(items, days) {
  const total = items.length;
  const perDay = calculatePerDay(total, days);
  return { total, perDay };
}

function calculateUserStats() {
  const days = user.daysSinceJoined;

  return {
    posts: calculateStat(user.posts, days),
    comments: calculateStat(user.comments, days),
    likes: calculateStat(user.likes, days)
  };
}
```

## Example 4: Remove Dead Code

**Source**: `legacy-code.js` (import statements)

### Using with Claude Code

```
Remove unused imports from examples/refactor-assistant/legacy-code.js
```

### Before:
```javascript
import { oldFunction, deprecatedUtil } from './utils';
import { helper1, helper2, unusedHelper } from './helpers';

function activeFunction() {
  return helper1() + helper2();
}
```

### After:
```javascript
import { helper1, helper2 } from './helpers';

function activeFunction() {
  return helper1() + helper2();
}
```

## Example 5: Apply Design Patterns

### Singleton Pattern

```
Apply singleton pattern to the DatabaseConnection class
```

**Before**:
```javascript
class DatabaseConnection {
  constructor() {
    this.connection = null;
  }

  connect() {
    this.connection = createConnection();
  }
}
```

**After**:
```javascript
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: any = null;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  connect() {
    if (!this.connection) {
      this.connection = createConnection();
    }
  }
}

// Usage
const db = DatabaseConnection.getInstance();
```

### Strategy Pattern

```
Refactor payment processing to use strategy pattern
```

**Before**:
```javascript
function processPayment(order, method) {
  if (method === 'credit') {
    return processCreditCard(order);
  } else if (method === 'paypal') {
    return processPayPal(order);
  } else if (method === 'crypto') {
    return processCrypto(order);
  }
}
```

**After**:
```javascript
class PaymentStrategy {
  process(order) {
    throw new Error('Must implement process method');
  }
}

class CreditCardStrategy extends PaymentStrategy {
  process(order) {
    return processCreditCard(order);
  }
}

class PayPalStrategy extends PaymentStrategy {
  process(order) {
    return processPayPal(order);
  }
}

class CryptoStrategy extends PaymentStrategy {
  process(order) {
    return processCrypto(order);
  }
}

class PaymentProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }

  process(order) {
    return this.strategy.process(order);
  }
}

// Usage
const processor = new PaymentProcessor(new CreditCardStrategy());
processor.process(order);
```

## Example 6: Calculate Code Metrics

```
Calculate complexity metrics for examples/refactor-assistant/legacy-code.js
```

### Expected Output:
```
📊 Code Metrics:

File: legacy-code.js
- Lines of Code: 85
- Cyclomatic Complexity: 12 (High)
- Functions: 4
- Maintainability Index: 45 (Needs Improvement)

Recommendations:
1. processOrder() has complexity 8 - consider simplifying
2. getUserData() has nested callbacks - convert to async/await
3. calculateUserStats() has code duplication - extract helper function
```

## MCP Tool Reference

### Convert to Async/Await
```json
{
  "tool": "convert_to_async",
  "arguments": {
    "code": "/* callback code */",
    "useTryCatch": true
  }
}
```

### Simplify Conditionals
```json
{
  "tool": "simplify_conditionals",
  "arguments": {
    "code": "/* nested if statements */",
    "useGuardClauses": true,
    "useTernary": true
  }
}
```

### Extract Function
```json
{
  "tool": "extract_function",
  "arguments": {
    "code": "/* full source code */",
    "functionName": "calculatePerDay",
    "startLine": 5,
    "endLine": 7,
    "arrow": true
  }
}
```

### Remove Dead Code
```json
{
  "tool": "remove_dead_code",
  "arguments": {
    "code": "/* code with unused imports */",
    "removeUnusedImports": true,
    "removeUnreachable": true
  }
}
```

### Apply Pattern
```json
{
  "tool": "apply_pattern",
  "arguments": {
    "code": "/* class code */",
    "pattern": "singleton"
  }
}
```

## Tips

- **Complexity Threshold**: Functions with complexity > 10 should be refactored
- **Guard Clauses**: Reduce nesting depth by 50-70%
- **Async/Await**: Improves readability and error handling
- **Design Patterns**: Use when you see repeated structural problems
- **Dead Code**: Removing unused code reduces bundle size and confusion
