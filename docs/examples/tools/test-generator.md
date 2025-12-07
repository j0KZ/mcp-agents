# Test Generator Examples 🧪

**Turn untested code into bulletproof code with @j0kz/test-generator**

---

## Table of Contents

- [Lazy Developer Special](#lazy-developer-special)
- [Generate From Scratch](#generate-from-scratch)
- [Add Edge Cases](#edge-cases)
- [Mock Dependencies](#mock-dependencies)
- [Achieve 95% Coverage](#high-coverage)
- [Test Async Functions](#async-testing)
- [React Component Testing](#react-component-testing)
- [API Endpoint Testing](#api-endpoint-testing)

---

## Lazy Developer Special

### Scenario

You hate writing tests. You have a utility file with zero tests. You want tests NOW.

### What You Type

```
"I'm too lazy to write tests. Generate comprehensive tests for my utils.js"
```

### Your Code (utils.js)

```javascript
export function formatCurrency(amount, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(amount);
}

export function parseEmail(email) {
  const regex = /^([^@]+)@([^@]+)$/;
  const match = email.match(regex);
  if (!match) return null;

  return {
    username: match[1],
    domain: match[2],
    isValid: true,
  };
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));

  const clonedObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}
```

### Generated Tests (utils.test.js)

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatCurrency, parseEmail, debounce, deepClone } from './utils';

describe('formatCurrency', () => {
  describe('basic functionality', () => {
    it('should format USD currency by default', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toMatch(/€|EUR/);
      expect(formatCurrency(1234.56, 'GBP')).toMatch(/£|GBP/);
      expect(formatCurrency(1234.56, 'JPY')).toMatch(/¥|JPY/);
    });

    it('should handle whole numbers', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('should handle decimal numbers', () => {
      expect(formatCurrency(99.99)).toBe('$99.99');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('should handle very large numbers', () => {
      expect(formatCurrency(1000000000)).toBe('$1,000,000,000.00');
    });

    it('should handle very small decimals', () => {
      expect(formatCurrency(0.001)).toBe('$0.00');
    });

    it('should handle NaN', () => {
      expect(formatCurrency(NaN)).toBe('NaN');
    });

    it('should handle Infinity', () => {
      expect(formatCurrency(Infinity)).toBe('∞');
    });
  });

  describe('error cases', () => {
    it('should handle invalid currency codes gracefully', () => {
      expect(() => formatCurrency(100, 'INVALID')).toThrow();
    });

    it('should handle non-numeric inputs', () => {
      expect(formatCurrency('not a number')).toBe('NaN');
    });
  });
});

describe('parseEmail', () => {
  describe('valid emails', () => {
    it('should parse simple email', () => {
      const result = parseEmail('user@example.com');
      expect(result).toEqual({
        username: 'user',
        domain: 'example.com',
        isValid: true,
      });
    });

    it('should parse email with dots', () => {
      const result = parseEmail('first.last@company.co.uk');
      expect(result).toEqual({
        username: 'first.last',
        domain: 'company.co.uk',
        isValid: true,
      });
    });

    it('should parse email with numbers', () => {
      const result = parseEmail('user123@test456.org');
      expect(result).toEqual({
        username: 'user123',
        domain: 'test456.org',
        isValid: true,
      });
    });

    it('should parse email with special characters', () => {
      const result = parseEmail('user+tag@example.com');
      expect(result).toEqual({
        username: 'user+tag',
        domain: 'example.com',
        isValid: true,
      });
    });
  });

  describe('invalid emails', () => {
    it('should return null for email without @', () => {
      expect(parseEmail('notanemail')).toBeNull();
    });

    it('should return null for email with multiple @', () => {
      expect(parseEmail('user@@example.com')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseEmail('')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle email with just @', () => {
      expect(parseEmail('@')).toBeNull();
    });

    it('should handle email starting with @', () => {
      expect(parseEmail('@example.com')).toBeNull();
    });

    it('should handle email ending with @', () => {
      expect(parseEmail('user@')).toBeNull();
    });

    it('should handle null input', () => {
      expect(() => parseEmail(null)).toThrow();
    });

    it('should handle undefined input', () => {
      expect(() => parseEmail(undefined)).toThrow();
    });

    it('should handle non-string input', () => {
      expect(() => parseEmail(123)).toThrow();
    });
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should debounce function calls', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('third');
  });

  it('should handle multiple debounce cycles', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    vi.advanceTimersByTime(50);
    debouncedFn('second');
    vi.advanceTimersByTime(50);
    debouncedFn('third');
    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('third');
  });

  it('should pass multiple arguments', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('arg1', 'arg2', { key: 'value' });
    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' });
  });

  it('should work with zero delay', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 0);

    debouncedFn('test');
    vi.advanceTimersByTime(0);

    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should preserve this context', () => {
    const obj = {
      value: 42,
      method: vi.fn(function () {
        return this.value;
      }),
    };

    obj.debouncedMethod = debounce(obj.method, 100);
    obj.debouncedMethod();
    vi.advanceTimersByTime(100);

    expect(obj.method).toHaveBeenCalled();
  });
});

describe('deepClone', () => {
  describe('primitive values', () => {
    it('should return primitive values as-is', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('string')).toBe('string');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });
  });

  describe('objects', () => {
    it('should deep clone simple objects', () => {
      const original = { a: 1, b: 2 };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should deep clone nested objects', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned.level1.level2.level3).not.toBe(original.level1.level2.level3);

      cloned.level1.level2.level3.value = 'modified';
      expect(original.level1.level2.level3.value).toBe('deep');
    });
  });

  describe('arrays', () => {
    it('should deep clone arrays', () => {
      const original = [1, 2, 3];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should deep clone nested arrays', () => {
      const original = [
        [1, 2],
        [3, [4, 5]],
      ];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned[1][1]).not.toBe(original[1][1]);
    });

    it('should deep clone arrays with objects', () => {
      const original = [{ id: 1 }, { id: 2 }];
      const cloned = deepClone(original);

      cloned[0].id = 99;
      expect(original[0].id).toBe(1);
    });
  });

  describe('special objects', () => {
    it('should clone Date objects', () => {
      const original = new Date('2024-01-01');
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.getTime()).toBe(original.getTime());
    });

    it('should handle circular references gracefully', () => {
      const obj = { a: 1 };
      obj.self = obj;

      // This will cause stack overflow - test should verify it's handled
      expect(() => deepClone(obj)).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      expect(deepClone({})).toEqual({});
    });

    it('should handle empty arrays', () => {
      expect(deepClone([])).toEqual([]);
    });

    it('should skip non-own properties', () => {
      const proto = { inherited: true };
      const obj = Object.create(proto);
      obj.own = 'property';

      const cloned = deepClone(obj);
      expect(cloned.own).toBe('property');
      expect(cloned.inherited).toBeUndefined();
    });
  });
});
```

### Test Coverage Report

```markdown
## Coverage Report 📊

| File     | % Stmts | % Branch | % Funcs | % Lines |
| -------- | ------- | -------- | ------- | ------- |
| utils.js | 95.83   | 92.31    | 100.00  | 95.83   |

### Coverage Details

✅ formatCurrency: 100% covered (all branches)
✅ parseEmail: 100% covered (all branches)
✅ debounce: 100% covered (closure tested)
⚠️ deepClone: 91% covered (circular reference case needs handling)

### Test Statistics

- Total Tests: 47
- Passing: 46
- Failing: 1 (circular reference)
- Time: 124ms

### Missing Coverage

Line 38: Circular reference detection not implemented
Suggestion: Add WeakSet to track visited objects
```

---

## Generate From Scratch

### Scenario

You have a service class with zero tests and need comprehensive coverage.

### What You Type

```
"Generate tests from scratch for my UserService class"
```

### Your Code (UserService.js)

```javascript
import axios from 'axios';
import cache from './cache';
import logger from './logger';

class UserService {
  constructor(apiUrl = 'https://api.example.com') {
    this.apiUrl = apiUrl;
    this.cache = cache;
    this.logger = logger;
  }

  async getUser(id) {
    const cacheKey = `user:${id}`;

    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.info(`Cache hit for user ${id}`);
      return cached;
    }

    try {
      const response = await axios.get(`${this.apiUrl}/users/${id}`);
      const user = response.data;

      // Cache for 5 minutes
      await this.cache.set(cacheKey, user, 300);
      this.logger.info(`Fetched user ${id} from API`);

      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch user ${id}:`, error);
      throw new Error(`User ${id} not found`);
    }
  }

  async createUser(userData) {
    if (!userData.email || !userData.name) {
      throw new Error('Email and name are required');
    }

    try {
      const response = await axios.post(`${this.apiUrl}/users`, userData);
      const newUser = response.data;

      // Invalidate cache
      await this.cache.delete('users:all');
      this.logger.info(`Created user ${newUser.id}`);

      return newUser;
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error('User with this email already exists');
      }
      this.logger.error('Failed to create user:', error);
      throw error;
    }
  }

  async updateUser(id, updates) {
    const user = await this.getUser(id);
    const updatedUser = { ...user, ...updates };

    try {
      const response = await axios.put(`${this.apiUrl}/users/${id}`, updatedUser);

      // Update cache
      const cacheKey = `user:${id}`;
      await this.cache.set(cacheKey, response.data, 300);

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      await axios.delete(`${this.apiUrl}/users/${id}`);

      // Clear from cache
      await this.cache.delete(`user:${id}`);
      await this.cache.delete('users:all');

      this.logger.info(`Deleted user ${id}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete user ${id}:`, error);
      throw error;
    }
  }
}

export default UserService;
```

### Generated Test Suite

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import UserService from './UserService';

// Mock dependencies
vi.mock('axios');
vi.mock('./cache', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock('./logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import cache from './cache';
import logger from './logger';

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService('https://test-api.com');
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default API URL', () => {
      const service = new UserService();
      expect(service.apiUrl).toBe('https://api.example.com');
    });

    it('should accept custom API URL', () => {
      const service = new UserService('https://custom.com');
      expect(service.apiUrl).toBe('https://custom.com');
    });
  });

  describe('getUser', () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

    it('should return cached user if available', async () => {
      cache.get.mockResolvedValue(mockUser);

      const result = await userService.getUser(1);

      expect(cache.get).toHaveBeenCalledWith('user:1');
      expect(result).toEqual(mockUser);
      expect(logger.info).toHaveBeenCalledWith('Cache hit for user 1');
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should fetch from API if not cached', async () => {
      cache.get.mockResolvedValue(null);
      axios.get.mockResolvedValue({ data: mockUser });

      const result = await userService.getUser(1);

      expect(cache.get).toHaveBeenCalledWith('user:1');
      expect(axios.get).toHaveBeenCalledWith('https://test-api.com/users/1');
      expect(cache.set).toHaveBeenCalledWith('user:1', mockUser, 300);
      expect(result).toEqual(mockUser);
      expect(logger.info).toHaveBeenCalledWith('Fetched user 1 from API');
    });

    it('should throw error when API fails', async () => {
      cache.get.mockResolvedValue(null);
      axios.get.mockRejectedValue(new Error('Network error'));

      await expect(userService.getUser(1)).rejects.toThrow('User 1 not found');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle API 404 response', async () => {
      cache.get.mockResolvedValue(null);
      const error = new Error('Not Found');
      error.response = { status: 404 };
      axios.get.mockRejectedValue(error);

      await expect(userService.getUser(999)).rejects.toThrow('User 999 not found');
    });
  });

  describe('createUser', () => {
    const newUserData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
    };
    const createdUser = { id: 2, ...newUserData };

    it('should create user successfully', async () => {
      axios.post.mockResolvedValue({ data: createdUser });

      const result = await userService.createUser(newUserData);

      expect(axios.post).toHaveBeenCalledWith('https://test-api.com/users', newUserData);
      expect(cache.delete).toHaveBeenCalledWith('users:all');
      expect(result).toEqual(createdUser);
      expect(logger.info).toHaveBeenCalledWith('Created user 2');
    });

    it('should validate required fields', async () => {
      await expect(userService.createUser({})).rejects.toThrow('Email and name are required');

      await expect(userService.createUser({ name: 'John' })).rejects.toThrow(
        'Email and name are required'
      );

      await expect(userService.createUser({ email: 'test@test.com' })).rejects.toThrow(
        'Email and name are required'
      );

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle duplicate email error', async () => {
      const error = new Error('Conflict');
      error.response = { status: 409 };
      axios.post.mockRejectedValue(error);

      await expect(userService.createUser(newUserData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should propagate other errors', async () => {
      const error = new Error('Server error');
      error.response = { status: 500 };
      axios.post.mockRejectedValue(error);

      await expect(userService.createUser(newUserData)).rejects.toThrow('Server error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const mockUser = { id: 1, name: 'John', email: 'john@example.com' };
    const updates = { name: 'John Updated' };
    const updatedUser = { ...mockUser, ...updates };

    it('should update user successfully', async () => {
      cache.get.mockResolvedValue(mockUser);
      axios.put.mockResolvedValue({ data: updatedUser });

      const result = await userService.updateUser(1, updates);

      expect(axios.put).toHaveBeenCalledWith('https://test-api.com/users/1', updatedUser);
      expect(cache.set).toHaveBeenCalledWith('user:1', updatedUser, 300);
      expect(result).toEqual(updatedUser);
    });

    it('should fetch current user before updating', async () => {
      cache.get.mockResolvedValue(null);
      axios.get.mockResolvedValue({ data: mockUser });
      axios.put.mockResolvedValue({ data: updatedUser });

      await userService.updateUser(1, updates);

      expect(axios.get).toHaveBeenCalledWith('https://test-api.com/users/1');
      expect(axios.put).toHaveBeenCalled();
    });

    it('should handle update failure', async () => {
      cache.get.mockResolvedValue(mockUser);
      axios.put.mockRejectedValue(new Error('Update failed'));

      await expect(userService.updateUser(1, updates)).rejects.toThrow('Update failed');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should merge updates correctly', async () => {
      cache.get.mockResolvedValue(mockUser);
      const complexUpdates = {
        name: 'New Name',
        metadata: { subscribed: true },
      };
      axios.put.mockResolvedValue({ data: { ...mockUser, ...complexUpdates } });

      await userService.updateUser(1, complexUpdates);

      expect(axios.put.mock.calls[0][1]).toMatchObject(complexUpdates);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      axios.delete.mockResolvedValue({ data: {} });

      const result = await userService.deleteUser(1);

      expect(axios.delete).toHaveBeenCalledWith('https://test-api.com/users/1');
      expect(cache.delete).toHaveBeenCalledWith('user:1');
      expect(cache.delete).toHaveBeenCalledWith('users:all');
      expect(result).toEqual({ success: true });
      expect(logger.info).toHaveBeenCalledWith('Deleted user 1');
    });

    it('should handle delete failure', async () => {
      axios.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(userService.deleteUser(1)).rejects.toThrow('Delete failed');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle 404 on delete', async () => {
      const error = new Error('Not Found');
      error.response = { status: 404 };
      axios.delete.mockRejectedValue(error);

      await expect(userService.deleteUser(999)).rejects.toThrow('Not Found');
    });
  });

  describe('error handling edge cases', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('ETIMEDOUT');
      timeoutError.code = 'ETIMEDOUT';
      axios.get.mockRejectedValue(timeoutError);
      cache.get.mockResolvedValue(null);

      await expect(userService.getUser(1)).rejects.toThrow('User 1 not found');
    });

    it('should handle malformed API responses', async () => {
      cache.get.mockResolvedValue(null);
      axios.get.mockResolvedValue({ data: null });

      const result = await userService.getUser(1);
      expect(result).toBeNull();
    });
  });

  describe('integration scenarios', () => {
    it('should handle rapid successive calls', async () => {
      cache.get.mockResolvedValue(null);
      const mockUser = { id: 1, name: 'John' };
      axios.get.mockResolvedValue({ data: mockUser });

      const promises = [userService.getUser(1), userService.getUser(1), userService.getUser(1)];

      const results = await Promise.all(promises);

      // All should return the same user
      results.forEach(result => {
        expect(result).toEqual(mockUser);
      });

      // But API should only be called 3 times (no deduplication in this implementation)
      expect(axios.get).toHaveBeenCalledTimes(3);
    });

    it('should handle create-then-get flow', async () => {
      const userData = { name: 'New User', email: 'new@example.com' };
      const createdUser = { id: 3, ...userData };

      axios.post.mockResolvedValue({ data: createdUser });
      cache.get.mockResolvedValue(null);
      axios.get.mockResolvedValue({ data: createdUser });

      const created = await userService.createUser(userData);
      const fetched = await userService.getUser(created.id);

      expect(fetched).toEqual(created);
    });
  });
});
```

### Generated Test Helpers

```javascript
// test-helpers.js - Generated helper utilities

