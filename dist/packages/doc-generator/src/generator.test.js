import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateJSDoc, generateReadme } from './generator.js';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';
describe('Doc Generator', () => {
    const testFile = path.join(tmpdir(), 'test-code-' + Date.now() + '.ts');
    beforeAll(() => {
        fs.writeFileSync(testFile, `
      export function testFunction(param: string): number {
        return param.length;
      }
    `);
    });
    afterAll(() => {
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
    });
    it('should generate JSDoc', async () => {
        const result = await generateJSDoc(testFile, {});
        expect(result.content).toContain('Function:');
    });
    it('should generate README', async () => {
        const result = await generateReadme(process.cwd(), {
            projectName: 'Test Project'
        });
        expect(result.content).toContain('# Test Project');
    });
});
//# sourceMappingURL=generator.test.js.map