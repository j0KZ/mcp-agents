# Redis Optimization Guide

Best practices for optimizing Redis performance in production environments.

## Connection Management

### Connection Pooling

```javascript
const Redis = require('ioredis');

// Single connection (not recommended for production)
const redis = new Redis();

// Connection pool (recommended)
const Redis = require('ioredis');
const redis = new Redis.Cluster([
  { port: 6379, host: '127.0.0.1' }
], {
  redisOptions: {
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    lazyConnect: true
  },
  scaleReads: 'slave',
  natMap: {}
});

// Or use generic-pool
const genericPool = require('generic-pool');

const redisPool = genericPool.createPool({
  create: () => new Redis({ lazyConnect: true }),
  destroy: (client) => client.disconnect()
}, {
  max: 10,
  min: 2,
  acquireTimeoutMillis: 3000
});
```

### Pipeline Commands

```javascript
// Bad: Multiple round trips
async function badExample() {
  await redis.set('key1', 'value1');
  await redis.set('key2', 'value2');
  await redis.set('key3', 'value3');
  // 3 round trips
}

// Good: Pipeline (single round trip)
async function goodExample() {
  const pipeline = redis.pipeline();
  pipeline.set('key1', 'value1');
  pipeline.set('key2', 'value2');
  pipeline.set('key3', 'value3');
  await pipeline.exec();
  // 1 round trip
}

// Even better: Multi for atomic operations
async function atomicExample() {
  const multi = redis.multi();
  multi.incr('counter');
  multi.expire('counter', 3600);
  const results = await multi.exec();
}
```

## Memory Optimization

### Key Naming

```javascript
// Bad: Long keys waste memory
const badKey = `application:production:user:profile:details:${userId}`;

// Good: Short but meaningful keys
const goodKey = `u:p:${userId}`; // u=user, p=profile

// Key compression for high cardinality
const compressedKey = `u:${userId.toString(36)}`; // Base36 encoding
```

### Data Serialization

```javascript
// JSON (readable but larger)
await redis.set('user', JSON.stringify(user));

// MessagePack (smaller, faster)
const msgpack = require('msgpack-lite');
await redis.set('user', msgpack.encode(user));

// Comparison
const user = { id: 1, name: 'John', email: 'john@example.com' };
JSON.stringify(user).length;      // ~50 bytes
msgpack.encode(user).length;      // ~35 bytes (30% smaller)
```

### Use Appropriate Data Structures

```javascript
// Storing list of user IDs

// Bad: String with JSON array
await redis.set('online_users', JSON.stringify([1, 2, 3, 4, 5]));

// Good: Redis Set
await redis.sadd('online_users', 1, 2, 3, 4, 5);
await redis.sismember('online_users', 3); // O(1) lookup

// For sorted data: Sorted Set
await redis.zadd('leaderboard', 100, 'user:1', 200, 'user:2');
await redis.zrange('leaderboard', 0, 9, 'REV', 'WITHSCORES');

// For objects with many fields: Hash
await redis.hset('user:1', {
  name: 'John',
  email: 'john@example.com',
  age: '30'
});
await redis.hget('user:1', 'name'); // Get single field
```

### Memory Analysis

```bash
# Check memory usage
redis-cli INFO memory

# Analyze key sizes
redis-cli --bigkeys

# Sample keys for analysis
redis-cli --memkeys --samples 100

# Memory doctor
redis-cli MEMORY DOCTOR
```

## Performance Tuning

### Configuration

```conf
# redis.conf optimizations

# Memory
maxmemory 4gb
maxmemory-policy allkeys-lru

# Persistence (adjust based on needs)
save 900 1
save 300 10
save 60 10000

# Append-only file
appendonly yes
appendfsync everysec

# TCP
tcp-backlog 511
tcp-keepalive 300

# Timeout
timeout 0

# Disable commands that shouldn't be used
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command DEBUG ""
```

### Eviction Policies

```javascript
// Set appropriate eviction policy
// Options: volatile-lru, allkeys-lru, volatile-lfu, allkeys-lfu,
//          volatile-random, allkeys-random, volatile-ttl, noeviction

// In redis.conf or via command
// maxmemory-policy allkeys-lru

// For cache: allkeys-lru (evict any key based on LRU)
// For session store: volatile-lru (only evict keys with TTL)
// For rate limiting: volatile-ttl (evict based on TTL)
```

## Clustering & High Availability

### Redis Cluster

```javascript
const Redis = require('ioredis');

const cluster = new Redis.Cluster([
  { host: '127.0.0.1', port: 7000 },
  { host: '127.0.0.1', port: 7001 },
  { host: '127.0.0.1', port: 7002 }
], {
  scaleReads: 'slave',
  redisOptions: {
    password: 'your-password'
  }
});
```

### Sentinel (High Availability)

```javascript
const redis = new Redis({
  sentinels: [
    { host: 'sentinel1', port: 26379 },
    { host: 'sentinel2', port: 26379 },
    { host: 'sentinel3', port: 26379 }
  ],
  name: 'mymaster',
  password: 'your-password'
});
```

## Lua Scripting

```javascript
// Atomic rate limiting with Lua
const rateLimitScript = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])

  local current = redis.call('INCR', key)

  if current == 1 then
    redis.call('EXPIRE', key, window)
  end

  if current > limit then
    return 0
  end

  return 1
`;

// Register and use
const rateLimit = redis.defineCommand('rateLimit', {
  numberOfKeys: 1,
  lua: rateLimitScript
});

const allowed = await redis.rateLimit('api:user:123', 100, 60);
```

## Monitoring

### Key Metrics

```bash
# Overall stats
redis-cli INFO

# Specific sections
redis-cli INFO stats
redis-cli INFO clients
redis-cli INFO memory

# Real-time monitoring
redis-cli MONITOR  # Warning: impacts performance

# Slow log
redis-cli SLOWLOG GET 10
```

### Alerts Setup

```yaml
# Prometheus alerts example
groups:
  - name: redis
    rules:
      - alert: RedisHighMemory
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis memory usage > 90%"

      - alert: RedisHighConnections
        expr: redis_connected_clients > 1000
        for: 5m
        labels:
          severity: warning

      - alert: RedisCacheHitRateLow
        expr: redis_keyspace_hits / (redis_keyspace_hits + redis_keyspace_misses) < 0.8
        for: 10m
        labels:
          severity: warning
```

## Common Issues & Solutions

### 1. High Latency

```bash
# Check slow queries
redis-cli SLOWLOG GET 25

# Check if using blocking commands
# Avoid: KEYS *, SMEMBERS on large sets

# Use SCAN instead of KEYS
redis-cli SCAN 0 MATCH "user:*" COUNT 100
```

### 2. Memory Fragmentation

```bash
# Check fragmentation ratio
redis-cli INFO memory | grep mem_fragmentation_ratio

# If > 1.5, consider:
# - Restart Redis (with persistence)
# - Use jemalloc allocator
# - Enable activedefrag

# In redis.conf
activedefrag yes
```

### 3. Connection Issues

```javascript
// Handle reconnection
const redis = new Redis({
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});
```

## Related Resources

- [Caching Patterns](caching-patterns.md)
- [CDN Strategies](cdn-strategies.md)
