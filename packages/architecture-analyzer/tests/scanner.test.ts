import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import * as target from '../src/scanner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const apiDesignerPath = path.join(projectRoot, 'packages/api-designer');

describe('ProjectScanner', () => {
  it('should scan a project', async () => {
    const instance = new target.ProjectScanner();
    const result = await instance.scanProject(apiDesignerPath);
    expect(result).toBeDefined();
  });
});
