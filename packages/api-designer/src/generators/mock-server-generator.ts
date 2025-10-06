import { OpenAPISpec, MockServerConfig } from '../types.js';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

/**
 * Generate mock server based on OpenAPI spec
 */
export function generateMockServerCode(spec: OpenAPISpec, config: MockServerConfig): string {
  const lines: string[] = [];

  lines.push("import express from 'express';");
  lines.push("import cors from 'cors';");
  lines.push('');
  lines.push('const app = express();');
  lines.push('app.use(cors());');
  lines.push('app.use(express.json());');
  lines.push('');

  // Generate routes for each path
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation === 'object') {
        const mockResponse = generateMockResponse(operation);
        const expressPath = path.replace(/{(\w+)}/g, ':$1');

        lines.push(`app.${method}('${expressPath}', (req, res) => {`);
        if (config.responseDelay) {
          lines.push(`  setTimeout(() => {`);
          lines.push(`    res.json(${JSON.stringify(mockResponse)});`);
          lines.push(`  }, ${config.responseDelay});`);
        } else {
          lines.push(`  res.json(${JSON.stringify(mockResponse)});`);
        }
        lines.push(`});`);
        lines.push('');
      }
    }
  }

  const port = config.port || 3000;
  lines.push(`const PORT = process.env.PORT || ${port};`);
  lines.push('app.listen(PORT, () => {');
  lines.push(`  console.log(\`Mock server running on port \${PORT}\`);`);
  lines.push('});');

  return lines.join('\n');
}

/**
 * Create and start mock server
 */
export function createMockServer(spec: OpenAPISpec, config: MockServerConfig) {
  const app = express();

  if (config.includeCORS) {
    app.use(cors());
  }

  app.use(express.json());

  if (config.includeLogging) {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      // Sanitize request data to prevent log injection
      const method = String(req.method).replace(/[\r\n]/g, '');
      const safePath = String(req.path)
        .replace(/[\r\n]/g, '')
        .substring(0, 200);
      console.log(`[${new Date().toISOString()}] ${method} ${safePath}`);
      next();
    });
  }

  // Generate routes
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation === 'object') {
        const mockResponse = generateMockResponse(operation);
        const expressPath = path.replace(/{(\w+)}/g, ':$1');

        (app as any)[method](expressPath, (_req: any, res: any) => {
          if (config.responseDelay) {
            setTimeout(() => {
              res.json(mockResponse);
            }, config.responseDelay);
          } else {
            res.json(mockResponse);
          }
        });
      }
    }
  }

  const port = config.port || 3000;
  app.listen(port, () => {
    console.log(`Mock server running on port ${Number(port)}`);
  });

  return app;
}

/**
 * Generate mock response based on operation schema
 */
function generateMockResponse(operation: any): any {
  if (operation.responses?.['200']?.content?.['application/json']?.schema) {
    const schema = operation.responses['200'].content['application/json'].schema;
    return generateMockFromSchema(schema);
  }

  return { success: true, message: 'Mock response' };
}

/**
 * Generate mock data from JSON Schema
 */
function generateMockFromSchema(schema: any): any {
  if (!schema) return null;

  if (schema.$ref) {
    return { id: 1, name: 'Mock Data' };
  }

  switch (schema.type) {
    case 'object':
      const obj: any = {};
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          obj[key] = generateMockFromSchema(propSchema);
        }
      }
      return obj;

    case 'array':
      return [generateMockFromSchema(schema.items)];

    case 'string':
      return schema.enum ? schema.enum[0] : 'mock-string';

    case 'number':
    case 'integer':
      return 42;

    case 'boolean':
      return true;

    default:
      return null;
  }
}
