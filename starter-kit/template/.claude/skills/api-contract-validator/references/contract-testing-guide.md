# Contract Testing Guide

Comprehensive guide for implementing contract testing in your API development workflow.

## What is Contract Testing?

Contract testing verifies that two systems (consumer and provider) can communicate correctly by validating the "contract" between them.

## Types of Contract Testing

### 1. Consumer-Driven Contracts (CDC)

The consumer defines what it expects from the provider.

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
        id: Matchers.string('123'),
        name: Matchers.string(),
        email: Matchers.email()
      }
    }
  }]
};
```

### 2. Provider Contracts

The provider publishes its contract, consumers verify against it.

```yaml
# OpenAPI spec as provider contract
openapi: 3.0.0
paths:
  /users/{id}:
    get:
      responses:
        200:
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

## Pact Framework

### Setup

```bash
npm install @pact-foundation/pact --save-dev
```

### Consumer Test

```javascript
import { Pact, Matchers } from '@pact-foundation/pact';

const provider = new Pact({
  consumer: 'Frontend',
  provider: 'UserAPI',
  port: 1234
});

describe('User API Contract', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());

  it('should return user by id', async () => {
    await provider.addInteraction({
      state: 'user 123 exists',
      uponReceiving: 'a request for user 123',
      withRequest: {
        method: 'GET',
        path: '/users/123',
        headers: { Accept: 'application/json' }
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: Matchers.string('123'),
          name: Matchers.string('John Doe'),
          email: Matchers.email()
        }
      }
    });

    const response = await userClient.getUser('123');
    expect(response.id).toBe('123');
  });
});
```

### Provider Verification

```javascript
import { Verifier } from '@pact-foundation/pact';

describe('Provider Verification', () => {
  it('validates the expectations of the consumer', async () => {
    await new Verifier({
      provider: 'UserAPI',
      providerBaseUrl: 'http://localhost:3000',
      pactUrls: ['./pacts/frontend-userapi.json'],
      stateHandlers: {
        'user 123 exists': async () => {
          await createTestUser({ id: '123', name: 'John Doe' });
        }
      }
    }).verifyProvider();
  });
});
```

## Contract Testing Workflow

```
1. Consumer writes tests → Generates contract (pact file)
2. Contract published to broker
3. Provider pulls contracts
4. Provider verifies against contracts
5. Results published to broker
6. Deployment decision based on verification
```

## Best Practices

### Do's

- Test behavior, not implementation
- Use matchers for flexible matching
- Version your contracts
- Use a Pact Broker for contract management
- Include contract tests in CI/CD

### Don'ts

- Don't test business logic in contracts
- Don't couple to specific data values
- Don't skip provider state setup
- Don't ignore contract breaking changes

## Integration with CI/CD

```yaml
# GitHub Actions
- name: Run Contract Tests
  run: npm run test:contracts

- name: Publish Contracts
  run: npx pact-broker publish ./pacts --broker-base-url=$PACT_BROKER_URL

- name: Can I Deploy?
  run: npx pact-broker can-i-deploy --pacticipant=Frontend --version=$VERSION
```

## Troubleshooting

### Common Issues

1. **Pact verification fails**: Check provider state handlers
2. **Matchers not matching**: Use appropriate matcher types
3. **Missing interactions**: Ensure all API calls are covered
4. **Stale contracts**: Set up automatic cleanup in broker

## Related Resources

- [Pact Documentation](https://docs.pact.io/)
- [Contract Testing Patterns](https://martinfowler.com/articles/consumerDrivenContracts.html)
- [OpenAPI Best Practices](openapi-best-practices.md)
