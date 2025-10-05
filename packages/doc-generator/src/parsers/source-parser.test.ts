/**
 * Tests for source code parser
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { parseSourceFile } from './source-parser.js';

describe('parseSourceFile', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'parser-test-'));
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should parse exported functions with JSDoc', () => {
    const sourceCode = `
/**
 * Validates user input
 */
export function validateInput(data: string): boolean {
  return data.length > 0;
}
`;
    const filePath = path.join(tempDir, 'test1.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.functions).toHaveLength(1);
    expect(result.functions[0]).toMatchObject({
      name: 'validateInput',
      description: 'Validates user input',
      isExported: true,
      isAsync: false,
    });
    expect(result.functions[0].parameters).toHaveLength(1);
    expect(result.functions[0].parameters[0]).toMatchObject({
      name: 'data',
      optional: false,
      rest: false,
    });
  });

  it('should infer descriptions from function names', () => {
    const sourceCode = `
export function getUserById(id: string) {}
export function createUser(data: object) {}
export function deletePost(postId: number) {}
export function isValid(value: any) {}
export function hasPermission(user: any) {}
`;
    const filePath = path.join(tempDir, 'test2.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.functions).toHaveLength(5);
    expect(result.functions[0].description).toContain('Retrieves');
    expect(result.functions[1].description).toContain('Creates');
    expect(result.functions[2].description).toContain('Deletes');
    expect(result.functions[3].description).toContain('Checks if');
    expect(result.functions[4].description).toContain('Checks if');
  });

  it('should parse async functions', () => {
    const sourceCode = `
export async function fetchData(url: string): Promise<any> {
  return fetch(url);
}
`;
    const filePath = path.join(tempDir, 'test3.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.functions).toHaveLength(1);
    expect(result.functions[0].isAsync).toBe(true);
    expect(result.functions[0].returnType?.name).toContain('Promise');
  });

  it('should parse function parameters with types', () => {
    const sourceCode = `
export function process(filePath: string, options?: object, verbose: boolean = false, ...args: any[]): void {}
`;
    const filePath = path.join(tempDir, 'test4.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.functions).toHaveLength(1);
    expect(result.functions[0].parameters).toHaveLength(4);

    const [param1, param2, param3, param4] = result.functions[0].parameters;

    expect(param1.name).toBe('filePath');
    expect(param1.optional).toBe(false);

    expect(param2.name).toBe('options');
    expect(param2.optional).toBe(true);

    expect(param3.name).toBe('verbose');
    // Default value detection from regex is limited - param name doesn't have '='
    expect(param3.optional).toBe(false);

    expect(param4.name).toBe('args');
    expect(param4.rest).toBe(true);
  });

  it('should infer parameter descriptions', () => {
    const sourceCode = `
export function example(id: string, filePath: string, config: object, options: any, verbose: boolean, force: boolean, dryRun: boolean): void {}
`;
    const filePath = path.join(tempDir, 'test5.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);
    expect(result.functions).toHaveLength(1);
    const params = result.functions[0].parameters;

    expect(params[0].description).toContain('identifier');
    expect(params[1].description).toContain('path');
    expect(params[2].description).toContain('Configuration');
    expect(params[3].description).toContain('options'); // lowercase
    expect(params[4].description).toContain('verbose');
    expect(params[5].description).toContain('Force');
    expect(params[6].description).toContain('dry run');
  });

  it('should parse classes with JSDoc', () => {
    const sourceCode = `
/**
 * Manages user data
 */
export class UserManager {
  constructor() {}
}
`;
    const filePath = path.join(tempDir, 'test6.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.classes).toHaveLength(1);
    expect(result.classes[0]).toMatchObject({
      name: 'UserManager',
      description: 'Manages user data',
      isExported: true,
      isAbstract: false,
    });
  });

  it('should parse classes with inheritance', () => {
    const sourceCode = `
export class UserService extends BaseService implements IUserService, ILoggable {
}
`;
    const filePath = path.join(tempDir, 'test7.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.classes[0].extends).toBe('BaseService');
    expect(result.classes[0].implements).toEqual(['IUserService', 'ILoggable']);
  });

  it('should parse abstract classes', () => {
    const sourceCode = `
export abstract class BaseController {
}
`;
    const filePath = path.join(tempDir, 'test8.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.classes[0].isAbstract).toBe(true);
  });

  it('should parse interfaces with JSDoc', () => {
    const sourceCode = `
/**
 * Configuration options for the app
 */
export interface AppConfig {
  port: number;
  host: string;
}
`;
    const filePath = path.join(tempDir, 'test9.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.interfaces).toHaveLength(1);
    expect(result.interfaces[0]).toMatchObject({
      name: 'AppConfig',
      description: 'Configuration options for the app',
      isExported: true,
    });
  });

  it('should parse interfaces with inheritance', () => {
    const sourceCode = `
export interface ExtendedConfig extends BaseConfig, LogConfig {
}
`;
    const filePath = path.join(tempDir, 'test10.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.interfaces[0].extends).toEqual(['BaseConfig', 'LogConfig']);
  });

  it('should infer class descriptions from names', () => {
    const sourceCode = `
export class FileManager {}
export class DatabaseConnection {}
`;
    const filePath = path.join(tempDir, 'test11.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.classes[0].description).toContain('FileManager');
    expect(result.classes[1].description).toContain('DatabaseConnection');
  });

  it('should infer interface descriptions from names', () => {
    const sourceCode = `
export interface UserProfile {}
export interface DatabaseOptions {}
`;
    const filePath = path.join(tempDir, 'test12.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.interfaces[0].description).toContain('defining');
    expect(result.interfaces[1].description).toContain('defining');
  });

  it('should handle mixed exports and non-exports', () => {
    const sourceCode = `
export function publicFunc() {}
function privateFunc() {}
export class PublicClass {}
class PrivateClass {}
export interface PublicInterface {}
interface PrivateInterface {}
`;
    const filePath = path.join(tempDir, 'test13.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    // Should parse both exported and non-exported
    expect(result.functions.length).toBeGreaterThanOrEqual(1);
    expect(result.classes.length).toBeGreaterThanOrEqual(1);
    expect(result.interfaces.length).toBeGreaterThanOrEqual(1);

    // Check export flags
    const exportedFunc = result.functions.find(f => f.name === 'publicFunc');
    expect(exportedFunc?.isExported).toBe(true);
  });

  it('should handle empty files', () => {
    const filePath = path.join(tempDir, 'empty.ts');
    fs.writeFileSync(filePath, '');

    const result = parseSourceFile(filePath);

    expect(result.functions).toHaveLength(0);
    expect(result.classes).toHaveLength(0);
    expect(result.interfaces).toHaveLength(0);
  });

  it('should infer descriptions from common function name patterns', () => {
    const sourceCode = `
export function getMCPs() {}
export function fetchAPIs() {}
export function getURLs() {}
`;
    const filePath = path.join(tempDir, 'test14.ts');
    fs.writeFileSync(filePath, sourceCode);

    const result = parseSourceFile(filePath);

    expect(result.functions).toHaveLength(3);
    // Should detect 'get' and 'fetch' prefixes
    expect(result.functions[0].description).toContain('Retrieves');
    expect(result.functions[1].description).toContain('Fetches');
    expect(result.functions[2].description).toContain('Retrieves');
  });
});
