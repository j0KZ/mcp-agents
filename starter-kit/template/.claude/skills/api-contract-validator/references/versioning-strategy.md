# API Versioning Strategy

Guidelines for versioning APIs to maintain backward compatibility while enabling evolution.

## Versioning Methods

### 1. URL Path Versioning (Recommended)

```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

**Pros:**
- Explicit and visible
- Easy to route and cache
- Clear documentation

**Cons:**
- URL changes between versions
- Can lead to version sprawl

### 2. Header Versioning

```http
GET /users HTTP/1.1
Host: api.example.com
Accept: application/vnd.example.v1+json
```

**Pros:**
- Clean URLs
- Content negotiation aligned

**Cons:**
- Less discoverable
- Harder to test in browser

### 3. Query Parameter Versioning

```
https://api.example.com/users?version=1
```

**Pros:**
- Easy to implement
- Optional versioning

**Cons:**
- Can be cached incorrectly
- Not RESTful purist approved

## Breaking vs Non-Breaking Changes

### Breaking Changes (Require New Version)

```yaml
# BREAKING: Removing a field
# v1
User:
  properties:
    legacyId: string  # Removing this is breaking

# BREAKING: Changing field type
# v1
User:
  properties:
    age: string  # Was string
# v2
User:
  properties:
    age: integer  # Now integer - breaking!

# BREAKING: Making optional field required
# v1
User:
  properties:
    middleName: string  # Optional
# v2
User:
  required: [middleName]  # Now required - breaking!

# BREAKING: Renaming fields
# v1: userName -> v2: username
```

### Non-Breaking Changes (Safe)

```yaml
# SAFE: Adding optional fields
User:
  properties:
    existingField: string
    newOptionalField: string  # Safe to add

# SAFE: Adding new endpoints
paths:
  /users:
    get: # existing
  /users/search:  # New endpoint - safe
    post:

# SAFE: Adding optional query parameters
parameters:
  - name: existingParam
    required: true
  - name: newParam  # New optional param - safe
    required: false

# SAFE: Widening response types (adding enum values)
status:
  enum: [active, inactive, pending]  # Adding 'pending' is safe
```

## Version Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Version Lifecycle                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Alpha ──► Beta ──► GA ──► Deprecated ──► Sunset            │
│    │        │       │          │            │                │
│  Testing  Limited  Full    6 months    Removed              │
│           Access   Support  notice                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Deprecation Process

```yaml
# 1. Mark deprecated in spec
paths:
  /users/legacy:
    get:
      deprecated: true
      description: |
        **DEPRECATED**: Use /users instead.
        Will be removed on 2025-06-01.

# 2. Add deprecation headers
responses:
  200:
    headers:
      Deprecation:
        schema:
          type: string
        example: "Sun, 01 Jun 2025 00:00:00 GMT"
      Sunset:
        schema:
          type: string
        example: "Sun, 01 Dec 2025 00:00:00 GMT"
      Link:
        schema:
          type: string
        example: '</v2/users>; rel="successor-version"'
```

## Breaking Change Detection

### Using oasdiff

```bash
# Install
npm install -g oasdiff

# Check for breaking changes
oasdiff breaking api-v1.yaml api-v2.yaml

# Output format options
oasdiff breaking api-v1.yaml api-v2.yaml --format json
oasdiff breaking api-v1.yaml api-v2.yaml --format markdown
```

### Common Breaking Changes Detected

```
❌ DELETE /users/{id} - Endpoint removed
❌ GET /users - Response property 'legacyId' removed
❌ POST /users - Request property 'email' became required
❌ GET /users/{id} - Response property 'age' type changed: string → integer
❌ GET /users - Query parameter 'filter' became required
```

## Migration Strategies

### 1. Parallel Versions

Run both versions simultaneously during transition.

```javascript
// Router configuration
app.use('/v1', v1Router);
app.use('/v2', v2Router);

// Shared business logic
const userService = require('./services/user');

// V1 controller
app.get('/v1/users/:id', async (req, res) => {
  const user = await userService.getUser(req.params.id);
  res.json(transformToV1(user));
});

// V2 controller
app.get('/v2/users/:id', async (req, res) => {
  const user = await userService.getUser(req.params.id);
  res.json(transformToV2(user));
});
```

### 2. Feature Flags

Gradual rollout within same version.

```javascript
app.get('/users/:id', async (req, res) => {
  const user = await userService.getUser(req.params.id);

  if (featureFlags.isEnabled('new-user-response', req.user)) {
    res.json(newFormat(user));
  } else {
    res.json(legacyFormat(user));
  }
});
```

### 3. Content Negotiation

```javascript
app.get('/users/:id', async (req, res) => {
  const user = await userService.getUser(req.params.id);
  const accept = req.headers.accept;

  if (accept.includes('vnd.example.v2')) {
    res.json(v2Format(user));
  } else {
    res.json(v1Format(user));
  }
});
```

## CI/CD Integration

```yaml
# GitHub Actions workflow
name: API Version Check

on:
  pull_request:
    paths:
      - 'api/**'

jobs:
  breaking-change-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get base branch spec
        run: git show origin/${{ github.base_ref }}:api/openapi.yaml > base-spec.yaml

      - name: Check breaking changes
        run: |
          npx oasdiff breaking base-spec.yaml api/openapi.yaml --fail-on-diff

      - name: Comment on PR if breaking
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Breaking API changes detected! Please review.'
            })
```

## Best Practices

1. **Version early**: Start with /v1 even for first release
2. **Document changes**: Maintain CHANGELOG for API versions
3. **Communicate**: Give consumers ample notice of deprecations
4. **Monitor usage**: Track which versions are still in use
5. **Test migrations**: Verify upgrade paths work correctly

## Related Resources

- [OpenAPI Best Practices](openapi-best-practices.md)
- [Contract Testing Guide](contract-testing-guide.md)
- [Semantic Versioning](https://semver.org/)
