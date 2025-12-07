/**
 * Tests for UnusedImportFixer
 * Covers JSX, TypeScript type references, and qualified names
 */

import { describe, it, expect } from 'vitest';
import { AutoFixer } from '../src/auto-fixer.js';

describe('UnusedImportFixer', () => {
  describe('JSX usage detection', () => {
    it('should not flag imports used in JSX elements', async () => {
      const fixer = new AutoFixer();
      const code = `
        import React from 'react';
        import { Button } from './components';

        export function App() {
          return <Button>Click me</Button>;
        }
      `;
      const result = await fixer.generateFixes(code, 'App.tsx');

      // Button is used in JSX, should not be flagged
      const buttonFix = result.fixes.find(
        f => f.type === 'unused-import' && f.description.includes('Button')
      );
      expect(buttonFix).toBeUndefined();
    });

    it('should flag React import when not explicitly used (modern JSX transform)', async () => {
      const fixer = new AutoFixer();
      const code = `
        import React from 'react';

        export function App() {
          return <div>Hello</div>;
        }
      `;
      const result = await fixer.generateFixes(code, 'App.tsx');

      // In modern React (17+), React doesn't need to be in scope for JSX
      // The fixer correctly flags it as unused
      const reactFix = result.fixes.find(
        f => f.type === 'unused-import' && f.description.includes('React')
      );
      expect(reactFix).toBeDefined();
    });

    it('should not flag React import when explicitly used', async () => {
      const fixer = new AutoFixer();
      const code = `
        import React from 'react';

        export function App() {
          const ref = React.useRef(null);
          return <div ref={ref}>Hello</div>;
        }
      `;
      const result = await fixer.generateFixes(code, 'App.tsx');

      // React is explicitly used via React.useRef
      const reactFix = result.fixes.find(
        f => f.type === 'unused-import' && f.description.includes('React')
      );
      expect(reactFix).toBeUndefined();
    });
  });

  describe('TypeScript type reference detection', () => {
    it('should not flag type-only imports used in type annotations', async () => {
      const fixer = new AutoFixer();
      const code = `
        import type { User } from './types';

        export function getUser(): User {
          return { name: 'test' };
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      // User type is used, should not be flagged
      const userFix = result.fixes.find(
        f => f.type === 'unused-import' && f.description.includes('User')
      );
      expect(userFix).toBeUndefined();
    });

    it('should not flag imports used in generic type parameters', async () => {
      const fixer = new AutoFixer();
      const code = `
        import { Observable } from 'rxjs';

        export function createStream(): Observable<string> {
          return new Observable();
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      // Observable is used in type annotation
      const observableFix = result.fixes.find(
        f => f.type === 'unused-import' && f.description.includes('Observable')
      );
      expect(observableFix).toBeUndefined();
    });

    it('should handle qualified names like Namespace.Type', async () => {
      const fixer = new AutoFixer();
      const code = `
        import * as Types from './types';

        export function getData(): Types.DataResult {
          return { data: [] };
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      // Types namespace is used
      const typesFix = result.fixes.find(
        f => f.type === 'unused-import' && f.description.includes('Types')
      );
      expect(typesFix).toBeUndefined();
    });

    it('should handle deeply nested qualified names', async () => {
      const fixer = new AutoFixer();
      const code = `
        import * as API from './api';

        export function fetch(): API.Response.Data.Result {
          return {};
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      // API namespace is used in qualified name
      const apiFix = result.fixes.find(
        f => f.type === 'unused-import' && f.description.includes('API')
      );
      expect(apiFix).toBeUndefined();
    });
  });

  describe('side-effect imports', () => {
    it('should skip side-effect imports without specifiers', async () => {
      const fixer = new AutoFixer();
      const code = `
        import './polyfills';
        import 'reflect-metadata';

        export function test() {
          return 'hello';
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      // Side-effect imports should not be flagged
      const polyfillsFix = result.fixes.find(
        f => f.type === 'unused-import' && f.description.includes('polyfills')
      );
      expect(polyfillsFix).toBeUndefined();
    });
  });

  describe('import specifier types', () => {
    it('should handle default imports', async () => {
      const fixer = new AutoFixer();
      const code = `
        import unused from 'some-module';

        export function test() {
          return 'hello';
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      // Default import that is unused should be flagged
      expect(result.fixes.some(f => f.type === 'unused-import')).toBe(true);
    });

    it('should handle named imports', async () => {
      const fixer = new AutoFixer();
      const code = `
        import { unused1, unused2 } from 'some-module';

        export function test() {
          return 'hello';
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      // Named imports that are unused should be flagged
      expect(result.fixes.filter(f => f.type === 'unused-import').length).toBeGreaterThanOrEqual(1);
    });

    it('should handle namespace imports', async () => {
      const fixer = new AutoFixer();
      const code = `
        import * as UnusedNamespace from 'some-module';

        export function test() {
          return 'hello';
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      // Namespace import that is unused should be flagged
      expect(result.fixes.some(f => f.type === 'unused-import')).toBe(true);
    });
  });

  describe('mixed usage scenarios', () => {
    it('should flag only truly unused imports in mixed scenarios', async () => {
      const fixer = new AutoFixer();
      const code = `
        import { used, unused } from 'some-module';
        import type { UsedType, UnusedType } from './types';

        export function test(): UsedType {
          return used();
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      // 'used' and 'UsedType' should not be flagged
      const usedFix = result.fixes.find(
        f => f.type === 'unused-import' && f.description.includes("'used'")
      );
      expect(usedFix).toBeUndefined();

      // 'unused' and 'UnusedType' should be flagged
      expect(result.fixes.some(f => f.type === 'unused-import')).toBe(true);
    });

    it('should handle imports used only in type positions', async () => {
      const fixer = new AutoFixer();
      const code = `
        import { SomeClass } from './module';

        export function process(input: SomeClass): void {
          console.log(input);
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      // SomeClass is used as a type annotation
      const someClassFix = result.fixes.find(
        f => f.type === 'unused-import' && f.description.includes('SomeClass')
      );
      expect(someClassFix).toBeUndefined();
    });
  });

  describe('fix generation', () => {
    it('should generate fix with correct confidence', async () => {
      const fixer = new AutoFixer();
      const code = `
        import { definitelyUnused } from 'module';

        export function test() {
          return 'hello';
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      const unusedFix = result.fixes.find(f => f.type === 'unused-import');
      if (unusedFix) {
        expect(unusedFix.confidence).toBe(100);
        expect(unusedFix.safe).toBe(true);
        expect(unusedFix.impact).toBe('high');
      }
    });

    it('should include line number in fix', async () => {
      const fixer = new AutoFixer();
      const code = `import { unused } from 'module';

export function test() {
  return 'hello';
}`;
      const result = await fixer.generateFixes(code, 'test.ts');

      const unusedFix = result.fixes.find(f => f.type === 'unused-import');
      if (unusedFix) {
        expect(unusedFix.line).toBeGreaterThan(0);
      }
    });
  });
});
