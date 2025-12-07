---
name: api-integration
version: 1.0.0
type: integration
tags: [api, integration, rest, graphql, webhooks, third-party]
compatibility: any-project
dependencies: optional
language: any
description: Master third-party API integration in ANY language with best practices and patterns
---

# API Integration - Connect to Any Service

## 🎯 When to Use This Skill

Use when you need to:

- Integrate payment providers (Stripe, PayPal)
- Connect social media APIs (Twitter, Facebook)
- Use cloud services (AWS, Google Cloud)
- Implement OAuth authentication
- Handle webhooks
- Sync data between systems
- Build API clients

## ⚡ Quick Integration (15 minutes)

### WITH MCP (API Designer):

```
"Create integration client for [API name] with authentication and error handling"
"Generate TypeScript types from this OpenAPI spec"
```

### WITHOUT MCP - Universal Pattern:

```javascript
// The Universal API Client Pattern
class APIClient {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      // 1. Add authentication
      const headers = await this.authenticate(options);

      // 2. Make request with timeout
      const response = await this.fetchWithTimeout(url, {
        ...options,
        headers: { ...this.headers, ...headers },
      });

      // 3. Handle response
      return await this.handleResponse(response);
    } catch (error) {
      // 4. Retry logic
      if (this.shouldRetry(error) && this.retries > 0) {
        this.retries--;
        return this.request(endpoint, options);
      }
      throw this.handleError(error);
    }
  }
}
```

## 📚 API Integration Patterns

### 1. Authentication Types

#### API Key Authentication

```javascript
class APIKeyClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async authenticate() {
    return {
      // Header authentication
      'X-API-Key': this.apiKey,
      // Or query parameter
      // params: { api_key: this.apiKey }
    };
  }
}

// Usage
const client = new APIKeyClient(process.env.API_KEY);
```

#### OAuth 2.0 Flow

```javascript
class OAuth2Client {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.tokenEndpoint = config.tokenEndpoint;
  }

  // Step 1: Get authorization URL
  getAuthorizationUrl(state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state: state,
      scope: 'read write',
    });

    return `${this.authEndpoint}?${params}`;
  }

  // Step 2: Exchange code for token
  async getAccessToken(code) {
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    });

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  // Step 3: Refresh token when expired
  async refreshAccessToken(refreshToken) {
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    return await response.json();
  }
}
```

#### JWT Bearer Token

```javascript
class JWTClient {
  constructor(secret) {
    this.secret = secret;
  }

  generateToken(payload) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, this.secret, {
      expiresIn: '1h',
      algorithm: 'HS256',
    });
  }

  async authenticate() {
    const token = this.generateToken({
      sub: this.userId,
      iat: Math.floor(Date.now() / 1000),
    });

    return {
      Authorization: `Bearer ${token}`,
    };
  }
}
```

### 2. Error Handling & Retries

```javascript
class ResilientAPIClient {
  constructor() {
    this.maxRetries = 3;
    this.baseDelay = 1000; // 1 second
  }

  async requestWithRetry(fn, retries = this.maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0 || !this.isRetryable(error)) {
        throw this.enhanceError(error);
      }

      const delay = this.calculateBackoff(this.maxRetries - retries);
      await this.sleep(delay);

      return this.requestWithRetry(fn, retries - 1);
    }
  }

  isRetryable(error) {
    // Retry on network errors and 5xx status codes
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      retryableStatuses.includes(error.statusCode)
    );
  }

  calculateBackoff(attempt) {
    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000;
    return exponentialDelay + jitter;
  }

  enhanceError(error) {
    // Add context to errors
    return {
      ...error,
      timestamp: new Date().toISOString(),
      context: {
        endpoint: error.config?.url,
        method: error.config?.method,
        requestId: error.config?.headers?.['X-Request-ID'],
      },
      suggestion: this.getErrorSuggestion(error),
    };
  }

  getErrorSuggestion(error) {
    const suggestions = {
      401: 'Check API credentials',
      403: 'Verify permissions/scopes',
      404: 'Check endpoint URL',
      429: 'Implement rate limiting',
      500: 'API server error - contact support',
      ECONNREFUSED: 'Check if API is accessible',
    };

    return suggestions[error.code] || suggestions[error.statusCode] || 'Unknown error';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 3. Rate Limiting

```javascript
class RateLimitedClient {
  constructor(requestsPerSecond = 10) {
    this.queue = [];
    this.processing = false;
    this.interval = 1000 / requestsPerSecond;
    this.lastRequestTime = 0;
  }

  async request(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      const timeToWait = Math.max(0, this.interval - timeSinceLastRequest);

      if (timeToWait > 0) {
        await this.sleep(timeToWait);
      }

      const { fn, resolve, reject } = this.queue.shift();

      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      this.lastRequestTime = Date.now();
    }

    this.processing = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const rateLimited = new RateLimitedClient(5); // 5 requests per second
await rateLimited.request(() => fetch('/api/endpoint'));
```

### 4. Webhook Handling

```javascript
class WebhookHandler {
  constructor(secret) {
    this.secret = secret;
    this.handlers = new Map();
  }

  // Register webhook endpoint
  register(app) {
    app.post('/webhooks/:provider', express.raw({ type: '*/*' }), (req, res) =>
      this.handle(req, res)
    );
  }

