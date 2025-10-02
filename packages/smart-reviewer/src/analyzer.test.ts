import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { reviewFile } from './analyzer.js';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

describe('Smart Reviewer', () => {
  const testFile = path.join(tmpdir(), 'test-review-' + Date.now() + '.ts');

  beforeAll(() => {
    fs.writeFileSync(testFile, `
      function test() {
        var x = 1;
        console.log(x);
      }
    `);
  });

  afterAll(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  it('should review file', async () => {
    const result = await reviewFile(testFile, {});
    expect(result.issues).toBeDefined();
    expect(Array.isArray(result.issues)).toBe(true);
  });

  it('should calculate metrics', async () => {
    const result = await reviewFile(testFile, { includeMetrics: true });
    expect(result.metrics).toBeDefined();
  });
});
