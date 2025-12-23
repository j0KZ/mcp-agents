# Dependency Optimization Strategies

## Overview

Strategies for optimizing project dependencies to reduce bundle size, improve performance, and simplify maintenance.

## Bundle Size Optimization

### Analyze Current State

```bash
# Webpack bundle analyzer
npx webpack-bundle-analyzer stats.json

# Source map explorer
npx source-map-explorer dist/**/*.js

# Bundle size checker
npx bundlesize
```

### Tree Shaking

Enable proper tree shaking:

```javascript
// package.json - mark as side-effect free
{
  "sideEffects": false,
  // Or specify files with side effects
  "sideEffects": ["*.css", "./src/polyfills.js"]
}
```

```javascript
// Import only what you need
// Bad
import _ from 'lodash';
// Good
import debounce from 'lodash/debounce';
// Best (with lodash-es)
import { debounce } from 'lodash-es';
```

### Replace Heavy Dependencies

| Heavy Package | Lighter Alternative | Size Reduction |
|--------------|---------------------|----------------|
| moment | date-fns | ~70% |
| lodash | lodash-es + tree shake | ~80% |
| axios | ky or fetch | ~90% |
| uuid | nanoid | ~60% |
| validator | is-* packages | ~85% |
| chalk | picocolors | ~95% |

### Code Splitting

```javascript
// Dynamic imports for lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Route-based splitting
const routes = [
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard')
  }
];
```

## Dependency Reduction

### Identify Unused Dependencies

```bash
# Find unused dependencies
npx depcheck

# With custom config
npx depcheck --ignores="@types/*,eslint-*"
```

### Consolidate Similar Packages

```javascript
// Before: Multiple HTTP clients
// axios, node-fetch, got, request

// After: Single client
// ky (or native fetch with wrapper)
```

### Native Alternatives

Replace with native APIs when possible:

```javascript
// Instead of: left-pad
str.padStart(10, ' ');

// Instead of: is-array
Array.isArray(value);

// Instead of: object-assign
Object.assign({}, obj);
// Or spread
{ ...obj };

// Instead of: array-flatten
arr.flat(Infinity);
```

## Version Management

### Lock File Strategy

```bash
# Always commit lock files
git add package-lock.json

# Use exact versions for critical deps
npm install --save-exact critical-package

# Clean install in CI
npm ci
```

### Pinning Strategy

```json
{
  "dependencies": {
    // Pin exact for critical
    "express": "4.18.2",
    // Allow patches for stable
    "lodash": "~4.17.21",
    // Allow minor for active development
    "react": "^18.2.0"
  }
}
```

## Performance Optimization

### Lazy Loading

```javascript
// Load heavy deps only when needed
async function generatePDF() {
  const { jsPDF } = await import('jspdf');
  // Use jsPDF
}
```

### Peer Dependencies

```json
{
  "peerDependencies": {
    // Don't bundle, expect host to provide
    "react": "^18.0.0"
  }
}
```

### Optional Dependencies

```json
{
  "optionalDependencies": {
    // Won't fail install if unavailable
    "fsevents": "^2.3.0"
  }
}
```

## Maintenance Optimization

### Dependency Groups

```json
{
  "scripts": {
    "update:deps": "npm update",
    "update:dev": "npm update --save-dev",
    "update:security": "npm audit fix"
  }
}
```

### Automated Updates

```yaml
# Renovate config
{
  "extends": ["config:base"],
  "automerge": true,
  "automergeType": "branch",
  "packageRules": [
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    },
    {
      "matchPackagePatterns": ["eslint"],
      "groupName": "eslint"
    }
  ]
}
```

## Metrics and Targets

### Bundle Size Budget

```json
// bundlesize config
{
  "bundlesize": [
    {
      "path": "./dist/*.js",
      "maxSize": "100 kB"
    }
  ]
}
```

### Dependency Count Targets

| Project Type | Max Direct Deps | Max Dev Deps |
|--------------|-----------------|--------------|
| Library | 3-5 | 10-15 |
| CLI Tool | 5-10 | 10-15 |
| Web App | 15-25 | 20-30 |
| Full Stack | 25-40 | 30-50 |

## Checklist

- [ ] Run bundle analysis
- [ ] Remove unused dependencies
- [ ] Replace heavy packages with lighter alternatives
- [ ] Enable tree shaking where possible
- [ ] Implement code splitting for large modules
- [ ] Set bundle size budgets
- [ ] Configure automated updates
- [ ] Document dependency decisions
