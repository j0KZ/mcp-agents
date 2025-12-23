# Performance Profiling Guide

## Overview

Comprehensive guide for profiling Node.js and JavaScript applications to identify performance bottlenecks, memory leaks, and optimization opportunities.

## CPU Profiling

### Node.js Built-in Profiler

```bash
# Start with profiler
node --prof app.js

# Process the log
node --prof-process isolate-*.log > profile.txt

# With source maps
node --prof --enable-source-maps app.js
```

### Chrome DevTools Profiling

```bash
# Start with inspector
node --inspect app.js

# Or with immediate break
node --inspect-brk app.js
```

Then open `chrome://inspect` in Chrome.

### V8 Sampling Profiler

```javascript
const v8Profiler = require('v8-profiler-next');

// Start profiling
v8Profiler.startProfiling('CPU Profile');

// Run your code
await heavyOperation();

// Stop and save
const profile = v8Profiler.stopProfiling('CPU Profile');
profile.export((error, result) => {
  fs.writeFileSync('cpu-profile.cpuprofile', result);
  profile.delete();
});
```

## Memory Profiling

### Heap Snapshots

```javascript
const v8 = require('v8');
const fs = require('fs');

// Take snapshot
const snapshotPath = `heap-${Date.now()}.heapsnapshot`;
const snapshotStream = v8.writeHeapSnapshot(snapshotPath);
console.log(`Heap snapshot written to ${snapshotPath}`);
```

### Memory Usage Tracking

```javascript
function logMemory(label) {
  const used = process.memoryUsage();
  console.log(`${label}:`);
  console.log(`  RSS: ${Math.round(used.rss / 1024 / 1024)} MB`);
  console.log(`  Heap Total: ${Math.round(used.heapTotal / 1024 / 1024)} MB`);
  console.log(`  Heap Used: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
  console.log(`  External: ${Math.round(used.external / 1024 / 1024)} MB`);
}
```

### Detecting Memory Leaks

```javascript
// Using memwatch
const memwatch = require('@airbnb/node-memwatch');

memwatch.on('leak', (info) => {
  console.error('Memory leak detected:', info);
});

memwatch.on('stats', (stats) => {
  console.log('Heap stats:', stats);
});
```

## Timing and Benchmarks

### Performance Hooks

```javascript
const { performance, PerformanceObserver } = require('perf_hooks');

// Observer for detailed metrics
const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});
obs.observe({ entryTypes: ['measure', 'function'] });

// Manual timing
performance.mark('start');
await operation();
performance.mark('end');
performance.measure('Operation Duration', 'start', 'end');
```

### Benchmark Suite

```javascript
const Benchmark = require('benchmark');

const suite = new Benchmark.Suite();

suite
  .add('RegExp#test', () => /o/.test('Hello World!'))
  .add('String#indexOf', () => 'Hello World!'.indexOf('o') > -1)
  .add('String#includes', () => 'Hello World!'.includes('o'))
  .on('cycle', (event) => console.log(String(event.target)))
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
```

## Event Loop Profiling

### Event Loop Lag

```javascript
const { monitorEventLoopDelay } = require('perf_hooks');

const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

setInterval(() => {
  console.log(`Event loop delay:`);
  console.log(`  Min: ${h.min / 1e6}ms`);
  console.log(`  Max: ${h.max / 1e6}ms`);
  console.log(`  Mean: ${h.mean / 1e6}ms`);
  console.log(`  P99: ${h.percentile(99) / 1e6}ms`);
}, 5000);
```

### Async Hooks for Tracing

```javascript
const async_hooks = require('async_hooks');

const activeResources = new Map();

const hook = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId) {
    activeResources.set(asyncId, { type, trigger: triggerAsyncId });
  },
  destroy(asyncId) {
    activeResources.delete(asyncId);
  }
});

hook.enable();
```

## Profiling Tools

### Clinic.js

```bash
# Doctor - Overall health
npx clinic doctor -- node app.js

# Flame - CPU flame graphs
npx clinic flame -- node app.js

# Bubbleprof - Async flow
npx clinic bubbleprof -- node app.js

# Heapprofiler - Memory
npx clinic heapprofiler -- node app.js
```

### 0x Flame Graphs

```bash
# Generate flame graph
npx 0x app.js

# With specific duration
npx 0x --collect-only app.js
# Then generate
npx 0x --visualize-only ./profile-folder
```

## Database Query Profiling

### Prisma Query Analysis

```javascript
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log(`Query: ${e.query}`);
  console.log(`Duration: ${e.duration}ms`);
});
```

### SQL Slow Query Log

```javascript
// Custom query wrapper
async function trackedQuery(sql, params) {
  const start = performance.now();
  const result = await db.query(sql, params);
  const duration = performance.now() - start;

  if (duration > 100) {
    console.warn(`Slow query (${duration}ms): ${sql}`);
  }

  return result;
}
```

## Profiling Best Practices

### When to Profile

1. **Before optimization** - Establish baseline
2. **After changes** - Measure impact
3. **In production** - Sample periodically
4. **During incidents** - Capture state

### Production Profiling

```javascript
// CPU profile on demand
process.on('SIGUSR2', () => {
  const profiler = require('v8-profiler-next');
  profiler.startProfiling('Production');

  setTimeout(() => {
    const profile = profiler.stopProfiling('Production');
    profile.export((err, result) => {
      fs.writeFileSync(`profile-${Date.now()}.cpuprofile`, result);
      profile.delete();
    });
  }, 30000);
});
```

### Continuous Profiling

```javascript
// Using pprof for continuous profiling
const pprof = require('pprof');

// CPU profiling at 99Hz
pprof.time.start(10);

// Heap profiling
pprof.heap.start(512 * 1024);
```

## Interpreting Results

### Flame Graph Reading

- **Width** = Time spent (wider = more time)
- **Height** = Call stack depth
- **Color** = Category (green=JS, yellow=C++, red=system)
- **Plateaus** = Potential optimization targets

### Common Patterns

| Pattern | Symptom | Likely Cause |
|---------|---------|--------------|
| Wide base | Slow startup | Heavy module loading |
| Tall spikes | Deep recursion | Algorithm issue |
| Flat top | Blocking operation | I/O or heavy computation |
| Jagged | GC pressure | Memory allocation |
