---
name: api-contract-validator
description: "Validate API contracts and ensure compatibility. Use when checking OpenAPI specs, running contract tests, detecting breaking changes, or generating types from API specifications."
---

# API Contract Validator

> Ensure API compatibility and prevent breaking changes through contract testing

## Quick Commands

```bash
# Validate OpenAPI spec
npx @apidevtools/swagger-cli validate api-spec.yml

# Run contract tests
npm run test:contracts

# Check breaking changes
npx oasdiff breaking api-v1.yml api-v2.yml

# Generate types from spec
npx openapi-typescript api-spec.yml --output types.ts
```

## Core Functionality

### Key Features

1. **Schema Validation**: OpenAPI/Swagger spec validation
2. **Contract Testing**: Consumer-driven contracts
3. **Breaking Change Detection**: API compatibility checking
4. **Mock Generation**: Generate mocks from contracts
5. **Type Safety**: TypeScript types from API specs

## Detailed Information

For comprehensive details, see:

```bash
cat .claude/skills/api-contract-validator/references/contract-testing-guide.md
```

```bash
cat .claude/skills/api-contract-validator/references/openapi-best-practices.md
```

```bash
cat .claude/skills/api-contract-validator/references/versioning-strategy.md
```

## Usage Examples

### Example 1: Validate API Response

```javascript
import { APIContractValidator } from '@j0kz/api-contract-validator';

const validator = new APIContractValidator('./api-spec.yml');

// Validate response against contract
const response = await fetch('/api/users/123');
const validation = await validator.validateResponse(
  'GET',
  '/users/{id}',
  response
);

if (!validation.valid) {
  console.error('Contract violation:', validation.errors);
}
```

### Example 2: Consumer-Driven Contracts

```javascript
// Consumer defines expectations
const contract = {
  consumer: 'mobile-app',
  provider: 'user-service',
  interactions: [{
    description: 'get user by id',
    request: {
      method: 'GET',
      path: '/users/123'
    },
    response: {
      status: 200,
      body: {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      }
    }
  }]
};

await validator.verifyContract(contract);
```

## Contract Testing Patterns

### Pact Testing
```javascript
const { Pact } = require('@pact-foundation/pact');

const provider = new Pact({
  consumer: 'MyConsumer',
  provider: 'MyProvider'
});

// Define interactions
await provider.addInteraction({
  state: 'user exists',
  uponReceiving: 'a request for user',
  withRequest: {
    method: 'GET',
    path: '/users/1'
  },
  willRespondWith: {
    status: 200,
    body: expectedUser
  }
});
```

## Configuration

```json
{
  "api-contract-validator": {
    "specFile": "./api/openapi.yml",
    "strict": true,
    "allowAdditionalProperties": false,
    "contracts": {
      "directory": "./contracts",
      "publish": true,
      "broker": "https://pact-broker.example.com"
    },
    "breaking": {
      "allowRemoval": false,
      "allowTypeChange": false,
      "allowRequired": false
    }
  }
}
```

## CI/CD Integration

```yaml
# GitHub Actions
- name: Validate API Contract
  run: |
    npx @j0kz/api-contract-validator validate
    npx @j0kz/api-contract-validator check-breaking

- name: Publish Contracts
  run: npx @j0kz/api-contract-validator publish
```

## Notes

- Supports OpenAPI 3.0, Swagger 2.0, and AsyncAPI
- Integrates with Pact for consumer-driven contracts
- Can generate API documentation automatically
- Supports GraphQL schema validation