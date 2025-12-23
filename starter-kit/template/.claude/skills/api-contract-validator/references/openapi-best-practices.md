# OpenAPI Best Practices

Guidelines for designing and maintaining high-quality OpenAPI specifications.

## Specification Structure

### Recommended Layout

```yaml
openapi: 3.0.3
info:
  title: User Service API
  description: |
    Comprehensive user management service.

    ## Authentication
    All endpoints require Bearer token authentication.
  version: 1.0.0
  contact:
    name: API Support
    email: api@example.com

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging

tags:
  - name: users
    description: User management operations
  - name: auth
    description: Authentication operations

paths:
  # Organize by resource

components:
  # Reusable components
```

## Path Design

### RESTful Conventions

```yaml
paths:
  /users:
    get:
      summary: List all users
      operationId: listUsers
      tags: [users]
    post:
      summary: Create a new user
      operationId: createUser
      tags: [users]

  /users/{userId}:
    get:
      summary: Get user by ID
      operationId: getUserById
      tags: [users]
    put:
      summary: Update user
      operationId: updateUser
      tags: [users]
    delete:
      summary: Delete user
      operationId: deleteUser
      tags: [users]
```

### Naming Conventions

- Use lowercase with hyphens: `/user-profiles`
- Use plural nouns for collections: `/users`
- Use path parameters for identifiers: `/users/{userId}`
- Avoid verbs in paths: `/users` not `/getUsers`

## Schema Design

### Reusable Schemas

```yaml
components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
      properties:
        id:
          type: string
          format: uuid
          readOnly: true
          example: "123e4567-e89b-12d3-a456-426614174000"
        email:
          type: string
          format: email
          example: "user@example.com"
        name:
          type: string
          minLength: 1
          maxLength: 100
          example: "John Doe"
        createdAt:
          type: string
          format: date-time
          readOnly: true

    UserCreate:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password
          minLength: 8
        name:
          type: string

    UserUpdate:
      type: object
      properties:
        email:
          type: string
          format: email
        name:
          type: string
```

### Composition with allOf

```yaml
components:
  schemas:
    BaseEntity:
      type: object
      properties:
        id:
          type: string
          format: uuid
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    User:
      allOf:
        - $ref: '#/components/schemas/BaseEntity'
        - type: object
          properties:
            email:
              type: string
              format: email
```

## Response Design

### Consistent Response Structure

```yaml
components:
  schemas:
    SuccessResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          type: object

    ErrorResponse:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          required:
            - code
            - message
          properties:
            code:
              type: string
              example: "VALIDATION_ERROR"
            message:
              type: string
              example: "Invalid email format"
            details:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                  message:
                    type: string

    PaginatedResponse:
      type: object
      properties:
        data:
          type: array
          items: {}
        pagination:
          $ref: '#/components/schemas/Pagination'

    Pagination:
      type: object
      properties:
        page:
          type: integer
          minimum: 1
        limit:
          type: integer
          minimum: 1
          maximum: 100
        total:
          type: integer
        totalPages:
          type: integer
```

### Standard HTTP Status Codes

```yaml
paths:
  /users:
    post:
      responses:
        '201':
          description: User created successfully
        '400':
          description: Invalid request body
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized
        '409':
          description: Email already exists
        '422':
          description: Validation error
        '500':
          description: Internal server error
```

## Security

### Authentication Schemes

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://auth.example.com/authorize
          tokenUrl: https://auth.example.com/token
          scopes:
            read:users: Read user data
            write:users: Modify user data

security:
  - BearerAuth: []
```

## Documentation

### Rich Descriptions

```yaml
paths:
  /users/{userId}:
    get:
      summary: Get user by ID
      description: |
        Retrieves detailed information about a specific user.

        ## Permissions
        - `read:users` scope required

        ## Rate Limits
        - 100 requests per minute

        ## Notes
        - Returns 404 if user not found
        - Sensitive fields are masked for non-admin users
      parameters:
        - name: userId
          in: path
          required: true
          description: The unique identifier of the user
          schema:
            type: string
            format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
```

## Validation

### Use JSON Schema Validations

```yaml
components:
  schemas:
    UserCreate:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        password:
          type: string
          minLength: 8
          maxLength: 128
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$'
        age:
          type: integer
          minimum: 18
          maximum: 150
```

## Tooling Integration

### Validation Commands

```bash
# Validate spec
npx @apidevtools/swagger-cli validate openapi.yaml

# Bundle multiple files
npx @apidevtools/swagger-cli bundle openapi.yaml -o bundled.yaml

# Generate types
npx openapi-typescript openapi.yaml --output types.ts
```

## Related Resources

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Contract Testing Guide](contract-testing-guide.md)
- [Versioning Strategy](versioning-strategy.md)
