# Caching Patterns

Comprehensive guide to caching patterns and strategies for optimal application performance.

## Core Caching Patterns

### 1. Cache-Aside (Lazy Loading)

The application checks the cache first, loads from database on miss.

```javascript
async function getUser(userId) {
  // 1. Check cache first
  const cached = await cache.get(`user:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Load from database on cache miss
  const user = await db.users.findById(userId);

  // 3. Store in cache for next time
  await cache.set(`user:${userId}`, JSON.stringify(user), 'EX', 3600);

  return user;
}
```

**Pros:** Only caches what's needed, resilient to cache failures
**Cons:** Cache miss penalty, potential stale data

### 2. Write-Through

Data is written to cache and database simultaneously.

```javascript
async function updateUser(userId, data) {
  // Write to both simultaneously
  const user = await db.users.update(userId, data);

  await cache.set(`user:${userId}`, JSON.stringify(user), 'EX', 3600);

  return user;
}
```

**Pros:** Cache always consistent with database
**Cons:** Write latency increased, unused data may be cached

### 3. Write-Behind (Write-Back)

Data is written to cache immediately, database write is deferred.

```javascript
async function updateUser(userId, data) {
  // Write to cache immediately
  await cache.set(`user:${userId}`, JSON.stringify(data), 'EX', 3600);

  // Queue database write for later
  await writeQueue.add({
    operation: 'update',
    collection: 'users',
    id: userId,
    data
  });

  return data;
}

// Background worker processes queue
async function processWriteQueue() {
  const job = await writeQueue.get();
  await db[job.collection].update(job.id, job.data);
}
```

**Pros:** Very fast writes, reduced database load
**Cons:** Risk of data loss, complexity

### 4. Read-Through

Cache sits between application and database, handles loading.

```javascript
const readThroughCache = {
  async get(key, loader) {
    let value = await cache.get(key);

    if (!value) {
      value = await loader();
      await cache.set(key, JSON.stringify(value), 'EX', 3600);
    }

    return typeof value === 'string' ? JSON.parse(value) : value;
  }
};

// Usage
const user = await readThroughCache.get(`user:${userId}`, () => {
  return db.users.findById(userId);
});
```

### 5. Refresh-Ahead

Proactively refresh cache before expiration.

```javascript
async function getWithRefreshAhead(key, loader, ttl = 3600) {
  const data = await cache.get(key);
  const meta = await cache.get(`${key}:meta`);

  if (data) {
    const parsed = JSON.parse(data);
    const metaParsed = meta ? JSON.parse(meta) : null;

    // If past 75% of TTL, refresh in background
    if (metaParsed && Date.now() > metaParsed.refreshAt) {
      setImmediate(async () => {
        const fresh = await loader();
        await setWithMeta(key, fresh, ttl);
      });
    }

    return parsed;
  }

  const fresh = await loader();
  await setWithMeta(key, fresh, ttl);
  return fresh;
}

async function setWithMeta(key, value, ttl) {
  await cache.set(key, JSON.stringify(value), 'EX', ttl);
  await cache.set(`${key}:meta`, JSON.stringify({
    createdAt: Date.now(),
    refreshAt: Date.now() + (ttl * 0.75 * 1000)
  }), 'EX', ttl);
}
```

## Cache Invalidation Strategies

### 1. Time-Based (TTL)

```javascript
// Fixed TTL
await cache.set('key', 'value', 'EX', 3600);

// Sliding expiration
async function getWithSliding(key) {
  const value = await cache.get(key);
  if (value) {
    await cache.expire(key, 3600); // Reset TTL on access
  }
  return value;
}
```

### 2. Event-Based

```javascript
// When data changes, invalidate cache
eventBus.on('user:updated', async (userId) => {
  await cache.del(`user:${userId}`);
  await cache.del(`user:${userId}:profile`);
  await cache.del(`user:${userId}:preferences`);
});
```

### 3. Tag-Based

```javascript
class TaggedCache {
  async set(key, value, tags = []) {
    await cache.set(key, value);

    for (const tag of tags) {
      await cache.sadd(`tag:${tag}`, key);
    }
  }

  async invalidateTag(tag) {
    const keys = await cache.smembers(`tag:${tag}`);
    if (keys.length > 0) {
      await cache.del(...keys);
    }
    await cache.del(`tag:${tag}`);
  }
}

// Usage
await taggedCache.set('user:123', userData, ['users', 'user:123']);
await taggedCache.invalidateTag('users'); // Invalidates all user caches
```

### 4. Version-Based

```javascript
async function getVersioned(baseKey, loader) {
  const version = await cache.get(`${baseKey}:version`) || '1';
  const key = `${baseKey}:v${version}`;

  let value = await cache.get(key);
  if (!value) {
    value = await loader();
    await cache.set(key, JSON.stringify(value));
  }

  return JSON.parse(value);
}

async function invalidateVersioned(baseKey) {
  const version = await cache.incr(`${baseKey}:version`);
  return version;
}
```

## Multi-Layer Caching

```javascript
class MultiLayerCache {
  constructor() {
    this.l1 = new Map(); // In-memory (fastest)
    this.l2 = redis;     // Redis (shared)
    this.l3 = database;  // Database (source of truth)
  }

  async get(key, loader) {
    // L1: Memory
    if (this.l1.has(key)) {
      return this.l1.get(key);
    }

    // L2: Redis
    let value = await this.l2.get(key);
    if (value) {
      const parsed = JSON.parse(value);
      this.l1.set(key, parsed);
      return parsed;
    }

    // L3: Database
    value = await loader();

    // Populate all layers
    this.l1.set(key, value);
    await this.l2.set(key, JSON.stringify(value), 'EX', 3600);

    return value;
  }

  async invalidate(key) {
    this.l1.delete(key);
    await this.l2.del(key);
  }
}
```

## Cache Key Patterns

```javascript
const keyPatterns = {
  // Simple resource
  user: (id) => `user:${id}`,

  // Nested resources
  userPosts: (userId, page) => `user:${userId}:posts:page:${page}`,

  // Query-based
  search: (params) => `search:${hashObject(params)}`,

  // Tenant-aware
  tenantUser: (tenantId, userId) => `tenant:${tenantId}:user:${userId}`,

  // Versioned
  config: (version) => `config:v${version}`
};

function hashObject(obj) {
  return crypto.createHash('md5')
    .update(JSON.stringify(obj))
    .digest('hex');
}
```

## Cache Stampede Prevention

```javascript
const locks = new Map();

async function getWithLock(key, loader, ttl = 3600) {
  const cached = await cache.get(key);
  if (cached) return JSON.parse(cached);

  // Check if another request is already loading
  if (locks.has(key)) {
    return locks.get(key);
  }

  // Create promise for loading
  const loadPromise = (async () => {
    try {
      const value = await loader();
      await cache.set(key, JSON.stringify(value), 'EX', ttl);
      return value;
    } finally {
      locks.delete(key);
    }
  })();

  locks.set(key, loadPromise);
  return loadPromise;
}
```

## Related Resources

- [Redis Optimization](redis-optimization.md)
- [CDN Strategies](cdn-strategies.md)
