import { OpenAPISpec, GraphQLSchema, ClientGenerationOptions } from '../types.js';

/**
 * Generate TypeScript REST client
 */
export function generateTypeScriptRestClient(
  spec: OpenAPISpec,
  options: ClientGenerationOptions
): string {
  const lines: string[] = [];

  // Add imports
  if (options.outputFormat === 'axios') {
    lines.push("import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';");
  } else {
    lines.push('// Using native fetch API');
  }
  lines.push('');

  // Add types if requested
  if (options.includeTypes && spec.components?.schemas) {
    lines.push('// Type definitions');
    for (const [name, schema] of Object.entries(spec.components.schemas)) {
      lines.push(`export interface ${name} {`);
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          const required = schema.required?.includes(propName) ? '' : '?';
          const type = mapSchemaToTSType(propSchema);
          lines.push(`  ${propName}${required}: ${type};`);
        }
      }
      lines.push('}');
      lines.push('');
    }
  }

  // Add client class
  lines.push(`export class ${spec.info.title.replace(/\s+/g, '')}Client {`);
  lines.push('  private baseURL: string;');
  if (options.outputFormat === 'axios') {
    lines.push('  private client: AxiosInstance;');
  }
  lines.push('');
  lines.push('  constructor(baseURL: string, config?: any) {');
  lines.push('    this.baseURL = baseURL;');
  if (options.outputFormat === 'axios') {
    lines.push('    this.client = axios.create({ baseURL, ...config });');
  }
  lines.push('  }');
  lines.push('');

  // Add methods for each endpoint
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation === 'object' && operation.operationId) {
        lines.push(`  async ${operation.operationId}(params?: any): Promise<any> {`);
        if (options.outputFormat === 'axios') {
          lines.push(`    return this.client.${method}('${path}', params);`);
        } else {
          lines.push(`    const response = await fetch(\`\${this.baseURL}${path}\`, {`);
          lines.push(`      method: '${method.toUpperCase()}',`);
          lines.push(`      headers: { 'Content-Type': 'application/json' },`);
          lines.push(`      body: JSON.stringify(params)`);
          lines.push(`    });`);
          lines.push(`    return response.json();`);
        }
        lines.push('  }');
        lines.push('');
      }
    }
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Generate TypeScript GraphQL client
 */
export function generateTypeScriptGraphQLClient(
  _schema: GraphQLSchema,
  _options: ClientGenerationOptions
): string {
  const lines: string[] = [];

  lines.push('// GraphQL client');
  lines.push('export class GraphQLClient {');
  lines.push('  constructor(private endpoint: string) {}');
  lines.push('');
  lines.push('  async query(query: string, variables?: any): Promise<any> {');
  lines.push('    const response = await fetch(this.endpoint, {');
  lines.push("      method: 'POST',");
  lines.push("      headers: { 'Content-Type': 'application/json' },");
  lines.push('      body: JSON.stringify({ query, variables })');
  lines.push('    });');
  lines.push('    return response.json();');
  lines.push('  }');
  lines.push('}');

  return lines.join('\n');
}

/**
 * Generate Python REST client
 */
export function generatePythonRestClient(
  spec: OpenAPISpec,
  _options: ClientGenerationOptions
): string {
  const lines: string[] = [];

  lines.push('import requests');
  lines.push('from typing import Optional, Dict, Any');
  lines.push('');
  lines.push(`class ${spec.info.title.replace(/\s+/g, '')}Client:`);
  lines.push('    def __init__(self, base_url: str):');
  lines.push('        self.base_url = base_url');
  lines.push('');

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation === 'object' && operation.operationId) {
        lines.push(
          `    def ${operation.operationId}(self, params: Optional[Dict[str, Any]] = None):`
        );
        lines.push(
          `        return requests.${method}(f"{{self.base_url}}${path}", json=params).json()`
        );
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

/**
 * Map JSON Schema type to TypeScript type
 */
function mapSchemaToTSType(schema: any): string {
  if (!schema) return 'any';

  switch (schema.type) {
    case 'string':
      return schema.enum ? schema.enum.map((v: any) => `'${v}'`).join(' | ') : 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return `${mapSchemaToTSType(schema.items)}[]`;
    case 'object':
      return schema.additionalProperties ? 'Record<string, any>' : 'object';
    default:
      return schema.$ref ? schema.$ref.split('/').pop() || 'any' : 'any';
  }
}
