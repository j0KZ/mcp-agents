# Starting a New Project Cookbook 🚀

**Set up a new project the right way from day one**

---

## The Complete New Project Setup

### What You Type

```
"I'm starting a new Node.js API project. Set it up with best practices"
```

### The Orchestrated Workflow

```mermaid
graph LR
    A[New Project] --> B[Architecture Analyzer]
    B --> C[API Designer]
    C --> D[DB Schema Designer]
    D --> E[Security Scanner]
    E --> F[Test Generator]
    F --> G[Doc Generator]
    G --> H[Project Ready!]
```

---

## Step-by-Step Example: E-Commerce API

### Step 1: Architecture Planning

**You:** "Plan the architecture for an e-commerce API"

**Architecture Analyzer suggests:**

```
src/
├── controllers/       # HTTP layer
│   ├── productController.js
│   ├── orderController.js
│   └── userController.js
├── services/         # Business logic
│   ├── productService.js
│   ├── orderService.js
│   ├── paymentService.js
│   └── emailService.js
├── repositories/     # Data access
│   ├── productRepository.js
│   └── orderRepository.js
├── models/          # Data models
│   ├── Product.js
│   ├── Order.js
│   └── User.js
├── middleware/      # Cross-cutting concerns
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
└── utils/          # Shared utilities
    ├── logger.js
    └── constants.js
```

**Clean Architecture Validation:**

- ✅ Controllers → Services → Repositories
- ✅ No circular dependencies
- ✅ Clear separation of concerns

### Step 2: API Design

**API Designer generates:**

```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: E-Commerce API
  version: 1.0.0

paths:
  /products:
    get:
      summary: List products
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: category
          in: query
          schema:
            type: string
      responses:
        200:
          description: Product list
          content:
            application/json:
              schema:
                type: object
                properties:
                  products:
                    type: array
                    items:
                      $ref: '#/components/schemas/Product'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

  /products/{id}:
    get:
      summary: Get product details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        200:
          description: Product details
        404:
          description: Product not found

  /orders:
    post:
      summary: Create order
      security:
        - bearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOrder'
      responses:
        201:
          description: Order created
        400:
          description: Invalid order data
```

### Step 3: Database Schema

**DB Schema Designer creates:**

```sql
-- PostgreSQL Schema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### Step 4: Security Setup

**Security Scanner configures:**

```javascript
// security/config.js
export const securityConfig = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests
    message: 'Too many requests',
  },

  // CORS settings
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
    refreshExpiresIn: '7d',
  },

  // Input validation rules
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
    },
  },

  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },
};

// middleware/security.js
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

export const setupSecurity = app => {
  app.use(helmet());
  app.use(rateLimit(securityConfig.rateLimit));
  app.use(mongoSanitize());

  // Prevent SQL injection
  app.use((req, res, next) => {
    // Sanitize all inputs
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/[<>'"]/g, '');
      }
    });
    next();
  });
};
```

### Step 5: Initial Tests

**Test Generator creates:**

```javascript
// tests/setup.test.js
describe('Project Setup Validation', () => {
  it('should have all required environment variables', () => {
    const required = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
    required.forEach(key => {
      expect(process.env[key]).toBeDefined();
    });
  });

  it('should connect to database', async () => {
    const connection = await db.connect();
    expect(connection).toBeDefined();
    await connection.close();
  });

  it('should have all required middleware', () => {
    const app = createApp();
    const middleware = app._router.stack.map(layer => layer.name);

    expect(middleware).toContain('helmet');
    expect(middleware).toContain('cors');
    expect(middleware).toContain('rateLimit');
  });
});

