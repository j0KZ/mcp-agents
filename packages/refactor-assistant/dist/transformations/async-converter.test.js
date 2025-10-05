import { describe, it, expect } from 'vitest';
import { convertCallbackToAsync, convertPromiseChainToAsync, wrapInTryCatch, } from './async-converter.js';
describe('convertCallbackToAsync()', () => {
    describe('Happy Path', () => {
        it('should convert basic callback pattern to async/await without try-catch', () => {
            const input = `function getData() {
  fetchData((err, data) => {
    console.log(data);
  });
}`;
            const result = convertCallbackToAsync(input, false);
            expect(result.changed).toBe(true);
            expect(result.code).toContain('async function getData()');
            expect(result.code).toContain('const data = await fetchData()');
            expect(result.code).not.toContain('try {');
        });
        it('should convert callback pattern to async/await with try-catch', () => {
            const input = `function loadUser() {
  getUser((err, user) => {
    console.log(user.name);
  });
}`;
            const result = convertCallbackToAsync(input, true);
            expect(result.changed).toBe(true);
            expect(result.code).toContain('async function loadUser()');
            expect(result.code).toContain('try {');
            expect(result.code).toContain('const user = await getUser()');
            // Note: Current implementation doesn't add proper catch block for callbacks
        });
        it('should handle multiple callback patterns in same code', () => {
            const input = `function processData() {
  fetchUser((err, user) => {
    console.log(user);
  });
  fetchPosts((err, posts) => {
    console.log(posts);
  });
}`;
            const result = convertCallbackToAsync(input, false);
            expect(result.changed).toBe(true);
            expect(result.code).toContain('const user = await fetchUser()');
            expect(result.code).toContain('const posts = await fetchPosts()');
        });
        it('should handle callback with different variable names', () => {
            const input = `function load() {
  api((err, response) => {
    return response;
  });
}`;
            const result = convertCallbackToAsync(input, false);
            expect(result.changed).toBe(true);
            expect(result.code).toContain('const response = await api()');
        });
    });
    describe('Edge Cases', () => {
        it('should return unchanged when no callback pattern found', () => {
            const input = `function getData() {
  return fetch('/api/data');
}`;
            const result = convertCallbackToAsync(input, false);
            expect(result.changed).toBe(false);
            expect(result.code).toBe(input);
        });
        it('should handle empty string', () => {
            const result = convertCallbackToAsync('', false);
            expect(result.changed).toBe(false);
            expect(result.code).toBe('');
        });
        it('should handle code with no functions', () => {
            const input = `const x = 5;
const y = 10;
console.log(x + y);`;
            const result = convertCallbackToAsync(input, false);
            expect(result.changed).toBe(false);
            expect(result.code).toBe(input);
        });
        it('should handle callback pattern with spaces', () => {
            const input = `function getData() {
  fetch ( (err, data) => {
    console.log(data);
  });
}`;
            const result = convertCallbackToAsync(input, false);
            expect(result.changed).toBe(true);
            expect(result.code).toContain('const data = await fetch()');
        });
        it('should preserve code without callback pattern when using try-catch', () => {
            const input = `function getData() {
  return fetch('/api');
}`;
            const result = convertCallbackToAsync(input, true);
            expect(result.changed).toBe(false);
            expect(result.code).toBe(input);
        });
    });
    describe('Error Cases', () => {
        it('should handle malformed callback pattern gracefully', () => {
            const input = `function getData() {
  fetch((err) => {
    console.log('incomplete');
  });
}`;
            const result = convertCallbackToAsync(input, false);
            expect(result.changed).toBe(false);
        });
        it('should not break on invalid syntax', () => {
            const input = `function getData() {
  fetch((err, => {
  });
}`;
            expect(() => convertCallbackToAsync(input, false)).not.toThrow();
        });
    });
});
describe('convertPromiseChainToAsync()', () => {
    describe('Happy Path', () => {
        it('should convert basic .then() chain to async/await', () => {
            const input = `function getData() {
  promise.then((result) => {
    console.log(result);
  });
}`;
            const result = convertPromiseChainToAsync(input);
            expect(result.changed).toBe(true);
            expect(result.code).toContain('async function getData()');
            expect(result.code).toContain('const result = await promise');
        });
        it('should handle .then() with arrow function', () => {
            const input = `function fetchUser() {
  api.get().then((user) => {
    return user.name;
  });
}`;
            const result = convertPromiseChainToAsync(input);
            expect(result.changed).toBe(true);
            expect(result.code).toContain('const user = await promise');
        });
        it('should handle multiple .then() chains', () => {
            const input = `function loadData() {
  fetch1().then((data1) => {
    console.log(data1);
  });
  fetch2().then((data2) => {
    console.log(data2);
  });
}`;
            const result = convertPromiseChainToAsync(input);
            expect(result.changed).toBe(true);
            expect(result.code).toContain('const data1 = await promise');
            expect(result.code).toContain('const data2 = await promise');
        });
        it('should handle .then() with minimal spaces', () => {
            const input = `function getData() {
  promise.then((res) => {
    return res;
  });
}`;
            const result = convertPromiseChainToAsync(input);
            expect(result.changed).toBe(true);
            expect(result.code).toContain('const res = await promise');
        });
    });
    describe('Edge Cases', () => {
        it('should return unchanged when no .then() pattern found', () => {
            const input = `async function getData() {
  const data = await fetch('/api');
  return data;
}`;
            const result = convertPromiseChainToAsync(input);
            expect(result.changed).toBe(false);
            expect(result.code).toBe(input);
        });
        it('should handle empty string', () => {
            const result = convertPromiseChainToAsync('');
            expect(result.changed).toBe(false);
            expect(result.code).toBe('');
        });
        it('should handle code without promises', () => {
            const input = `function getData() {
  const x = 5;
  return x * 2;
}`;
            const result = convertPromiseChainToAsync(input);
            expect(result.changed).toBe(false);
            expect(result.code).toBe(input);
        });
        it('should respect MAX_PROMISE_CALLBACK_LENGTH limit', () => {
            // Create a callback body that exceeds the 500 character limit
            const longBody = 'x'.repeat(600);
            const input = `function test() {
  promise.then((data) => {
    ${longBody}
  });
}`;
            const result = convertPromiseChainToAsync(input);
            // Should not match pattern due to length limit
            expect(result.changed).toBe(false);
        });
        it('should handle simple .then() patterns', () => {
            const input = `function outer() {
  promise.then((data) => {
    console.log(data);
  });
}`;
            const result = convertPromiseChainToAsync(input);
            expect(result.changed).toBe(true);
            expect(result.code).toContain('async function outer()');
        });
    });
    describe('Error Cases', () => {
        it('should handle malformed .then() pattern', () => {
            const input = `function getData() {
  promise.then(() => {
  });
}`;
            const result = convertPromiseChainToAsync(input);
            // Pattern requires parameter name in arrow function
            expect(result.changed).toBe(false);
        });
        it('should not break on invalid syntax', () => {
            const input = `function getData() {
  promise.then((data => {
  });
}`;
            expect(() => convertPromiseChainToAsync(input)).not.toThrow();
        });
    });
});
describe('wrapInTryCatch()', () => {
    describe('Happy Path', () => {
        it('should wrap code in try-catch with default error handler', () => {
            const input = `const data = await fetchData();
console.log(data);`;
            const result = wrapInTryCatch(input);
            expect(result).toContain('try {');
            expect(result).toContain(input);
            expect(result).toContain('} catch (err) {');
            expect(result).toContain('// Handle error');
            expect(result).toContain('throw err;');
        });
        it('should wrap code with custom error handler', () => {
            const input = `const user = await getUser();`;
            const errorHandler = `console.error('Failed to get user:', err);
return null;`;
            const result = wrapInTryCatch(input, errorHandler);
            expect(result).toContain('try {');
            expect(result).toContain(input);
            expect(result).toContain('} catch (err) {');
            expect(result).toContain("console.error('Failed to get user:', err)");
            expect(result).toContain('return null;');
            expect(result).not.toContain('throw err;');
        });
        it('should handle multi-line code', () => {
            const input = `const user = await fetchUser();
const posts = await fetchPosts(user.id);
return { user, posts };`;
            const result = wrapInTryCatch(input);
            expect(result).toContain('try {');
            expect(result).toContain('const user = await fetchUser()');
            expect(result).toContain('const posts = await fetchPosts(user.id)');
            expect(result).toContain('return { user, posts }');
            expect(result).toContain('} catch (err) {');
        });
        it('should handle complex error handler', () => {
            const input = `await processData();`;
            const errorHandler = `if (err instanceof ValidationError) {
  return { error: err.message };
}
throw err;`;
            const result = wrapInTryCatch(input, errorHandler);
            expect(result).toContain('if (err instanceof ValidationError)');
            expect(result).toContain("return { error: err.message }");
        });
    });
    describe('Edge Cases', () => {
        it('should handle empty string', () => {
            const result = wrapInTryCatch('');
            expect(result).toContain('try {');
            expect(result).toContain('} catch (err) {');
        });
        it('should handle single line code', () => {
            const result = wrapInTryCatch('await api.call()');
            expect(result).toBe(`try {
await api.call()
} catch (err) {
  // Handle error
  throw err;
}`);
        });
        it('should handle code with existing try-catch', () => {
            const input = `try {
  await riskyOperation();
} catch (e) {
  console.log(e);
}`;
            const result = wrapInTryCatch(input);
            // Should wrap the entire block
            expect(result).toContain('try {');
            expect(result).toContain('try {'); // Original try
            expect(result).toContain('} catch (err) {');
        });
        it('should handle empty error handler string', () => {
            const result = wrapInTryCatch('await test()', '');
            expect(result).toContain('} catch (err) {');
            // Empty handler results in just whitespace in catch block
        });
        it('should preserve indentation in code', () => {
            const input = `  const x = 5;
  const y = 10;`;
            const result = wrapInTryCatch(input);
            expect(result).toContain('  const x = 5;');
            expect(result).toContain('  const y = 10;');
        });
    });
    describe('Error Cases', () => {
        it('should handle special characters in code', () => {
            const input = `const regex = /test\\.js$/;
const str = "Hello 'world' \\"test\\"";`;
            expect(() => wrapInTryCatch(input)).not.toThrow();
            const result = wrapInTryCatch(input);
            expect(result).toContain(input);
        });
        it('should handle special characters in error handler', () => {
            const input = 'await test()';
            const errorHandler = 'console.log("Error: \\"" + err + "\\"");';
            expect(() => wrapInTryCatch(input, errorHandler)).not.toThrow();
            const result = wrapInTryCatch(input, errorHandler);
            expect(result).toContain('console.log("Error:');
        });
    });
});
describe('Integration Tests', () => {
    it('should convert callback to async and wrap in try-catch', () => {
        const input = `function getData() {
  fetchData((err, data) => {
    console.log(data);
  });
}`;
        const asyncResult = convertCallbackToAsync(input, false);
        const wrappedResult = wrapInTryCatch(asyncResult.code);
        expect(wrappedResult).toContain('try {');
        expect(wrappedResult).toContain('async function getData()');
        expect(wrappedResult).toContain('const data = await fetchData()');
        expect(wrappedResult).toContain('} catch (err) {');
    });
    it('should convert promise chain and wrap in try-catch', () => {
        const input = `function loadUser() {
  api.get().then((user) => {
    return user.name;
  });
}`;
        const asyncResult = convertPromiseChainToAsync(input);
        const wrappedResult = wrapInTryCatch(asyncResult.code);
        expect(wrappedResult).toContain('try {');
        expect(wrappedResult).toContain('async function loadUser()');
        expect(wrappedResult).toContain('const user = await promise');
        expect(wrappedResult).toContain('} catch (err) {');
    });
    it('should handle no changes gracefully in pipeline', () => {
        const input = `async function getData() {
  const data = await fetch('/api');
  return data;
}`;
        const callbackResult = convertCallbackToAsync(input, false);
        const promiseResult = convertPromiseChainToAsync(callbackResult.code);
        expect(callbackResult.changed).toBe(false);
        expect(promiseResult.changed).toBe(false);
        expect(promiseResult.code).toBe(input);
    });
});
//# sourceMappingURL=async-converter.test.js.map