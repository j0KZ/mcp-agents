/**
 * Tests for constants.ts
 */

import { describe, it, expect } from 'vitest';
import {
  DATABASE_TYPE,
  SQL_DATA_TYPE,
  MONGO_FIELD_TYPE,
  NORMAL_FORM,
  DEFAULTS,
  RELATIONSHIP_TYPE,
  RELATIONSHIP_KEYWORDS,
  DIAGRAM_FORMAT,
  DIAGRAM_THEME,
  INDEX_TYPE,
  REFERENTIAL_ACTION,
  VALIDATION_SEVERITY,
  FIELD_PATTERNS,
  MOCK_DATA_RANGE,
  ANALYSIS_THRESHOLD,
  VALIDATION_ERROR,
  NORMALIZATION_ISSUE,
} from '../src/constants.js';

describe('DATABASE_TYPE', () => {
  it('should have all supported database types', () => {
    expect(DATABASE_TYPE.POSTGRES).toBe('postgres');
    expect(DATABASE_TYPE.MYSQL).toBe('mysql');
    expect(DATABASE_TYPE.MONGODB).toBe('mongodb');
    expect(DATABASE_TYPE.SQLITE).toBe('sqlite');
  });
});

describe('SQL_DATA_TYPE', () => {
  it('should have numeric types', () => {
    expect(SQL_DATA_TYPE.INTEGER).toBe('INTEGER');
    expect(SQL_DATA_TYPE.BIGINT).toBe('BIGINT');
    expect(SQL_DATA_TYPE.SMALLINT).toBe('SMALLINT');
    expect(SQL_DATA_TYPE.DECIMAL).toBe('DECIMAL');
    expect(SQL_DATA_TYPE.SERIAL).toBe('SERIAL');
    expect(SQL_DATA_TYPE.BIGSERIAL).toBe('BIGSERIAL');
  });

  it('should have string types', () => {
    expect(SQL_DATA_TYPE.VARCHAR).toBe('VARCHAR');
    expect(SQL_DATA_TYPE.TEXT).toBe('TEXT');
    expect(SQL_DATA_TYPE.CHAR).toBe('CHAR');
  });

  it('should have date/time types', () => {
    expect(SQL_DATA_TYPE.DATE).toBe('DATE');
    expect(SQL_DATA_TYPE.TIME).toBe('TIME');
    expect(SQL_DATA_TYPE.TIMESTAMP).toBe('TIMESTAMP');
    expect(SQL_DATA_TYPE.TIMESTAMPTZ).toBe('TIMESTAMPTZ');
  });

  it('should have JSON types', () => {
    expect(SQL_DATA_TYPE.JSON).toBe('JSON');
    expect(SQL_DATA_TYPE.JSONB).toBe('JSONB');
  });

  it('should have UUID type', () => {
    expect(SQL_DATA_TYPE.UUID).toBe('UUID');
  });

  it('should have boolean type', () => {
    expect(SQL_DATA_TYPE.BOOLEAN).toBe('BOOLEAN');
  });

  it('should have binary type', () => {
    expect(SQL_DATA_TYPE.BYTEA).toBe('BYTEA');
  });
});

describe('MONGO_FIELD_TYPE', () => {
  it('should have all MongoDB field types', () => {
    expect(MONGO_FIELD_TYPE.STRING).toBe('String');
    expect(MONGO_FIELD_TYPE.NUMBER).toBe('Number');
    expect(MONGO_FIELD_TYPE.BOOLEAN).toBe('Boolean');
    expect(MONGO_FIELD_TYPE.DATE).toBe('Date');
    expect(MONGO_FIELD_TYPE.OBJECT_ID).toBe('ObjectId');
    expect(MONGO_FIELD_TYPE.ARRAY).toBe('Array');
    expect(MONGO_FIELD_TYPE.OBJECT).toBe('Object');
    expect(MONGO_FIELD_TYPE.BUFFER).toBe('Buffer');
    expect(MONGO_FIELD_TYPE.MIXED).toBe('Mixed');
  });
});

describe('NORMAL_FORM', () => {
  it('should have all normal forms', () => {
    expect(NORMAL_FORM.FIRST).toBe('1NF');
    expect(NORMAL_FORM.SECOND).toBe('2NF');
    expect(NORMAL_FORM.THIRD).toBe('3NF');
    expect(NORMAL_FORM.BCNF).toBe('BCNF');
    expect(NORMAL_FORM.DENORMALIZED).toBe('DENORMALIZED');
  });
});

