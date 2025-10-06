# API Designer Examples

This example demonstrates how to design REST APIs, generate OpenAPI specs, and create API clients.

## Example 1: Design REST API from Requirements

**Requirements File**: `user-api-requirements.txt`

### Using with Claude Code

```
Design a REST API based on examples/api-designer/user-api-requirements.txt
```

### Expected Output

The API Designer will generate:

**Endpoints**:

```
POST   /api/v1/users          - Create a new user
GET    /api/v1/users          - List all users (paginated)
GET    /api/v1/users/:id      - Get user by ID
PUT    /api/v1/users/:id      - Update user
DELETE /api/v1/users/:id      - Delete user
GET    /api/v1/users/search   - Search users
```

**Request/Response Examples**:

```json
POST /api/v1/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}

Response (201 Created):
{
  "id": "uuid-123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "createdAt": "2025-10-03T00:00:00Z"
}
```

## Example 2: Generate OpenAPI 3.0 Spec

```
Generate OpenAPI specification for the User Management API with:
- API name: User Management API
- Version: 1.0.0
- Base URL: https://api.example.com/v1
- Authentication: JWT Bearer token
- Resources: users
```

### Expected Output

```yaml
openapi: 3.0.0
info:
  title: User Management API
  version: 1.0.0
  description: API for managing users
servers:
  - url: https://api.example.com/v1
security:
  - bearerAuth: []
paths:
  /users:
    get:
      summary: List all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: role
          in: query
          schema:
            type: string
      responses:
        200:
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
    post:
      summary: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        201:
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
          format: email
        role:
          type: string
          enum: [admin, user, guest]
        createdAt:
          type: string
          format: date-time
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## Example 3: Generate API Client

```
Generate a TypeScript API client for the User Management API using axios
```

### Expected Output

```typescript
import axios, { AxiosInstance } from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
}

export class UserManagementClient {
  private client: AxiosInstance;

  constructor(baseURL: string, token?: string) {
    this.client = axios.create({
      baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await this.client.post('/users', data);
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  }

  async listUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
  }): Promise<{ data: User[]; pagination: any }> {
    const response = await this.client.get('/users', { params });
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await this.client.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }
}
```

## Example 4: GraphQL Schema

```
Create a GraphQL schema for user management with queries, mutations, and subscriptions
```

## MCP Tool Reference

### Design REST Endpoints

```json
{
  "tool": "design_rest_api",
  "arguments": {
    "resources": ["users"],
    "config": {
      "name": "User Management API",
      "version": "1.0.0",
      "style": "REST"
    }
  }
}
```

### Generate OpenAPI Spec

```json
{
  "tool": "generate_openapi",
  "arguments": {
    "config": {
      "name": "User Management API",
      "version": "1.0.0",
      "baseUrl": "https://api.example.com/v1",
      "auth": {
        "type": "bearer"
      },
      "resources": ["users"]
    }
  }
}
```

### Generate Client

```json
{
  "tool": "generate_client",
  "arguments": {
    "spec": {
      /* OpenAPI spec */
    },
    "options": {
      "language": "typescript",
      "outputFormat": "axios"
    }
  }
}
```

## Tips

- **RESTful Design**: Follows REST best practices (proper HTTP methods, status codes, resource naming)
- **Validation**: Automatically adds validation rules based on common patterns
- **Pagination**: Includes cursor and offset pagination patterns
- **Security**: Integrates authentication and rate limiting
- **Versioning**: Supports URL, header, and query parameter versioning