export const createMockUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const setupMockApi = axios => ({
  mockGetUser: user => {
    axios.get.mockResolvedValue({ data: user });
  },
  mockGetUserError: error => {
    axios.get.mockRejectedValue(error);
  },
  mockCreateUser: user => {
    axios.post.mockResolvedValue({ data: user });
  },
  // ... more helpers
});

export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
```

---

## Edge Cases

### Scenario

You want to ensure your function handles ALL edge cases properly.

### What You Type

```
"Generate edge case tests for my validation function"
```

### Your Function

```javascript
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    strength: calculateStrength(password),
  };
}

function calculateStrength(password) {
  const length = password.length;
  if (length < 8) return 'weak';
  if (length < 12) return 'medium';
  if (length < 16) return 'strong';
  return 'very strong';
}
```

### Generated Edge Case Tests

```javascript
describe('validatePassword - Edge Cases', () => {
  describe('boundary conditions', () => {
    it('should handle exactly 8 characters (minimum boundary)', () => {
      const result = validatePassword('Abc123!@');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('medium');
    });

    it('should fail with 7 characters (below minimum)', () => {
      const result = validatePassword('Abc12!@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should handle exactly 12 characters (strength boundary)', () => {
      const result = validatePassword('Abc123!@#$%^');
      expect(result.strength).toBe('strong');
    });

    it('should handle exactly 16 characters (strength boundary)', () => {
      const result = validatePassword('Abc123!@#$%^&*()');
      expect(result.strength).toBe('very strong');
    });
  });

  describe('null and undefined inputs', () => {
    it('should handle null input', () => {
      expect(() => validatePassword(null)).toThrow();
    });

    it('should handle undefined input', () => {
      expect(() => validatePassword(undefined)).toThrow();
    });

    it('should handle empty string', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(5); // All validations fail
    });
  });

  describe('special character edge cases', () => {
    it('should handle passwords with only special characters', () => {
      const result = validatePassword('!@#$%^&*()');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should handle SQL injection attempts', () => {
      const result = validatePassword("Abc123!'; DROP TABLE users; --");
      expect(result.isValid).toBe(true); // Should still validate as a password
    });

    it('should handle Unicode characters', () => {
      const result = validatePassword('Abc123!@你好世界');
      expect(result.isValid).toBe(true);
    });

    it('should handle emoji', () => {
      const result = validatePassword('Abc123!@😀🎉');
      expect(result.isValid).toBe(true);
    });
  });

  describe('whitespace handling', () => {
    it('should handle leading whitespace', () => {
      const result = validatePassword('  Abc123!@');
      expect(result.isValid).toBe(true);
    });

    it('should handle trailing whitespace', () => {
      const result = validatePassword('Abc123!@  ');
      expect(result.isValid).toBe(true);
    });

    it('should handle only whitespace', () => {
      const result = validatePassword('        ');
      expect(result.isValid).toBe(false);
    });

    it('should handle tabs and newlines', () => {
      const result = validatePassword('Abc123!@\t\n');
      expect(result.isValid).toBe(true);
    });
  });

  describe('extreme length cases', () => {
    it('should handle very long passwords (1000 chars)', () => {
      const longPassword = 'Abc123!@' + 'x'.repeat(992);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('very strong');
    });

    it('should handle maximum safe string length', () => {
      const maxPassword = 'Abc123!@' + 'x'.repeat(100000);
      expect(() => validatePassword(maxPassword)).not.toThrow();
    });
  });

  describe('type coercion edge cases', () => {
    it('should handle number input', () => {
      expect(() => validatePassword(12345678)).toThrow();
    });

    it('should handle boolean input', () => {
      expect(() => validatePassword(true)).toThrow();
    });

    it('should handle array input', () => {
      expect(() => validatePassword(['A', 'b', 'c', '1', '2', '3', '!', '@'])).toThrow();
    });

    it('should handle object input', () => {
      expect(() => validatePassword({ password: 'Abc123!@' })).toThrow();
    });
  });

  describe('regex special characters', () => {
    it('should handle regex metacharacters in password', () => {
      const result = validatePassword('Abc123.*+?^${}()|[]\\');
      expect(result.isValid).toBe(true);
    });

    it('should handle backslashes', () => {
      const result = validatePassword('Abc123!@\\\\');
      expect(result.isValid).toBe(true);
    });
  });

  describe('repeated characters', () => {
    it('should handle all same character', () => {
      const result = validatePassword('aaaaaaaa');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3); // Missing upper, number, special
    });

    it('should handle alternating characters', () => {
      const result = validatePassword('AaAaAa1!');
      expect(result.isValid).toBe(true);
    });
  });

  describe('case sensitivity boundaries', () => {
    it('should distinguish between upper and lower case', () => {
      const resultLower = validatePassword('abc123!@#');
      expect(resultLower.errors).toContain('Password must contain at least one uppercase letter');

      const resultUpper = validatePassword('ABC123!@#');
      expect(resultUpper.errors).toContain('Password must contain at least one lowercase letter');
    });
  });

  describe('performance edge cases', () => {
    it('should handle rapid successive calls', () => {
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        validatePassword('Abc123!@');
      }
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });
  });
});
```

---

## Mock Dependencies

### Scenario

Your code has external dependencies (database, API, file system) that need mocking.

### What You Type

```
"Generate tests with proper mocks for my EmailService"
```

### Your Code

```javascript
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import handlebars from 'handlebars';
import { db } from './database';
import { queue } from './queue';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail({ to, subject, template, data }) {
    try {
      // Load template
      const templatePath = `./templates/${template}.hbs`;
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      // Compile template
      const compiledTemplate = handlebars.compile(templateContent);
      const html = compiledTemplate(data);

      // Send email
      const info = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to,
        subject,
        html,
      });

      // Log to database
      await db.emails.create({
        to,
        subject,
        template,
        sentAt: new Date(),
        messageId: info.messageId,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      // Queue for retry
      await queue.add('email-retry', {
        to,
        subject,
        template,
        data,
        attempt: 1,
      });

      throw error;
    }
  }

  async sendBulkEmails(recipients, template, subject) {
    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail({
          to: recipient.email,
          subject,
          template,
          data: recipient.data,
        });
        results.push({ ...result, email: recipient.email });
      } catch (error) {
        results.push({
          success: false,
          email: recipient.email,
          error: error.message,
        });
      }
    }

    return results;
  }
}
```

### Generated Tests with Mocks

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EmailService from './EmailService';

// Create mock modules
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(),
    })),
  },
}));

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
  },
}));

vi.mock('handlebars', () => ({
  default: {
    compile: vi.fn(() => vi.fn()),
  },
}));

vi.mock('./database', () => ({
  db: {
    emails: {
      create: vi.fn(),
    },
  },
}));

vi.mock('./queue', () => ({
  queue: {
    add: vi.fn(),
  },
}));

// Import mocked modules
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import handlebars from 'handlebars';
import { db } from './database';
import { queue } from './queue';

describe('EmailService', () => {
  let emailService;
  let mockTransporter;
  let mockCompile;

  beforeEach(() => {
    // Setup environment variables
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@test.com';
    process.env.SMTP_PASS = 'password';
    process.env.FROM_EMAIL = 'noreply@test.com';

    // Setup mock implementations
    mockTransporter = {
      sendMail: vi.fn(),
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    mockCompile = vi.fn();
    handlebars.compile.mockReturnValue(mockCompile);

    // Create service instance
    emailService = new EmailService();

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendEmail', () => {
    const emailData = {
      to: 'user@example.com',
      subject: 'Test Email',
      template: 'welcome',
      data: { name: 'John' },
    };

    beforeEach(() => {
      // Setup default successful responses
      fs.readFile.mockResolvedValue('<h1>Hello {{name}}</h1>');
      mockCompile.mockReturnValue('<h1>Hello John</h1>');
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'msg-123',
      });
      db.emails.create.mockResolvedValue({ id: 1 });
    });

    it('should send email successfully', async () => {
      const result = await emailService.sendEmail(emailData);

      expect(result).toEqual({
        success: true,
        messageId: 'msg-123',
      });

      // Verify template was loaded
      expect(fs.readFile).toHaveBeenCalledWith('./templates/welcome.hbs', 'utf-8');

      // Verify template was compiled
      expect(handlebars.compile).toHaveBeenCalledWith('<h1>Hello {{name}}</h1>');
      expect(mockCompile).toHaveBeenCalledWith({ name: 'John' });

      // Verify email was sent
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<h1>Hello John</h1>',
      });

      // Verify database logging
      expect(db.emails.create).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Test Email',
        template: 'welcome',
        sentAt: expect.any(Date),
        messageId: 'msg-123',
      });
    });

    it('should handle template not found', async () => {
      fs.readFile.mockRejectedValue(new Error('ENOENT: no such file'));

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('ENOENT');

      expect(queue.add).toHaveBeenCalledWith('email-retry', {
        to: 'user@example.com',
        subject: 'Test Email',
        template: 'welcome',
        data: { name: 'John' },
        attempt: 1,
      });
    });

    it('should handle SMTP failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP connection failed'));

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('SMTP connection failed');

      expect(queue.add).toHaveBeenCalledWith('email-retry', expect.any(Object));
      expect(db.emails.create).not.toHaveBeenCalled();
    });

    it('should handle database logging failure', async () => {
      db.emails.create.mockRejectedValue(new Error('Database error'));

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('Database error');

      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(queue.add).toHaveBeenCalled();
    });

    it('should handle template compilation error', async () => {
      handlebars.compile.mockImplementation(() => {
        throw new Error('Invalid template syntax');
      });

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('Invalid template syntax');

      expect(queue.add).toHaveBeenCalled();
    });

    it('should work with empty template data', async () => {
      const emailWithoutData = {
        ...emailData,
        data: {},
      };

      await emailService.sendEmail(emailWithoutData);

      expect(mockCompile).toHaveBeenCalledWith({});
    });

    it('should handle missing environment variables', () => {
      delete process.env.SMTP_HOST;

      expect(() => new EmailService()).not.toThrow();
      // But sending should fail
    });
  });

  describe('sendBulkEmails', () => {
    const recipients = [
      { email: 'user1@example.com', data: { name: 'User 1' } },
      { email: 'user2@example.com', data: { name: 'User 2' } },
      { email: 'user3@example.com', data: { name: 'User 3' } },
    ];

    beforeEach(() => {
      fs.readFile.mockResolvedValue('<h1>Hello {{name}}</h1>');
      mockCompile.mockReturnValue('<h1>Hello</h1>');
      db.emails.create.mockResolvedValue({ id: 1 });
    });

    it('should send emails to all recipients', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg-id' });

      const results = await emailService.sendBulkEmails(recipients, 'newsletter', 'Monthly Update');

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures', async () => {
      mockTransporter.sendMail
        .mockResolvedValueOnce({ messageId: 'msg-1' })
        .mockRejectedValueOnce(new Error('Failed to send'))
        .mockResolvedValueOnce({ messageId: 'msg-3' });

      const results = await emailService.sendBulkEmails(recipients, 'newsletter', 'Monthly Update');

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Failed to send');
      expect(results[2].success).toBe(true);
    });

    it('should continue on individual failures', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      const results = await emailService.sendBulkEmails(recipients, 'newsletter', 'Monthly Update');

      expect(results.every(r => !r.success)).toBe(true);
      expect(queue.add).toHaveBeenCalledTimes(3);
    });

    it('should handle empty recipients list', async () => {
      const results = await emailService.sendBulkEmails([], 'newsletter', 'Monthly Update');

      expect(results).toEqual([]);
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('mock verification examples', () => {
    it('should demonstrate spy functionality', async () => {
      const sendMailSpy = vi.spyOn(mockTransporter, 'sendMail');

      await emailService.sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        template: 'test',
        data: {},
      });

      expect(sendMailSpy).toHaveBeenCalledOnce();
      expect(sendMailSpy.mock.calls[0][0]).toMatchObject({
        to: 'test@test.com',
      });
    });

    it('should demonstrate mock timing', async () => {
      fs.readFile.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('template'), 100))
      );

      const start = Date.now();
      await emailService.sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        template: 'test',
        data: {},
      });
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(100);
    });

    it('should demonstrate mock call order', async () => {
      await emailService.sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        template: 'test',
        data: {},
      });

      const callOrder = [];
      if (fs.readFile.mock.invocationCallOrder[0]) callOrder.push('readFile');
      if (handlebars.compile.mock.invocationCallOrder[0]) callOrder.push('compile');
      if (mockTransporter.sendMail.mock.invocationCallOrder[0]) callOrder.push('sendMail');

      // Template must be read before compiling
      expect(callOrder.indexOf('readFile')).toBeLessThan(callOrder.indexOf('compile'));
    });
  });
});
```

---

## Continue to Next Section

Ready for more examples? Check out:

👉 [Architecture Analyzer Examples](./architecture-analyzer.md)
👉 [Security Scanner Examples](./security-scanner.md)
👉 [Cookbook Recipes](../cookbook/README.md)
👉 [Back to Examples Index](../README.md)
