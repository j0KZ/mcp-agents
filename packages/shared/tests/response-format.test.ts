/**
 * Tests for response-format.ts
 * Tests response format types and utilities
 */

import { describe, it, expect } from 'vitest';
import {
  isValidResponseFormat,
  getResponseFormat,
  RESPONSE_FORMAT_SPECS,
  RESPONSE_FORMAT_SCHEMA,
} from '../src/types/response-format.js';

describe('isValidResponseFormat', () => {
  it('should return true for minimal', () => {
    expect(isValidResponseFormat('minimal')).toBe(true);
  });

  it('should return true for concise', () => {
    expect(isValidResponseFormat('concise')).toBe(true);
  });

  it('should return true for detailed', () => {
    expect(isValidResponseFormat('detailed')).toBe(true);
  });

  it('should return false for invalid string', () => {
    expect(isValidResponseFormat('invalid')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidResponseFormat('')).toBe(false);
  });

  it('should return false for number', () => {
    expect(isValidResponseFormat(123)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isValidResponseFormat(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidResponseFormat(undefined)).toBe(false);
  });

  it('should return false for object', () => {
    expect(isValidResponseFormat({})).toBe(false);
  });

  it('should return false for array', () => {
    expect(isValidResponseFormat([])).toBe(false);
  });
});

describe('getResponseFormat', () => {
  it('should return valid format unchanged', () => {
    expect(getResponseFormat('minimal')).toBe('minimal');
    expect(getResponseFormat('concise')).toBe('concise');
    expect(getResponseFormat('detailed')).toBe('detailed');
  });

  it('should return default for invalid value', () => {
    expect(getResponseFormat('invalid')).toBe('detailed');
  });

  it('should return default for null', () => {
    expect(getResponseFormat(null)).toBe('detailed');
  });

  it('should return default for undefined', () => {
    expect(getResponseFormat(undefined)).toBe('detailed');
  });

  it('should return custom default when specified', () => {
    expect(getResponseFormat('invalid', 'minimal')).toBe('minimal');
    expect(getResponseFormat(undefined, 'concise')).toBe('concise');
  });

  it('should return valid format even with custom default', () => {
    expect(getResponseFormat('minimal', 'detailed')).toBe('minimal');
  });
});

describe('RESPONSE_FORMAT_SPECS', () => {
  it('should have minimal spec with correct properties', () => {
    const spec = RESPONSE_FORMAT_SPECS.minimal;
    expect(spec.description).toBeDefined();
    expect(spec.maxTokens).toBe(100);
    expect(spec.includeDetails).toBe(false);
    expect(spec.maxArrayItems).toBe(3);
  });

  it('should have concise spec with correct properties', () => {
    const spec = RESPONSE_FORMAT_SPECS.concise;
    expect(spec.description).toBeDefined();
    expect(spec.maxTokens).toBe(500);
    expect(spec.includeDetails).toBe(false);
    expect(spec.maxArrayItems).toBe(5);
  });

  it('should have detailed spec with correct properties', () => {
    const spec = RESPONSE_FORMAT_SPECS.detailed;
    expect(spec.description).toBeDefined();
    expect(spec.maxTokens).toBe(5000);
    expect(spec.includeDetails).toBe(true);
    expect(spec.maxArrayItems).toBe(100);
  });
});

describe('RESPONSE_FORMAT_SCHEMA', () => {
  it('should have correct type', () => {
    expect(RESPONSE_FORMAT_SCHEMA.type).toBe('string');
  });

  it('should have all valid enum values', () => {
    expect(RESPONSE_FORMAT_SCHEMA.enum).toEqual(['minimal', 'concise', 'detailed']);
  });

  it('should have detailed as default', () => {
    expect(RESPONSE_FORMAT_SCHEMA.default).toBe('detailed');
  });

  it('should have description', () => {
    expect(RESPONSE_FORMAT_SCHEMA.description).toBeDefined();
    expect(typeof RESPONSE_FORMAT_SCHEMA.description).toBe('string');
  });
});
