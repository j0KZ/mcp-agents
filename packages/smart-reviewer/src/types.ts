export interface CodeIssue {
  line: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule: string;
  fix?: {
    description: string;
    oldCode: string;
    newCode: string;
  };
}

export interface CodeMetrics {
  complexity: number;
  maintainability: number;
  linesOfCode: number;
  commentDensity: number;
  duplicateBlocks: number;
}

export interface ReviewResult {
  file: string;
  issues: CodeIssue[];
  metrics: CodeMetrics;
  suggestions: string[];
  overallScore: number; // 0-100
  timestamp: string;
}

export interface ReviewConfig {
  severity?: 'strict' | 'moderate' | 'lenient';
  autoFix?: boolean;
  customRules?: string;
  excludePatterns?: string[];
  includeMetrics?: boolean;
}