describe('DEFAULTS', () => {
  it('should have string length defaults', () => {
    expect(DEFAULTS.VARCHAR_DEFAULT_LENGTH).toBe(255);
    expect(DEFAULTS.VARCHAR_SHORT_LENGTH).toBe(50);
    expect(DEFAULTS.VARCHAR_MEDIUM_LENGTH).toBe(100);
    expect(DEFAULTS.VARCHAR_LONG_LENGTH).toBe(1000);
  });

  it('should have numeric constraint defaults', () => {
    expect(DEFAULTS.MIN_PORT).toBe(1024);
    expect(DEFAULTS.MAX_PORT).toBe(65535);
    expect(DEFAULTS.MIN_AGE).toBe(0);
    expect(DEFAULTS.MAX_AGE).toBe(150);
  });

  it('should have seed data defaults', () => {
    expect(DEFAULTS.DEFAULT_RECORDS_PER_TABLE).toBe(10);
    expect(DEFAULTS.MIN_SEED_RECORDS).toBe(1);
    expect(DEFAULTS.MAX_SEED_RECORDS).toBe(1000);
  });

  it('should have naming defaults', () => {
    expect(DEFAULTS.INDEX_PREFIX).toBe('idx_');
    expect(DEFAULTS.FK_PREFIX).toBe('fk_');
    expect(DEFAULTS.PK_PREFIX).toBe('pk_');
    expect(DEFAULTS.UK_PREFIX).toBe('uk_');
  });

  it('should have timestamp column names', () => {
    expect(DEFAULTS.CREATED_AT).toBe('created_at');
    expect(DEFAULTS.UPDATED_AT).toBe('updated_at');
    expect(DEFAULTS.DELETED_AT).toBe('deleted_at');
  });
});

describe('RELATIONSHIP_TYPE', () => {
  it('should have all relationship types', () => {
    expect(RELATIONSHIP_TYPE.ONE_TO_ONE).toBe('one-to-one');
    expect(RELATIONSHIP_TYPE.ONE_TO_MANY).toBe('one-to-many');
    expect(RELATIONSHIP_TYPE.MANY_TO_ONE).toBe('many-to-one');
    expect(RELATIONSHIP_TYPE.MANY_TO_MANY).toBe('many-to-many');
  });
});

describe('RELATIONSHIP_KEYWORDS', () => {
  it('should have has many keywords', () => {
    expect(RELATIONSHIP_KEYWORDS.HAS_MANY).toContain('has many');
    expect(RELATIONSHIP_KEYWORDS.HAS_MANY).toContain('contains');
  });

  it('should have has one keywords', () => {
    expect(RELATIONSHIP_KEYWORDS.HAS_ONE).toContain('has one');
    expect(RELATIONSHIP_KEYWORDS.HAS_ONE).toContain('owns');
  });

  it('should have belongs to keywords', () => {
    expect(RELATIONSHIP_KEYWORDS.BELONGS_TO).toContain('belongs to');
    expect(RELATIONSHIP_KEYWORDS.BELONGS_TO).toContain('is owned by');
  });

  it('should have many-to-many keywords', () => {
    expect(RELATIONSHIP_KEYWORDS.MANY_TO_MANY).toContain('many-to-many');
    expect(RELATIONSHIP_KEYWORDS.MANY_TO_MANY).toContain('associated with');
  });
});

describe('DIAGRAM_FORMAT', () => {
  it('should have all diagram formats', () => {
    expect(DIAGRAM_FORMAT.MERMAID).toBe('mermaid');
    expect(DIAGRAM_FORMAT.PLANTUML).toBe('plantuml');
    expect(DIAGRAM_FORMAT.DBML).toBe('dbml');
  });
});

describe('DIAGRAM_THEME', () => {
  it('should have all diagram themes', () => {
    expect(DIAGRAM_THEME.DEFAULT).toBe('default');
    expect(DIAGRAM_THEME.DARK).toBe('dark');
    expect(DIAGRAM_THEME.NEUTRAL).toBe('neutral');
    expect(DIAGRAM_THEME.FOREST).toBe('forest');
  });
});

describe('INDEX_TYPE', () => {
  it('should have all index types', () => {
    expect(INDEX_TYPE.BTREE).toBe('BTREE');
    expect(INDEX_TYPE.HASH).toBe('HASH');
    expect(INDEX_TYPE.GIN).toBe('GIN');
    expect(INDEX_TYPE.GIST).toBe('GIST');
    expect(INDEX_TYPE.BRIN).toBe('BRIN');
  });
});

describe('REFERENTIAL_ACTION', () => {
  it('should have all referential actions', () => {
    expect(REFERENTIAL_ACTION.CASCADE).toBe('CASCADE');
    expect(REFERENTIAL_ACTION.SET_NULL).toBe('SET NULL');
    expect(REFERENTIAL_ACTION.SET_DEFAULT).toBe('SET DEFAULT');
    expect(REFERENTIAL_ACTION.RESTRICT).toBe('RESTRICT');
    expect(REFERENTIAL_ACTION.NO_ACTION).toBe('NO ACTION');
  });
});

describe('VALIDATION_SEVERITY', () => {
  it('should have all severity levels', () => {
    expect(VALIDATION_SEVERITY.ERROR).toBe('error');
    expect(VALIDATION_SEVERITY.WARNING).toBe('warning');
    expect(VALIDATION_SEVERITY.INFO).toBe('info');
  });
});

