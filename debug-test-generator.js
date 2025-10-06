#!/usr/bin/env node

import { TestGenerator } from './packages/test-generator/dist/generator.js';
import { readFileSync } from 'fs';

async function debug() {
  console.log('🔍 Debugging test-generator...\n');

  const generator = new TestGenerator();

  // Create a simple test file
  const testCode = `
export function add(a: number, b: number): number {
  return a + b;
}

export class Calculator {
  multiply(x: number, y: number): number {
    return x * y;
  }
}
`;

  // Write test file
  const fs = await import('fs/promises');
  const testFile = './test-sample.ts';
  await fs.writeFile(testFile, testCode);

  console.log('Test file created with content:');
  console.log(testCode);
  console.log('\n---\n');

  try {
    console.log('Attempting to generate tests...');
    const result = await generator.generateTests(testFile, {
      framework: 'vitest',
      includeEdgeCases: true,
      includeErrorCases: true
    });

    console.log('✅ Success!');
    console.log('Result:', result.success);
    console.log('Generated code preview:');
    console.log(result.code?.substring(0, 500));
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\nFull error:', error);
  }

  // Clean up
  await fs.unlink(testFile);
}

debug().catch(console.error);