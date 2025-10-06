import { describe, it, expect } from 'vitest';
import { removeUnusedImportsFromCode, escapeRegExp } from './import-helpers.js';

describe('Import Helpers', () => {
  describe('removeUnusedImportsFromCode', () => {
    it('should remove completely unused imports', () => {
      const code = `import { foo, bar } from 'module';
const x = 1;
const y = 2;`;

      const result = removeUnusedImportsFromCode(code);

      expect(result.removed).toEqual(['foo', 'bar']);
      expect(result.code).not.toContain('import');
    });

    it('should keep used imports', () => {
      const code = `import { foo, bar } from 'module';
const x = foo();
const y = bar();`;

      const result = removeUnusedImportsFromCode(code);

      expect(result.removed).toEqual([]);
      expect(result.code).toContain('import { foo, bar }');
    });

    it('should remove only unused imports from mixed usage', () => {
      const code = `import { used, unused, alsoUnused } from 'module';
const result = used();`;

      const result = removeUnusedImportsFromCode(code);

      expect(result.removed).toContain('unused');
      expect(result.removed).toContain('alsoUnused');
      expect(result.removed).not.toContain('used');
      expect(result.code).toContain('import');
    });

    it('should handle multiple import statements', () => {
      const code = `import { a, b } from 'module1';
import { c, d } from 'module2';
const x = a() + c();`;

      const result = removeUnusedImportsFromCode(code);

      expect(result.removed).toContain('b');
      expect(result.removed).toContain('d');
      expect(result.removed).not.toContain('a');
      expect(result.removed).not.toContain('c');
    });

    it('should skip lines that are too long', () => {
      const veryLongLine = 'import { ' + 'x'.repeat(2000) + ' } from "module";';
      const code = `${veryLongLine}
import { used } from 'other';
const y = used();`;

      const result = removeUnusedImportsFromCode(code);

      // Long line should be preserved (not processed)
      expect(result.code).toContain(veryLongLine);
    });

    it('should handle imports with no usage in code', () => {
      const code = `import { Service } from './service';
// Some other comment`;

      const result = removeUnusedImportsFromCode(code);

      expect(result.removed).toEqual(['Service']);
      expect(result.code).toBe('// Some other comment');
    });

    it('should handle word boundaries correctly', () => {
      const code = `import { xyz } from 'module';
const xyzabc = 1; // Contains substring but not exact word`;

      const result = removeUnusedImportsFromCode(code);

      expect(result.removed).toEqual(['xyz']);
      expect(result.code).toBe('const xyzabc = 1; // Contains substring but not exact word');
    });

    it('should preserve imports used in comments when testing', () => {
      const code = `import { config } from 'config';
// Using config here
const settings = config.get();`;

      const result = removeUnusedImportsFromCode(code);

      expect(result.removed).toEqual([]);
      expect(result.code).toContain('import { config }');
    });

    it('should handle empty import list after filtering', () => {
      const code = `import { a, b, c } from 'module';
const x = 1;`;

      const result = removeUnusedImportsFromCode(code);

      expect(result.removed).toEqual(['a', 'b', 'c']);
      expect(result.code.trim()).toBe('const x = 1;');
    });

    it('should handle partially used imports and update import statement', () => {
      const code = `import { keep, remove1, remove2 } from 'lib';
const value = keep();`;

      const result = removeUnusedImportsFromCode(code);

      expect(result.removed).toContain('remove1');
      expect(result.removed).toContain('remove2');
      expect(result.removed.length).toBe(2);
      // Original import line should still be there (code preserves it)
      expect(result.code).toContain('import');
    });

    it('should handle imports with special characters in names', () => {
      const code = `import { _store, _helper } from 'utils';
const data = _store.get();
const result = _helper();`;

      const result = removeUnusedImportsFromCode(code);

      expect(result.removed).toEqual([]);
      expect(result.code).toContain('_store');
      expect(result.code).toContain('_helper');
    });

    it('should handle code with no imports', () => {
      const code = `const x = 1;
const y = 2;`;

      const result = removeUnusedImportsFromCode(code);

      expect(result.removed).toEqual([]);
      expect(result.code).toBe(code);
    });
  });

  describe('escapeRegExp', () => {
    it('should escape special regex characters', () => {
      expect(escapeRegExp('test.name')).toBe('test\\.name');
      expect(escapeRegExp('test*')).toBe('test\\*');
      expect(escapeRegExp('test+')).toBe('test\\+');
      expect(escapeRegExp('test?')).toBe('test\\?');
    });

    it('should escape brackets and parentheses', () => {
      expect(escapeRegExp('test[0]')).toBe('test\\[0\\]');
      expect(escapeRegExp('test()')).toBe('test\\(\\)');
      expect(escapeRegExp('test{}')).toBe('test\\{\\}');
    });

    it('should escape anchors and pipes', () => {
      expect(escapeRegExp('^test$')).toBe('\\^test\\$');
      expect(escapeRegExp('a|b')).toBe('a\\|b');
    });

    it('should escape backslashes', () => {
      expect(escapeRegExp('test\\escape')).toBe('test\\\\escape');
    });

    it('should handle strings with multiple special characters', () => {
      const input = '.*+?^${}()|[]\\';
      const expected = '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\';
      expect(escapeRegExp(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      expect(escapeRegExp('')).toBe('');
    });

    it('should handle string with no special characters', () => {
      expect(escapeRegExp('simpleTest')).toBe('simpleTest');
    });

    it('should escape dollar sign used in identifiers', () => {
      expect(escapeRegExp('$variable')).toBe('\\$variable');
    });
  });

  describe('Integration', () => {
    it('should correctly use escapeRegExp in import detection', () => {
      const code = `import { test$var } from 'module';
const x = test$var();`;

      const result = removeUnusedImportsFromCode(code);

      // Should correctly detect usage despite special character
      expect(result.removed).toEqual([]);
    });

    it('should handle complex real-world scenario', () => {
      const code = `import { useState, useEffect, useMemo } from 'react';
import { Button, Input } from 'components';
import { formatDate } from 'utils';

function Component() {
  const [state, setState] = useState(0);
  return <Button>Click</Button>;
}`;

      const result = removeUnusedImportsFromCode(code);

      // useEffect, useMemo, Input, formatDate are unused
      expect(result.removed).toContain('useEffect');
      expect(result.removed).toContain('useMemo');
      expect(result.removed).toContain('Input');
      expect(result.removed).toContain('formatDate');

      // useState and Button are used
      expect(result.removed).not.toContain('useState');
      expect(result.removed).not.toContain('Button');
    });
  });
});
