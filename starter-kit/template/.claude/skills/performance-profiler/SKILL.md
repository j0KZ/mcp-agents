---
name: performance-profiler
description: "Profile and optimize application performance. Use when diagnosing slow response times, detecting memory leaks, analyzing CPU hotspots, optimizing bundle size, or measuring Core Web Vitals."
---

# Performance Profiler

> Comprehensive performance analysis and optimization toolkit

## Quick Commands

```bash
# CPU profiling
node --inspect app.js
chrome://inspect

# Memory profiling
node --expose-gc --trace-gc app.js

# Bundle size analysis
npx webpack-bundle-analyzer stats.json

# Runtime performance
npx lighthouse http://localhost:3000
```

## Core Functionality

### Key Features

1. **CPU Profiling**: Identify performance hotspots
2. **Memory Analysis**: Detect leaks and optimize usage
3. **Bundle Optimization**: Reduce JavaScript payload
4. **Network Performance**: API and asset loading
5. **Rendering Performance**: DOM and React optimization

## Detailed Information

For comprehensive details, see:

```bash
cat .claude/skills/performance-profiler/references/profiling-guide.md
```

```bash
cat .claude/skills/performance-profiler/references/optimization-techniques.md
```

```bash
cat .claude/skills/performance-profiler/references/metrics-explained.md
```

## Usage Examples

### Example 1: Profile Application Startup

```javascript
import { PerformanceProfiler } from '@j0kz/performance-profiler';

const profiler = new PerformanceProfiler();
profiler.start('app-startup');

// Your application initialization
await app.initialize();

const metrics = profiler.stop('app-startup');
console.log(`Startup time: ${metrics.duration}ms`);
console.log(`Memory used: ${metrics.memoryUsed}MB`);
```

### Example 2: Detect Memory Leaks

```javascript
const leakDetector = profiler.createLeakDetector();

await leakDetector.baseline();
// Perform operations
await leakDetector.snapshot();

const leaks = leakDetector.analyze();
if (leaks.found) {
  console.log('Potential memory leaks:', leaks.suspects);
}
```

## Performance Metrics

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Application Metrics
- **Time to Interactive** (TTI)
- **First Contentful Paint** (FCP)
- **Speed Index**
- **Total Blocking Time** (TBT)

## Configuration

```json
{
  "performance-profiler": {
    "targets": {
      "startupTime": 1000,
      "memoryLimit": "256MB",
      "bundleSize": "200KB"
    },
    "sampling": {
      "cpu": 100,
      "memory": 1000
    },
    "reporting": {
      "format": "html",
      "outputDir": "./performance-reports"
    }
  }
}
```

## Integration with Monitoring

```javascript
// Send metrics to monitoring service
profiler.on('metric', (metric) => {
  monitoring.track(metric.name, metric.value);
});
```

## Notes

- Supports Node.js and browser environments
- Integrates with Chrome DevTools Protocol
- Can generate flamegraphs and memory snapshots
- Automated performance regression detection