// tests/api/products.test.js
describe('Product API', () => {
  describe('GET /products', () => {
    it('should return paginated products', async () => {
      const response = await request(app).get('/products?page=1&limit=10').expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.products.length).toBeLessThanOrEqual(10);
    });

    it('should filter by category', async () => {
      const response = await request(app).get('/products?category=electronics').expect(200);

      response.body.products.forEach(product => {
        expect(product.category).toBe('electronics');
      });
    });
  });
});
```

### Step 6: Documentation

**Doc Generator creates:**

````markdown
# E-Commerce API

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## Architecture

This project follows Clean Architecture principles:

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Repositories**: Handle data persistence
- **Models**: Define data structures

## API Documentation

Full API documentation available at `/api-docs` when running locally.

### Authentication

All authenticated endpoints require a Bearer token:

```
Authorization: Bearer <your-token>
```

### Main Endpoints

- `GET /products` - List products
- `GET /products/:id` - Get product details
- `POST /orders` - Create order (authenticated)
- `GET /orders/:id` - Get order details (authenticated)

## Testing

```bash
npm test           # Run all tests
npm run test:unit  # Unit tests only
npm run test:e2e   # End-to-end tests
```

## Security

- JWT authentication
- Rate limiting (100 requests/15 min)
- Input sanitization
- SQL injection prevention
- XSS protection
- CORS configured

## Database

PostgreSQL with migrations:

```bash
npm run migrate        # Run migrations
npm run migrate:undo   # Rollback
npm run seed          # Seed test data
```
````

---

## The Complete Package.json

```json
{
  "name": "ecommerce-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "migrate": "knex migrate:latest",
    "seed": "knex seed:run",
    "pre-commit": "npm run lint && npm run test",
    "security:check": "npm audit && npx snyk test"
  },
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^6.7.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "pg": "^8.11.0",
    "knex": "^2.4.2",
    "joi": "^17.9.2",
    "winston": "^3.8.2"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "eslint": "^8.42.0",
    "nodemon": "^2.0.22"
  }
}
```

---

## Environment Variables (.env.example)

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce

# Security
JWT_SECRET=your-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# External Services (if needed)
STRIPE_SECRET_KEY=
SENDGRID_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

---

## Git Repository Setup

```bash
# Initialize git
git init

# Create .gitignore
cat > .gitignore << EOF
node_modules/
.env
.env.local
logs/
*.log
coverage/
.DS_Store
dist/
build/
EOF

# Initial commit
git add .
git commit -m "feat: initial project setup with MCP tools

- Clean architecture structure
- API design with OpenAPI spec
- PostgreSQL schema with migrations
- Security configuration (JWT, rate limiting, input validation)
- Test setup with Jest
- Documentation and README

Generated with @j0kz/mcp-agents"
```

---

## CI/CD Setup (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run security check
        run: npm run security:check

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## First Day Checklist

```markdown
## Day 1: Project Setup ✅

### Structure

- [x] Clean architecture folders created
- [x] No circular dependencies
- [x] Clear separation of concerns

### API Design

- [x] OpenAPI specification
- [x] RESTful endpoints defined
- [x] Authentication strategy chosen

### Database

- [x] Schema designed and normalized
- [x] Migrations created
- [x] Indexes optimized

### Security

- [x] JWT authentication setup
- [x] Rate limiting configured
- [x] Input validation rules
- [x] Security headers added
- [x] SQL injection prevention

### Testing

- [x] Test structure created
- [x] Unit test examples
- [x] Integration test setup
- [x] Coverage reporting

### Documentation

- [x] README with quick start
- [x] API documentation
- [x] Architecture explanation
- [x] Environment variables documented

### Git & CI/CD

- [x] Git repository initialized
- [x] .gitignore configured
- [x] GitHub Actions CI pipeline
- [x] Pre-commit hooks

### Ready to Code! 🚀
```

---

## Pro Tips for New Projects

### 1. Start with Architecture

Don't jump into coding. Let Architecture Analyzer design your structure first.

### 2. Design API Before Implementation

Use API Designer to create OpenAPI spec. Generate client code from it.

### 3. Security from Day One

Run Security Scanner on your initial setup to catch issues early.

### 4. Test Infrastructure First

Create test setup before writing features. Easier to maintain coverage.

### 5. Document as You Go

Use Doc Generator after each feature. Don't leave it for the end.

---

**Next:** [Code Review Workflow](./pre-pr-review.md) | [Security Audit](./security-audit.md)
