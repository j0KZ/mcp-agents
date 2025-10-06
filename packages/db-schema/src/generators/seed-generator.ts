/**
 * Seed Data Generator Module
 * Generates realistic mock data for testing
 */

import { SQLTable, MongoCollection } from '../types.js';
import { MOCK_DATA_RANGES } from '../constants/schema-limits.js';

export function generateSQLRecords(table: SQLTable, count: number): Record<string, any>[] {
  const records: Record<string, any>[] = [];

  for (let i = 0; i < count; i++) {
    const record: Record<string, any> = {};

    for (const col of table.columns) {
      if (
        col.autoIncrement ||
        col.defaultValue === 'gen_random_uuid()' ||
        col.defaultValue === 'CURRENT_TIMESTAMP'
      ) {
        continue; // Skip auto-generated fields
      }

      record[col.name] = generateMockValue(col.name, col.type, i);
    }

    records.push(record);
  }

  return records;
}

export function generateMongoRecords(
  collection: MongoCollection,
  count: number
): Record<string, any>[] {
  const records: Record<string, any>[] = [];

  for (let i = 0; i < count; i++) {
    const record: Record<string, any> = {};

    for (const field of collection.fields) {
      if (field.name === '_id' || field.default === 'Date.now') {
        continue; // Skip auto-generated fields
      }

      record[field.name] = generateMockValue(field.name, field.type, i);
    }

    records.push(record);
  }

  return records;
}

export function generateMockValue(name: string, type: string, index: number): any {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('email')) {
    return `user${index}@example.com`;
  }
  if (lowerName.includes('name')) {
    return `Test ${name} ${index}`;
  }
  if (lowerName.includes('password')) {
    return '$2b$10$hashedpassword' + index;
  }
  if (lowerName.includes('price') || lowerName.includes('amount')) {
    return (Math.random() * MOCK_DATA_RANGES.MAX_RANDOM_PRICE).toFixed(2);
  }
  if (lowerName.includes('stock') || lowerName.includes('quantity')) {
    return Math.floor(Math.random() * MOCK_DATA_RANGES.MAX_RANDOM_QUANTITY);
  }
  if (lowerName.includes('description')) {
    return `This is a sample description for item ${index}`;
  }

  // Type-based defaults
  if (type.includes('INT') || type === 'Number') {
    return index + MOCK_DATA_RANGES.SEQUENCE_OFFSET;
  }
  if (type.includes('BOOL') || type === 'Boolean') {
    return index % 2 === 0;
  }
  if (type.includes('CHAR') || type === 'String') {
    return `value_${index}`;
  }
  if (type === 'DECIMAL' || type === 'NUMERIC') {
    return (index * MOCK_DATA_RANGES.DECIMAL_MULTIPLIER).toFixed(2);
  }

  return `mock_${index}`;
}
