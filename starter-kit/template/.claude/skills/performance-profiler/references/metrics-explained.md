# Performance Metrics Explained

## Overview

Understanding key performance metrics, what they measure, and how to interpret them for actionable insights.

## Response Time Metrics

### Latency Percentiles

| Metric | Description | Target (API) |
|--------|-------------|--------------|
| P50 | Median response time | <100ms |
| P90 | 90th percentile | <200ms |
| P95 | 95th percentile | <300ms |
| P99 | 99th percentile | <500ms |
| P99.9 | 99.9th percentile | <1s |

**Why percentiles matter:**
- Mean hides outliers
- P50 shows typical experience
- P99 shows worst-case for most users
- P99.9 catches rare but impactful issues

```javascript
function calculatePercentile(values, percentile) {
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}
```

### Time to First Byte (TTFB)

**What it measures:** Time from request start to first byte received

**Breakdown:**
- DNS lookup
- TCP connection
- TLS handshake
- Server processing
- Network transit

**Good targets:**
- Static content: <50ms
- Dynamic content: <200ms
- API endpoints: <100ms

## Throughput Metrics

### Requests Per Second (RPS)

```javascript
// Calculate RPS from logs
function calculateRPS(timestamps, windowMs = 1000) {
  const windows = new Map();

  for (const ts of timestamps) {
    const window = Math.floor(ts / windowMs);
    windows.set(window, (windows.get(window) || 0) + 1);
  }

  const values = Array.from(windows.values());
  return {
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    max: Math.max(...values),
    min: Math.min(...values),
  };
}
```

### Concurrent Connections

**What it measures:** Active connections at any point in time

**Factors affecting it:**
- Keep-alive settings
- Connection pooling
- Client behavior
- Load balancer configuration

## Memory Metrics

### Node.js Memory Types

| Metric | Description | Concern Level |
|--------|-------------|---------------|
| RSS | Total memory allocated | >1GB |
| Heap Total | V8 heap allocated | >512MB |
| Heap Used | V8 heap in use | >70% of total |
| External | C++ objects | Growing over time |
| Array Buffers | ArrayBuffer memory | Growing unexpectedly |

```javascript
const used = process.memoryUsage();

// Key ratios to monitor
const heapUsageRatio = used.heapUsed / used.heapTotal;
const rssToHeap = used.rss / used.heapTotal;

// Warning thresholds
if (heapUsageRatio > 0.85) {
  console.warn('High heap usage - GC may be struggling');
}

if (rssToHeap > 3) {
  console.warn('High RSS/Heap ratio - possible native memory leak');
}
```

### Garbage Collection Metrics

```javascript
const v8 = require('v8');

// GC statistics
const gcStats = v8.getHeapStatistics();

console.log({
  totalHeapSize: gcStats.total_heap_size,
  usedHeapSize: gcStats.used_heap_size,
  heapSizeLimit: gcStats.heap_size_limit,
  mallocedMemory: gcStats.malloced_memory,
  externalMemory: gcStats.external_memory,
});
```

**GC Pause Metrics:**
- Minor GC (Scavenge): <10ms
- Major GC (Mark-Sweep): <100ms
- GC frequency: Not too often (indicates memory pressure)

## CPU Metrics

### Event Loop Lag

**What it measures:** Delay between scheduled callback and execution

```javascript
const { monitorEventLoopDelay } = require('perf_hooks');

const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

// After running...
console.log({
  min: h.min / 1e6,      // Should be ~0
  max: h.max / 1e6,      // <100ms ideal
  mean: h.mean / 1e6,    // <10ms ideal
  stddev: h.stddev / 1e6,
  p99: h.percentile(99) / 1e6, // <50ms ideal
});
```

**Healthy targets:**
- Mean lag: <10ms
- P99 lag: <50ms
- Max lag: <100ms

### CPU Utilization

**What it measures:** Percentage of CPU time used

```javascript
const os = require('os');

function getCPUUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }

  return 1 - (totalIdle / totalTick);
}
```

**Targets:**
- Sustained: <70%
- Peak: <90%
- If consistently >80%: Scale or optimize

## Network Metrics

### Bandwidth

| Metric | Description |
|--------|-------------|
| Bytes In | Data received |
| Bytes Out | Data sent |
| Packets/sec | Network activity |
| Errors | Transmission failures |

### Connection States

```javascript
// Monitor with netstat
// ESTABLISHED - active connections
// TIME_WAIT - closed, waiting for lingering packets
// CLOSE_WAIT - remote closed, local hasn't

// High TIME_WAIT = connection churn
// High CLOSE_WAIT = application not closing connections
```

## Application Metrics

### Apdex Score

**Formula:** (Satisfied + Tolerating × 0.5) / Total

| Response | Classification |
|----------|----------------|
| ≤T | Satisfied |
| T to 4T | Tolerating |
| >4T | Frustrated |

Where T = target response time (e.g., 500ms)

```javascript
function calculateApdex(responseTimes, targetMs) {
  let satisfied = 0;
  let tolerating = 0;

  for (const time of responseTimes) {
    if (time <= targetMs) satisfied++;
    else if (time <= targetMs * 4) tolerating++;
  }

  return (satisfied + tolerating * 0.5) / responseTimes.length;
}

// Interpretation
// 0.94+ Excellent
// 0.85-0.93 Good
// 0.70-0.84 Fair
// 0.50-0.69 Poor
// <0.50 Unacceptable
```

### Error Rate

```javascript
// Error rate = errors / total requests
const errorRate = errors / totalRequests;

// Targets
// < 0.1% - Excellent
// 0.1-1% - Acceptable
// 1-5% - Concerning
// > 5% - Critical
```

## Database Metrics

### Query Performance

| Metric | Good | Investigate |
|--------|------|-------------|
| Query time (simple) | <10ms | >50ms |
| Query time (complex) | <100ms | >500ms |
| Connection pool wait | <10ms | >100ms |
| Connections used | <70% | >90% |

### Index Effectiveness

```sql
-- Check index usage
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Key metrics
-- Seq Scan = No index used (usually bad)
-- Index Scan = Index used (good)
-- Rows scanned vs returned ratio
```

## Interpreting Metric Combinations

### High Latency + Low CPU
- Database bottleneck
- External service slow
- I/O waiting
- Network issues

### High Latency + High CPU
- CPU-bound processing
- Inefficient algorithms
- Missing caching
- GC pressure

### High Memory + Normal Performance
- Memory leak (growing over time)
- Large caches (may be intentional)
- Data accumulation

### Event Loop Lag + High CPU
- Blocking operations
- Heavy computation in main thread
- Need for worker threads

## Monitoring Dashboard Essentials

```
┌─────────────────────────────────────────────────────────┐
│ GOLDEN SIGNALS                                          │
├──────────────┬──────────────┬──────────────┬───────────┤
│ Latency P99  │ Traffic RPS  │ Errors %     │ Saturation│
│    145ms     │    1,234     │    0.02%     │   45%     │
├──────────────┴──────────────┴──────────────┴───────────┤
│ SYSTEM HEALTH                                           │
├──────────────┬──────────────┬──────────────┬───────────┤
│ CPU Usage    │ Memory       │ Event Loop   │ GC Time   │
│    35%       │ 456MB/1GB    │    2.3ms     │   1.2%    │
└──────────────┴──────────────┴──────────────┴───────────┘
```
