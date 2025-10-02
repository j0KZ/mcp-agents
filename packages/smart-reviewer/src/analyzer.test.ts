import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { CodeAnalyzer } from './analyzer.js';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

describe('Smart Reviewer', () => {
  const analyzer = new CodeAnalyzer();
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
    const result = await analyzer.analyzeFile(testFile);
    expect(result.issues).toBeDefined();
    expect(Array.isArray(result.issues)).toBe(true);
  });

  it('should have score', async () => {
    const result = await analyzer.analyzeFile(testFile);
    expect(result.overallScore).toBeDefined();
    expect(typeof result.overallScore).toBe('number');
  });
});
