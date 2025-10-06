import { describe, it, expect } from 'vitest';
import { scanForSQLInjection } from './sql-injection-scanner.js';
import type { FileScanContext } from '../types.js';

describe('SQL Injection Scanner', () => {
  const createContext = (content: string, filePath = 'test.js'): FileScanContext => ({
    filePath,
    content,
    extension: '.js',
    size: content.length,
  });

  describe('String Concatenation Detection', () => {
    it('should detect SQL query with string concatenation', async () => {
      const context = createContext('db.query("SELECT * FROM users WHERE id = " + userId);');
      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe('sql_injection');
    });

    it('should detect template literal in query call', async () => {
      const context = createContext('db.query(`SELECT * FROM users WHERE name = ${userName}`);');
      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect multi-line SQL concatenation', async () => {
      const context = createContext(`
        const query = "SELECT * FROM users " +
                     "WHERE id = " + userId +
                     " AND active = true";
      `);
      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('User Input in Queries', () => {
    it('should detect req.body in SQL query', async () => {
      const context = createContext('db.query("SELECT * FROM posts WHERE id = " + req.body.id);');
      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect req.params in query', async () => {
      const context = createContext(
        'connection.execute(`DELETE FROM users WHERE id = ${req.params.id}`);'
      );
      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect req.query in SQL', async () => {
      const context = createContext(
        'db.query("SELECT * FROM products WHERE category = " + req.query.cat);'
      );
      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('Different SQL Operations', () => {
    it('should detect INSERT with concatenation', async () => {
      const context = createContext(
        'INSERT INTO users (name, email) VALUES (" + name + ", " + email + ")'
      );
      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect UPDATE with concatenation', async () => {
      const context = createContext('UPDATE users SET name = " + newName + " WHERE id = " + id');
      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect DELETE with concatenation', async () => {
      const context = createContext('DELETE FROM users WHERE id = " + userId');
      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const context = createContext('');
      const findings = await scanForSQLInjection(context);

      expect(findings).toHaveLength(0);
    });

    it('should handle non-SQL code', async () => {
      const context = createContext('const message = "Hello " + userName;');
      const findings = await scanForSQLInjection(context);

      expect(findings).toHaveLength(0);
    });

    it('should not flag safe string operations', async () => {
      const context = createContext('const greeting = "Hello, " + name + "!";');
      const findings = await scanForSQLInjection(context);

      expect(findings).toHaveLength(0);
    });
  });

  describe('Multiple Vulnerabilities', () => {
    it('should detect multiple SQL injection points', async () => {
      const context = createContext(`
        db.query("SELECT * FROM users WHERE id = " + userId);
        db.execute("DELETE FROM posts WHERE author = " + authorName);
      `);
      const findings = await scanForSQLInjection(context);

      expect(findings.length).toBeGreaterThanOrEqual(2);
    });
  });
});
