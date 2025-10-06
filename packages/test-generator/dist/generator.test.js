import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestGenerator } from './generator.js';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';
describe('Test Generator', () => {
    const generator = new TestGenerator();
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
        const result = await generator.generateTests(testFile, {
            framework: 'vitest',
            includeEdgeCases: true,
        });
        expect(result.fullTestCode).toBeDefined();
        expect(result.fullTestCode).toContain('describe');
    });
});
//# sourceMappingURL=generator.test.js.map