describe('FIELD_PATTERNS', () => {
  it('should validate email pattern', () => {
    expect(FIELD_PATTERNS.EMAIL.test('test@example.com')).toBe(true);
    expect(FIELD_PATTERNS.EMAIL.test('invalid-email')).toBe(false);
  });

  it('should validate URL pattern', () => {
    expect(FIELD_PATTERNS.URL.test('https://example.com')).toBe(true);
    expect(FIELD_PATTERNS.URL.test('http://test.org')).toBe(true);
    expect(FIELD_PATTERNS.URL.test('ftp://invalid')).toBe(false);
  });

  it('should validate UUID pattern', () => {
    expect(FIELD_PATTERNS.UUID.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(FIELD_PATTERNS.UUID.test('invalid-uuid')).toBe(false);
  });

  it('should validate phone pattern', () => {
    expect(FIELD_PATTERNS.PHONE.test('+14155552671')).toBe(true);
    expect(FIELD_PATTERNS.PHONE.test('123456')).toBe(true);
    expect(FIELD_PATTERNS.PHONE.test('abc')).toBe(false);
  });

  it('should validate IP address pattern', () => {
    expect(FIELD_PATTERNS.IP_ADDRESS.test('192.168.1.1')).toBe(true);
    expect(FIELD_PATTERNS.IP_ADDRESS.test('10.0.0.1')).toBe(true);
    expect(FIELD_PATTERNS.IP_ADDRESS.test('not-an-ip')).toBe(false);
  });
});

describe('MOCK_DATA_RANGE', () => {
  it('should have string length constraints', () => {
    expect(MOCK_DATA_RANGE.MIN_STRING_LENGTH).toBe(5);
    expect(MOCK_DATA_RANGE.MAX_STRING_LENGTH).toBe(50);
  });

  it('should have integer constraints', () => {
    expect(MOCK_DATA_RANGE.MIN_INT).toBe(1);
    expect(MOCK_DATA_RANGE.MAX_INT).toBe(1000);
  });

  it('should have price constraints', () => {
    expect(MOCK_DATA_RANGE.MIN_PRICE).toBe(1);
    expect(MOCK_DATA_RANGE.MAX_PRICE).toBe(10000);
  });

  it('should have quantity constraints', () => {
    expect(MOCK_DATA_RANGE.MIN_QUANTITY).toBe(1);
    expect(MOCK_DATA_RANGE.MAX_QUANTITY).toBe(100);
  });
});

describe('ANALYSIS_THRESHOLD', () => {
  it('should have table limits', () => {
    expect(ANALYSIS_THRESHOLD.MAX_COLUMNS_PER_TABLE).toBe(50);
    expect(ANALYSIS_THRESHOLD.MAX_INDEXES_PER_TABLE).toBe(10);
    expect(ANALYSIS_THRESHOLD.MAX_FK_PER_TABLE).toBe(20);
  });

  it('should have complexity thresholds', () => {
    expect(ANALYSIS_THRESHOLD.LARGE_TABLE_COLUMN_COUNT).toBe(30);
    expect(ANALYSIS_THRESHOLD.COMPLEX_SCHEMA_TABLE_COUNT).toBe(20);
  });
});

describe('VALIDATION_ERROR', () => {
  it('should have all validation error codes', () => {
    expect(VALIDATION_ERROR.MISSING_PRIMARY_KEY).toBe('MISSING_PRIMARY_KEY');
    expect(VALIDATION_ERROR.INVALID_FOREIGN_KEY).toBe('INVALID_FOREIGN_KEY');
    expect(VALIDATION_ERROR.MISSING_NOT_NULL).toBe('MISSING_NOT_NULL');
    expect(VALIDATION_ERROR.INVALID_DATA_TYPE).toBe('INVALID_DATA_TYPE');
    expect(VALIDATION_ERROR.NAMING_CONVENTION).toBe('NAMING_CONVENTION');
    expect(VALIDATION_ERROR.MISSING_INDEX).toBe('MISSING_INDEX');
    expect(VALIDATION_ERROR.REDUNDANT_INDEX).toBe('REDUNDANT_INDEX');
  });
});

describe('NORMALIZATION_ISSUE', () => {
  it('should have all normalization issue types', () => {
    expect(NORMALIZATION_ISSUE.REPEATING_GROUPS).toBe('REPEATING_GROUPS');
    expect(NORMALIZATION_ISSUE.PARTIAL_DEPENDENCY).toBe('PARTIAL_DEPENDENCY');
    expect(NORMALIZATION_ISSUE.TRANSITIVE_DEPENDENCY).toBe('TRANSITIVE_DEPENDENCY');
    expect(NORMALIZATION_ISSUE.MULTIVALUED_DEPENDENCY).toBe('MULTIVALUED_DEPENDENCY');
  });
});
