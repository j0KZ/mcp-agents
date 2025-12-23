# Performance Optimization Techniques

## Overview

Practical optimization techniques for Node.js and JavaScript applications, organized by impact area.

## CPU Optimization

### Algorithm Improvements

```javascript
// O(n²) → O(n) with Set
// Bad
function hasDuplicates(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}

// Good
function hasDuplicates(arr) {
  return new Set(arr).size !== arr.length;
}
```

### Memoization

```javascript
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// LRU cache with size limit
class LRUCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

### Loop Optimization

```javascript
// Cache array length
// Slower
for (let i = 0; i < arr.length; i++) {}

// Faster for large arrays
for (let i = 0, len = arr.length; i < len; i++) {}

// Avoid in-loop allocations
// Bad
for (const item of items) {
  const result = processItem(item);
  results.push(result);
}

// Better
const results = items.map(processItem);
```

## Memory Optimization

### Object Pooling

```javascript
class ObjectPool {
  constructor(factory, reset, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;
    this.pool = [];

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire() {
    return this.pool.pop() || this.factory();
  }

  release(obj) {
    this.reset(obj);
    this.pool.push(obj);
  }
}
```

### Stream Processing

```javascript
// Instead of loading entire file
const data = fs.readFileSync('large.json');
const parsed = JSON.parse(data);

// Stream processing
const JSONStream = require('JSONStream');
const es = require('event-stream');

fs.createReadStream('large.json')
  .pipe(JSONStream.parse('*'))
  .pipe(es.mapSync((data) => processItem(data)))
  .on('end', () => console.log('Done'));
```

### Avoid Memory Leaks

```javascript
// Common leak: Growing collections
class EventTracker {
  events = [];

  // Bad: Unbounded growth
  track(event) {
    this.events.push(event);
  }

  // Good: Bounded size
  track(event) {
    this.events.push(event);
    if (this.events.length > 1000) {
      this.events.shift();
    }
  }
}

// Common leak: Forgotten listeners
// Bad
emitter.on('data', handler);

// Good: Clean up
emitter.on('data', handler);
// Later...
emitter.off('data', handler);
```

## I/O Optimization

### Connection Pooling

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Reuse connections
const result = await pool.query('SELECT * FROM users');
```

### Batching Requests

```javascript
// Instead of individual requests
for (const id of ids) {
  await db.query('SELECT * FROM users WHERE id = ?', [id]);
}

// Batch query
await db.query('SELECT * FROM users WHERE id IN (?)', [ids]);
```

### Parallel Operations

```javascript
// Sequential (slow)
const user = await getUser(id);
const posts = await getPosts(id);
const comments = await getComments(id);

// Parallel (fast)
const [user, posts, comments] = await Promise.all([
  getUser(id),
  getPosts(id),
  getComments(id),
]);

// With concurrency control
const pLimit = require('p-limit');
const limit = pLimit(5);

const results = await Promise.all(
  urls.map((url) => limit(() => fetch(url)))
);
```

## Async Optimization

### Debouncing and Throttling

```javascript
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

### Lazy Initialization

```javascript
// Eager (loads immediately)
const heavyModule = require('heavy-module');

// Lazy (loads on first use)
let _heavyModule;
function getHeavyModule() {
  if (!_heavyModule) {
    _heavyModule = require('heavy-module');
  }
  return _heavyModule;
}

// ES dynamic import
async function useHeavyModule() {
  const { feature } = await import('heavy-module');
  return feature();
}
```

## Serialization Optimization

### JSON Alternatives

```javascript
// Standard JSON
const json = JSON.stringify(data);
const parsed = JSON.parse(json);

// MessagePack (faster, smaller)
const msgpack = require('msgpack-lite');
const packed = msgpack.encode(data);
const unpacked = msgpack.decode(packed);

// Protocol Buffers (schema-based, fastest)
const protobuf = require('protobufjs');
// Define schema, then encode/decode
```

### Fast JSON Parsing

```javascript
// For known schemas
const fastJson = require('fast-json-stringify');
const stringify = fastJson({
  title: 'User',
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer' }
  }
});

const json = stringify({ name: 'John', age: 30 });
```

## V8 Optimization

### Hidden Classes

```javascript
// Bad: Changing shape
function Point(x, y) {
  this.x = x;
  this.y = y;
}
const p = new Point(1, 2);
p.z = 3; // Shape change - deoptimization

// Good: Consistent shape
function Point(x, y, z = 0) {
  this.x = x;
  this.y = y;
  this.z = z;
}
```

### Monomorphic Functions

```javascript
// Polymorphic (slow) - called with different types
function add(a, b) {
  return a + b;
}
add(1, 2);      // numbers
add('a', 'b');  // strings
add([], []);    // arrays

// Monomorphic (fast) - consistent types
function addNumbers(a, b) {
  return a + b;
}
function addStrings(a, b) {
  return a + b;
}
```

## Quick Wins Checklist

- [ ] Replace sync operations with async
- [ ] Implement connection pooling for databases
- [ ] Add caching for repeated computations
- [ ] Use streams for large data processing
- [ ] Batch database operations
- [ ] Parallelize independent async operations
- [ ] Avoid creating objects in hot loops
- [ ] Use appropriate data structures (Map vs Object, Set vs Array)
- [ ] Lazy load heavy modules
- [ ] Profile before and after changes
