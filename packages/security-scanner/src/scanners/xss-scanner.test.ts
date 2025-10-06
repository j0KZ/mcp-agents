import { describe, it, expect } from 'vitest';
import { scanForXSS } from './xss-scanner.js';
import type { FileScanContext } from '../types.js';

describe('XSS Scanner', () => {
  const createContext = (content: string, filePath = 'test.js'): FileScanContext => ({
    filePath,
    content,
    extension: '.js',
    size: content.length,
  });

  describe('innerHTML Detection', () => {
    it('should detect innerHTML with user input', async () => {
      const context = createContext('element.innerHTML = userInput;');
      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe('xss');
    });

    it('should detect innerHTML with template literals', async () => {
      const context = createContext('div.innerHTML = `<p>${userData}</p>`;');
      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('document.write Detection', () => {
    it('should detect document.write with user data', async () => {
      const context = createContext('document.write(userContent);');
      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect outerHTML assignment', async () => {
      const context = createContext('element.outerHTML = "<h1>" + title + "</h1>";');
      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('insertAdjacentHTML Detection', () => {
    it('should detect insertAdjacentHTML with user input', async () => {
      const context = createContext('element.insertAdjacentHTML("beforeend", userCode);');
      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('URL Parameter Usage', () => {
    it('should detect URL params in innerHTML', async () => {
      const context = createContext('element.innerHTML = window.location.search;');
      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect URL hash in document.write', async () => {
      const context = createContext('document.write(window.location.hash);');
      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const context = createContext('');
      const findings = await scanForXSS(context);

      expect(findings).toHaveLength(0);
    });

    it('should handle safe code without XSS', async () => {
      const context = createContext('element.textContent = userInput;');
      const findings = await scanForXSS(context);

      expect(findings).toHaveLength(0);
    });
  });

  describe('React/JSX Patterns', () => {
    it('should detect dangerouslySetInnerHTML', async () => {
      const context = createContext('<div dangerouslySetInnerHTML={{__html: userContent}} />');
      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple Vulnerabilities', () => {
    it('should detect multiple XSS issues', async () => {
      const context = createContext(`
        element.innerHTML = userInput;
        document.write(userData);
      `);
      const findings = await scanForXSS(context);

      expect(findings.length).toBeGreaterThanOrEqual(2);
    });
  });
});
