/**
 * Tests for async-converter module
 */

import { describe, it, expect } from 'vitest';
import {
  convertCallbackToAsync,
  convertPromiseChainToAsync,
  wrapInTryCatch,
} from '../src/transformations/async-converter.js';

describe('convertCallbackToAsync', () => {
  it('should return unchanged code when no callback pattern found', () => {
    const code = 'const x = 1; console.log(x);';
    const result = convertCallbackToAsync(code, true);

    expect(result.changed).toBe(false);
    expect(result.code).toBe(code);
  });

  it('should convert callback pattern to async/await with try/catch', () => {
    const code = `
      function fetchData(callback) {
        getData((err, data) => {
          if (err) throw err;
          return data;
        });
      }
    `;

    const result = convertCallbackToAsync(code, true);

    expect(result.changed).toBe(true);
    expect(result.code).toContain('async function');
    expect(result.code).toContain('await');
  });

  it('should convert callback pattern without try/catch when disabled', () => {
    const code = `
      function fetchData(callback) {
        getData((err, result) => {
          console.log(result);
        });
      }
    `;

    const result = convertCallbackToAsync(code, false);

    expect(result.changed).toBe(true);
    expect(result.code).toContain('await');
    expect(result.code).not.toContain('try {');
  });

  it('should make functions async', () => {
    const code = `
      function processData(callback) {
        api((err, response) => {
          return response;
        });
      }
    `;

    const result = convertCallbackToAsync(code, true);

    expect(result.changed).toBe(true);
    expect(result.code).toContain('async function processData');
  });

  it('should handle multiple callback patterns', () => {
    const code = `
      function multiCallbacks(callback) {
        first((err, a) => {
          second((err, b) => {
            return a + b;
          });
        });
      }
    `;

    const result = convertCallbackToAsync(code, true);

    expect(result.changed).toBe(true);
  });
});

describe('convertPromiseChainToAsync', () => {
  it('should return unchanged code when no promise pattern found', () => {
    const code = 'const x = await getData();';
    const result = convertPromiseChainToAsync(code);

    expect(result.changed).toBe(false);
    expect(result.code).toBe(code);
  });

  it('should convert .then() chain to async/await', () => {
    const code = `
      function fetchData() {
        return fetch('/api').then((response) => {
          return response.json();
        });
      }
    `;

    const result = convertPromiseChainToAsync(code);

    expect(result.changed).toBe(true);
    expect(result.code).toContain('async function');
    expect(result.code).toContain('await');
  });

  it('should handle simple then callback', () => {
    const code = `
      function getData() {
        promise.then((data) => {
          console.log(data);
        });
      }
    `;

    const result = convertPromiseChainToAsync(code);

    expect(result.changed).toBe(true);
    expect(result.code).toContain('await promise');
  });

  it('should convert multiple function declarations to async', () => {
    const code = `
      function first() {
        api.then((r) => {
          return r;
        });
      }
      function second() {
        other.then((x) => {
          return x;
        });
      }
    `;

    const result = convertPromiseChainToAsync(code);

    expect(result.changed).toBe(true);
    expect(result.code).toContain('async function first');
    expect(result.code).toContain('async function second');
  });
});

describe('wrapInTryCatch', () => {
  it('should wrap code in try/catch with default error handler', () => {
    const code = 'const result = await fetchData();';
    const result = wrapInTryCatch(code);

    expect(result).toContain('try {');
    expect(result).toContain('catch (err)');
    expect(result).toContain('throw err');
    expect(result).toContain(code);
  });

  it('should wrap code in try/catch with custom error handler', () => {
    const code = 'const result = await fetchData();';
    const customHandler = 'console.error(err);\nreturn null;';
    const result = wrapInTryCatch(code, customHandler);

    expect(result).toContain('try {');
    expect(result).toContain('catch (err)');
    expect(result).toContain('console.error(err)');
    expect(result).toContain('return null');
  });

  it('should preserve multi-line code structure', () => {
    const code = `const a = await first();
const b = await second();
return a + b;`;

    const result = wrapInTryCatch(code);

    expect(result).toContain('await first()');
    expect(result).toContain('await second()');
  });

  it('should handle empty code', () => {
    const result = wrapInTryCatch('');

    expect(result).toContain('try {');
    expect(result).toContain('catch (err)');
  });
});
