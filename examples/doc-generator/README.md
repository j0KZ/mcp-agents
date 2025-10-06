# Documentation Generator Examples

Generate comprehensive documentation automatically from your code.

## Example 1: Generate JSDoc Comments

```
Generate JSDoc comments for all functions in src/calculator.js
```

### Before:

```javascript
function calculateDiscount(price, percentage) {
  return price * (percentage / 100);
}
```

### After:

```javascript
/**
 * Calculate discount amount based on percentage
 * @param {number} price - Original price
 * @param {number} percentage - Discount percentage (0-100)
 * @returns {number} Discount amount
 * @throws {Error} If percentage is outside 0-100 range
 * @example
 * calculateDiscount(100, 20) // returns 20
 */
function calculateDiscount(price, percentage) {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }
  return price * (percentage / 100);
}
```

## Example 2: Generate README

```
Generate a README.md for the calculator module
```

## Example 3: Generate API Documentation

```
Generate API documentation from OpenAPI spec in markdown format
```

## Example 4: Generate Changelog

```
Generate changelog from git commits between v1.0.0 and v1.1.0
```

### Output:

```markdown
# Changelog

## [1.1.0] - 2025-10-03

### Added

- New discount calculation feature
- Support for bulk operations

### Fixed

- Division by zero error
- Rounding precision issues

### Changed

- Improved performance by 40%
```

## MCP Tool Reference

```json
{
  "tool": "generate_docs",
  "arguments": {
    "sourceFile": "src/calculator.js",
    "outputFormat": "jsdoc"
  }
}
```
