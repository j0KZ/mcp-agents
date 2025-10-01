export type TestFramework = 'jest' | 'mocha' | 'vitest' | 'ava';

export interface FunctionInfo {
  name: string;
  params: string[];
  returnType?: string;
  async: boolean;
  line: number;
}

export interface ClassInfo {
  name: string;
  methods: FunctionInfo[];
  constructor?: FunctionInfo;
  line: number;
}

export interface TestCase {
  name: string;
  type: 'happy-path' | 'edge-case' | 'error-case' | 'integration';
  code: string;
  description: string;
}

export interface TestSuite {
  describe: string;
  tests: TestCase[];
  setup?: string;
  teardown?: string;
}

export interface GeneratedTest {
  sourceFile: string;
  testFile: string;
  framework: TestFramework;
  suites: TestSuite[];
  fullTestCode: string;
  estimatedCoverage: number;
  totalTests: number;
}

export interface TestConfig {
  framework?: TestFramework;
  coverage?: number;
  includeEdgeCases?: boolean;
  includeErrorCases?: boolean;
  includeIntegration?: boolean;
  mockExternal?: boolean;
}
