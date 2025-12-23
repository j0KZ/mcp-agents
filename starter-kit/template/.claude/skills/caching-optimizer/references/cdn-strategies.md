# CDN Strategies Guide

Best practices for leveraging Content Delivery Networks for optimal performance.

## CDN Fundamentals

### How CDN Caching Works

```
┌─────────┐     ┌──────────────┐     ┌──────────┐
│  User   │────►│  CDN Edge    │────►│  Origin  │
│         │◄────│  (Cached)    │◄────│  Server  │
└─────────┘     └──────────────┘     └──────────┘

1. User requests resource
2. CDN checks edge cache
3. If HIT: Return cached response
4. If MISS: Fetch from origin, cache, return
```

## Cache Control Headers

### Common Headers

```javascript
// Express.js examples

// Static assets (immutable, long cache)
app.use('/assets', express.static('public', {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// API responses (short cache)
app.get('/api/products', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
  res.json(products);
});

// Private data (no CDN cache)
app.get('/api/user/profile', (req, res) => {
  res.setHeader('Cache-Control', 'private, no-cache');
  res.json(userProfile);
});

// No caching at all
app.get('/api/realtime', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(realtimeData);
});
```

### Header Reference

| Header | Usage |
|--------|-------|
| `public` | CDN can cache |
| `private` | Only browser can cache |
| `max-age=N` | Cache for N seconds |
| `s-maxage=N` | CDN cache time (overrides max-age) |
| `no-cache` | Must revalidate before use |
| `no-store` | Never cache |
| `immutable` | Never changes (don't revalidate) |
| `stale-while-revalidate=N` | Serve stale while fetching fresh |
| `stale-if-error=N` | Serve stale if origin fails |

## Cache Key Configuration

### Cloudflare

```javascript
// Workers script for custom cache key
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Create custom cache key (ignore query params)
  const cacheKey = new Request(url.origin + url.pathname, request);

  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (!response) {
    response = await fetch(request);
    response = new Response(response.body, response);
    response.headers.set('Cache-Control', 'public, max-age=3600');
    event.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
}
```

### AWS CloudFront

```yaml
# CloudFormation cache policy
CachePolicy:
  Type: AWS::CloudFront::CachePolicy
  Properties:
    CachePolicyConfig:
      Name: OptimizedCachePolicy
      DefaultTTL: 86400
      MaxTTL: 31536000
      MinTTL: 0
      ParametersInCacheKeyAndForwardedToOrigin:
        CookiesConfig:
          CookieBehavior: none
        HeadersConfig:
          HeaderBehavior: whitelist
          Headers:
            - Accept-Encoding
            - Accept-Language
        QueryStringsConfig:
          QueryStringBehavior: whitelist
          QueryStrings:
            - version
```

## Cache Invalidation

### Purge Strategies

```javascript
// Cloudflare API
async function purgeCache(urls) {
  await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      files: urls
    })
  });
}

// Purge by tag (Cloudflare Enterprise)
async function purgeByTag(tags) {
  await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tags: tags  // ['product:123', 'category:electronics']
    })
  });
}
```

### Cache Busting

```javascript
// Asset fingerprinting
const webpack = require('webpack');

module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js'
  }
};

// Version query strings
function assetUrl(path) {
  const version = process.env.BUILD_VERSION;
  return `${CDN_URL}${path}?v=${version}`;
}
```

## Edge Computing

### Cloudflare Workers

```javascript
// Cache API with custom logic
async function handleRequest(request) {
  const cache = caches.default;
  const url = new URL(request.url);

  // Add geography-based cache key
  const country = request.headers.get('CF-IPCountry');
  const cacheKey = `${url.pathname}:${country}`;

  let response = await cache.match(cacheKey);

  if (!response) {
    // Fetch from origin with country hint
    const originUrl = new URL(request.url);
    originUrl.searchParams.set('country', country);

    response = await fetch(originUrl.toString());

    // Clone and cache
    response = new Response(response.body, response);
    response.headers.set('Cache-Control', 'public, max-age=3600');

    await cache.put(cacheKey, response.clone());
  }

  return response;
}
```

### AWS Lambda@Edge

```javascript
exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  // Normalize Accept-Language for better cache hit rate
  const acceptLanguage = headers['accept-language'];
  if (acceptLanguage) {
    const primaryLang = acceptLanguage[0].value.split(',')[0].split('-')[0];
    headers['accept-language'] = [{ key: 'Accept-Language', value: primaryLang }];
  }

  return request;
};
```

## Performance Optimization

### Compression

```javascript
// Enable at CDN level and origin

// Express.js with compression
const compression = require('compression');

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));
```

### Image Optimization

```javascript
// Cloudflare Image Resizing
function getOptimizedImageUrl(src, options = {}) {
  const { width, height, format = 'auto', quality = 80 } = options;

  const params = new URLSearchParams({
    width,
    height,
    format,
    quality,
    fit: 'cover'
  });

  return `/cdn-cgi/image/${params.toString()}/${src}`;
}

// Usage
<img src={getOptimizedImageUrl('/images/hero.jpg', { width: 800 })} />
```

## Monitoring & Analytics

### Key Metrics

```javascript
// Track cache performance
const cacheMetrics = {
  hits: 0,
  misses: 0,
  bandwidth: 0
};

// In your CDN worker/function
if (response.headers.get('CF-Cache-Status') === 'HIT') {
  cacheMetrics.hits++;
} else {
  cacheMetrics.misses++;
}

// Calculate hit rate
const hitRate = cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses);
```

### Cloudflare Analytics API

```javascript
async function getCacheAnalytics() {
  const query = `
    query {
      viewer {
        zones(filter: { zoneTag: "${ZONE_ID}" }) {
          httpRequests1dGroups(limit: 7) {
            dimensions { date }
            sum {
              cachedRequests
              uncachedRequests
              cachedBytes
              uncachedBytes
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  return response.json();
}
```

## Multi-CDN Strategy

```javascript
// DNS-based load balancing
// Configure in DNS provider (e.g., Route 53, Cloudflare)

// Or application-level fallback
async function fetchWithFallback(path) {
  const cdns = [
    'https://cdn1.example.com',
    'https://cdn2.example.com',
    'https://origin.example.com'
  ];

  for (const cdn of cdns) {
    try {
      const response = await fetch(`${cdn}${path}`, {
        timeout: 5000
      });
      if (response.ok) return response;
    } catch (e) {
      console.warn(`CDN ${cdn} failed:`, e.message);
    }
  }

  throw new Error('All CDNs failed');
}
```

## Best Practices Checklist

- [ ] Set appropriate Cache-Control headers for each content type
- [ ] Use content hashing for static assets
- [ ] Implement cache tags for surgical invalidation
- [ ] Enable compression (gzip/brotli)
- [ ] Configure optimal TTLs per content type
- [ ] Monitor cache hit rates
- [ ] Set up alerts for origin spike traffic
- [ ] Use stale-while-revalidate for better UX
- [ ] Implement fallback strategies

## Related Resources

- [Caching Patterns](caching-patterns.md)
- [Redis Optimization](redis-optimization.md)
