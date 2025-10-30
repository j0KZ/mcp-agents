import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutoFixer } from '../src/auto-fixer.js';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

vi.mock('fs/promises');
vi.mock('child_process');

describe('AutoFixer', () => {
  let fixer: AutoFixer;

  beforeEach(() => {
    fixer = new AutoFixer();
    vi.clearAllMocks();
  });

  describe('autoFix', () => {
    it('should remove console.log statements', async () => {
      const originalContent = `
        console.log('debug');
        const result = calculate();
        console.debug('test');
        return result;
      `;

      const expectedContent = `
        const result = calculate();
        return result;
      `;

      vi.mocked(fs.readFile).mockResolvedValue(originalContent);
      vi.mocked(fs.writeFile).mockResolvedValue();

      await fixer.autoFix('test.js');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'test.js',
        expect.not.stringContaining('console.log')
      );
    });

    it('should fix == to ===', async () => {
      const originalContent = `
        if (a == b) {
          return true;
        }
        if (c != d) {
          return false;
        }
      `;

      vi.mocked(fs.readFile).mockResolvedValue(originalContent);
      vi.mocked(fs.writeFile).mockResolvedValue();

      await fixer.autoFix('test.js');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'test.js',
        expect.stringContaining('===')
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        'test.js',
        expect.stringContaining('!==')
      );
    });

    it('should replace var with let', async () => {
      const originalContent = `
        var x = 1;
        var y = 2;
        const z = 3;
      `;

      vi.mocked(fs.readFile).mockResolvedValue(originalContent);
      vi.mocked(fs.writeFile).mockResolvedValue();

      await fixer.autoFix('test.js');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'test.js',
        expect.stringContaining('let x = 1')
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        'test.js',
        expect.stringContaining('let y = 2')
      );
    });

    it('should remove debugger statements', async () => {
      const originalContent = `
        function test() {
          debugger;
          return true;
        }
      `;

      vi.mocked(fs.readFile).mockResolvedValue(originalContent);
      vi.mocked(fs.writeFile).mockResolvedValue();

      await fixer.autoFix('test.js');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'test.js',
        expect.not.stringContaining('debugger')
      );
    });

    it('should fix TypeScript any types', async () => {
      const originalContent = `
        let value: any = getData();
        const items: any[] = [];
      `;

      vi.mocked(fs.readFile).mockResolvedValue(originalContent);
      vi.mocked(fs.writeFile).mockResolvedValue();

      await fixer.autoFix('test.ts');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'test.ts',
        expect.stringContaining(': unknown')
      );
    });

    it('should not modify file if no fixes needed', async () => {
      const content = `const x = 1;
const y = 2;
if (x === y) {
  return true;
}`;

      vi.mocked(fs.readFile).mockResolvedValue(content);

      await fixer.autoFix('test.js');

      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('removeConsoleLogs', () => {
    it('should remove only console statements', async () => {
      const originalContent = `
        console.log('test');
        const logger = new Logger();
        logger.log('keep this');
      `;

      vi.mocked(fs.readFile).mockResolvedValue(originalContent);
      vi.mocked(fs.writeFile).mockResolvedValue();

      await fixer.removeConsoleLogs('test.js');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'test.js',
        expect.stringContaining('logger.log')
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        'test.js',
        expect.not.stringContaining('console.log')
      );
    });
  });

  describe('addDocumentation', () => {
    it('should add JSDoc to undocumented functions', async () => {
      const originalContent = `
function calculate(a, b) {
  return a + b;
}

const multiply = (x, y) => x * y;
      `;

      vi.mocked(fs.readFile).mockResolvedValue(originalContent);
      vi.mocked(fs.writeFile).mockResolvedValue();

      await fixer.addDocumentation('test.js');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'test.js',
        expect.stringContaining('/**')
      );
    });

    it('should not add JSDoc to already documented functions', async () => {
      const content = `
/**
 * Calculate sum
 */
function calculate(a, b) {
  return a + b;
}
      `;

      vi.mocked(fs.readFile).mockResolvedValue(content);

      await fixer.addDocumentation('test.js');

      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('generateTestsFor', () => {
    it('should create basic test file', async () => {
      vi.mocked(fs.writeFile).mockResolvedValue();

      // Mock exec to simulate test-generator not available
      const execMock = vi.fn().mockRejectedValue(new Error('Command not found'));
      vi.mocked(exec).mockImplementation(((cmd: any, cb: any) => {
        execMock(cmd);
        cb(new Error('Command not found'));
      }) as any);

      await fixer.generateTestsFor('src/utils.ts');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'src/utils.test.ts',
        expect.stringContaining("import { describe, it, expect } from 'vitest'")
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        'src/utils.test.ts',
        expect.stringContaining("import { utils } from './utils'")
      );
    });
  });

  describe('verify', () => {
    it('should return true if file is clean', async () => {
      const cleanContent = `
        const x = 1;
        const y = 2;
        if (x === y) {
          return true;
        }
      `;

      vi.mocked(fs.readFile).mockResolvedValue(cleanContent);

      const result = await fixer.verify('test.js');

      expect(result).toBe(true);
    });

    it('should return false if file has issues', async () => {
      const dirtyContent = `
        console.log('debug');
        var x = 1;
        if (x == 1) {
          debugger;
        }
      `;

      vi.mocked(fs.readFile).mockResolvedValue(dirtyContent);

      const result = await fixer.verify('test.js');

      expect(result).toBe(false);
    });
  });
});