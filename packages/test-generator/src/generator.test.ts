import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateTests } from './generator.js';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

describe('Test Generator', () => {
  const testFile = path.join(tmpdir(), 'test-source-' + Date.now() + '.ts');

  beforeAll(() => {
    fs.writeFileSync(testFile, `
      export function add(a: number, b: number): number {
        return a + b;
      }
    `);
  });

  afterAll(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  it('should generate tests', async () => {
    const result = await generateTests(testFile, {
      framework: 'vitest',
      includeEdgeCases: true
    });
    expect(result.success).toBe(true);
    expect(result.tests).toContain('describe');
  });
});