  async handle(req, res) {
    try {
      // 1. Verify signature
      if (!this.verifySignature(req)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // 2. Parse event
      const event = JSON.parse(req.body);

      // 3. Idempotency check
      if (await this.isDuplicate(event.id)) {
        return res.status(200).json({ status: 'already_processed' });
      }

      // 4. Process event
      await this.processEvent(event);

      // 5. Store event ID
      await this.storeEventId(event.id);

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Processing failed' });
    }
  }

  verifySignature(req) {
    const crypto = require('crypto');

    // Example: Stripe signature verification
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  async isDuplicate(eventId) {
    // Check if event already processed
    // Use database or cache
    return await redis.exists(`webhook:${eventId}`);
  }

  async storeEventId(eventId) {
    // Store with TTL to prevent infinite growth
    await redis.setex(`webhook:${eventId}`, 86400, '1'); // 24 hours
  }

  async processEvent(event) {
    const handler = this.handlers.get(event.type);
    if (!handler) {
      console.warn(`No handler for event type: ${event.type}`);
      return;
    }

    await handler(event);
  }

  on(eventType, handler) {
    this.handlers.set(eventType, handler);
  }
}

// Usage
const webhook = new WebhookHandler(process.env.WEBHOOK_SECRET);
webhook.on('payment.succeeded', async event => {
  await updateOrder(event.data.order_id, 'paid');
});
```

### 5. Response Caching

```javascript
class CachedAPIClient {
  constructor(ttl = 300000) {
    // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  async get(endpoint, options = {}) {
    const cacheKey = this.getCacheKey(endpoint, options);

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    // Fetch fresh data
    const data = await this.fetch(endpoint, options);

    // Cache response
    this.cache.set(cacheKey, {
      data,
      expires: Date.now() + this.ttl,
    });

    // Cleanup old entries
    this.cleanup();

    return data;
  }

  getCacheKey(endpoint, options) {
    return `${endpoint}:${JSON.stringify(options)}`;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expires < now) {
        this.cache.delete(key);
      }
    }
  }

  invalidate(pattern) {
    // Invalidate cache entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
```

## 🔄 Common API Integrations

### Stripe Payment Integration

```javascript
class StripeIntegration {
  constructor(apiKey) {
    this.stripe = require('stripe')(apiKey);
  }

  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          integration_version: '1.0.0',
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      throw this.handleStripeError(error);
    }
  }

  handleStripeError(error) {
    const errors = {
      card_declined: 'Your card was declined',
      expired_card: 'Your card has expired',
      insufficient_funds: 'Insufficient funds',
      processing_error: 'Processing error, please try again',
    };

    return {
      message: errors[error.code] || 'Payment failed',
      code: error.code,
      type: error.type,
    };
  }
}
```

### OpenAI API Integration

```javascript
class OpenAIIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async complete(prompt, options = {}) {
    const response = await fetch(`${this.baseURL}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 150,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
```

## 📊 API Integration Testing

```javascript
// Mock API for testing
class MockAPIClient {
  constructor() {
    this.responses = new Map();
    this.calls = [];
  }

  mockResponse(endpoint, response, options = {}) {
    const key = `${options.method || 'GET'}:${endpoint}`;
    this.responses.set(key, {
      response,
      delay: options.delay || 0,
      error: options.error,
    });
  }

  async request(endpoint, options = {}) {
    const key = `${options.method || 'GET'}:${endpoint}`;
    const mock = this.responses.get(key);

    this.calls.push({ endpoint, options, timestamp: Date.now() });

    if (!mock) {
      throw new Error(`No mock for ${key}`);
    }

    if (mock.delay) {
      await this.sleep(mock.delay);
    }

    if (mock.error) {
      throw mock.error;
    }

    return mock.response;
  }

  getCallHistory() {
    return this.calls;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage in tests
describe('API Integration', () => {
  let client;

  beforeEach(() => {
    client = new MockAPIClient();
    client.mockResponse('/users', { users: [] });
  });

  test('should fetch users', async () => {
    const result = await client.request('/users');
    expect(result.users).toEqual([]);
    expect(client.getCallHistory()).toHaveLength(1);
  });
});
```

## 🎯 Integration Best Practices

### Environment Configuration

```javascript
// config/api.js
const config = {
  development: {
    baseURL: 'https://sandbox.api.example.com',
    timeout: 30000,
    retries: 3,
  },
  production: {
    baseURL: 'https://api.example.com',
    timeout: 10000,
    retries: 5,
  },
};

export default config[process.env.NODE_ENV || 'development'];
```

### Logging & Monitoring

```javascript
class MonitoredAPIClient {
  async request(endpoint, options) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      console.log(`[${requestId}] API Request: ${endpoint}`);

      const response = await this.makeRequest(endpoint, options);

      const duration = Date.now() - startTime;
      console.log(`[${requestId}] Success: ${duration}ms`);

      // Send metrics
      this.metrics.record('api.request', {
        endpoint,
        duration,
        status: response.status,
        success: true,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${requestId}] Error: ${error.message} (${duration}ms)`);

      // Send error metrics
      this.metrics.record('api.error', {
        endpoint,
        duration,
        error: error.code,
        success: false,
      });

      throw error;
    }
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## 💡 Quick Reference

```javascript
// Universal API client initialization
const api = new APIClient({
  baseURL: process.env.API_BASE_URL,
  headers: {
    'X-API-Version': '2.0',
  },
  timeout: 10000,
  retries: 3,
  cache: true,
  rateLimit: 10, // requests per second
});

// Make requests
const users = await api.get('/users');
const user = await api.post('/users', { name: 'John' });
const updated = await api.put('/users/1', { name: 'Jane' });
const deleted = await api.delete('/users/1');

// Handle webhooks
api.onWebhook('user.created', async event => {
  await processNewUser(event.data);
});
```

Remember: Good API integration is invisible to users but crucial for developers! 🔌
