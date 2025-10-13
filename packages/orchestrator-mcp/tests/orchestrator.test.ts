import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPPipeline } from '@j0kz/shared';
import {
  createPreCommitWorkflow,
  createPreMergeWorkflow,
  createQualityAuditWorkflow,
  createWorkflow,
} from '../src/workflows.js';

describe('Orchestrator Workflows', () => {
  describe('createPreCommitWorkflow', () => {
    it('should create workflow with correct steps', () => {
      const files = ['test.ts'];
      const workflow = createPreCommitWorkflow(files);

      expect(workflow).toBeInstanceOf(MCPPipeline);

      // Verify steps were added (internal check)
      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(2);
      expect(steps[0].name).toBe('code-review');
      expect(steps[0].tool).toBe('smart-reviewer');
      expect(steps[1].name).toBe('security-scan');
      expect(steps[1].tool).toBe('security-scanner');
    });

    it('should configure code-review step correctly', () => {
      const files = ['src/auth.ts', 'src/db.ts'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      const reviewStep = steps[0];

      // FIXED: Now uses batch_review for ALL files
      expect(reviewStep.config.action).toBe('batch_review');
      expect(reviewStep.config.params.filePaths).toEqual(files);
      expect(reviewStep.config.params.config.severity).toBe('moderate');
    });

    it('should configure security-scan step correctly', () => {
      const files = ['src/auth.ts', 'src/db.ts'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      const securityStep = steps[1];

      // FIXED: Now uses scan_project with file patterns
      expect(securityStep.config.action).toBe('scan_project');
      expect(securityStep.config.params.config.includePatterns).toEqual(files);
    });
  });

  describe('createPreMergeWorkflow', () => {
    it('should create workflow with 4 steps', () => {
      const files = ['test1.ts', 'test2.ts'];
      const workflow = createPreMergeWorkflow(files, '/project');

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(4);
      expect(steps[0].name).toBe('batch-review');
      expect(steps[1].name).toBe('architecture-analysis');
      expect(steps[2].name).toBe('security-audit');
      expect(steps[3].name).toBe('test-coverage');
    });

    it('should configure batch-review with strict severity', () => {
      const files = ['test.ts'];
      const workflow = createPreMergeWorkflow(files, '/project');

      const steps = (workflow as any).steps;
      const reviewStep = steps[0];

      expect(reviewStep.tool).toBe('smart-reviewer');
      expect(reviewStep.config.action).toBe('batch_review');
      expect(reviewStep.config.params.config.severity).toBe('strict');
      expect(reviewStep.config.params.filePaths).toEqual(files);
    });

    it('should configure architecture-analysis with circular detection', () => {
      const workflow = createPreMergeWorkflow(['test.ts'], '/project');

      const steps = (workflow as any).steps;
      const archStep = steps[1];

      expect(archStep.tool).toBe('architecture-analyzer');
      expect(archStep.config.params.projectPath).toBe('/project');
      expect(archStep.config.params.config.detectCircular).toBe(true);
    });

    it('should make test-coverage depend on batch-review', () => {
      const workflow = createPreMergeWorkflow(['test.ts'], '/project');

      const steps = (workflow as any).steps;
      const testStep = steps[3];

      expect(testStep.name).toBe('test-coverage');
      expect(testStep.dependsOn).toEqual(['batch-review']);
    });
  });

  describe('createQualityAuditWorkflow', () => {
    it('should create workflow with 3 steps', () => {
      const workflow = createQualityAuditWorkflow('/project');

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(3);
      expect(steps[0].name).toBe('security-report');
      expect(steps[1].name).toBe('architecture-analysis');
      expect(steps[2].name).toBe('generate-docs');
    });

    it('should configure security-report with output path', () => {
      const workflow = createQualityAuditWorkflow('/project');

      const steps = (workflow as any).steps;
      const reportStep = steps[0];

      expect(reportStep.tool).toBe('security-scanner');
      expect(reportStep.config.action).toBe('generate_security_report');
      expect(reportStep.config.params.outputPath).toBe('/project/reports/security.md');
    });

    it('should configure architecture with graph generation', () => {
      const workflow = createQualityAuditWorkflow('/project');

      const steps = (workflow as any).steps;
      const archStep = steps[1];

      expect(archStep.config.params.config.generateGraph).toBe(true);
      expect(archStep.config.params.config.maxDepth).toBe(5);
    });
  });

  describe('createWorkflow', () => {
    it('should create pre-commit workflow', () => {
      const workflow = createWorkflow('pre-commit', ['test.ts'], '.');

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(2);
      expect(steps[0].name).toBe('code-review');
    });

    it('should create pre-merge workflow', () => {
      const workflow = createWorkflow('pre-merge', ['test.ts'], '.');

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(4);
      expect(steps[0].name).toBe('batch-review');
    });

    it('should create quality-audit workflow', () => {
      const workflow = createWorkflow('quality-audit', [], '/project');

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(3);
      expect(steps[0].name).toBe('security-report');
    });

    it('should throw error for unknown workflow', () => {
      expect(() => {
        createWorkflow('unknown' as any, [], '.');
      }).toThrow('Unknown workflow name'); // MCPError message from ERROR_CODES
    });
  });

  describe('Workflow Integration', () => {
    it('should have correct tool names for all steps', () => {
      const preCommit = createPreCommitWorkflow(['test.ts']);
      const preMerge = createPreMergeWorkflow(['test.ts'], '.');
      const quality = createQualityAuditWorkflow('.');

      const allSteps = [
        ...(preCommit as any).steps,
        ...(preMerge as any).steps,
        ...(quality as any).steps,
      ];

      const validMCPs = [
        'smart-reviewer',
        'security-scanner',
        'test-generator',
        'architecture-analyzer',
        'doc-generator',
      ];

      allSteps.forEach((step: any) => {
        expect(validMCPs).toContain(step.tool);
      });
    });

    it('should have action field for all steps', () => {
      const preCommit = createPreCommitWorkflow(['test.ts']);
      const steps = (preCommit as any).steps;

      steps.forEach((step: any) => {
        expect(step.config.action).toBeDefined();
        expect(typeof step.config.action).toBe('string');
      });
    });

    it('should have params for all steps', () => {
      const preCommit = createPreCommitWorkflow(['test.ts']);
      const steps = (preCommit as any).steps;

      steps.forEach((step: any) => {
        expect(step.config.params).toBeDefined();
        expect(typeof step.config.params).toBe('object');
      });
    });
  });

  describe('Ambiguity Detection & Smart Workflow Selection', () => {
    describe('selectWorkflowByFocus', () => {
      it('should select pre-commit for security focus', async () => {
        const { selectWorkflowByFocus } = await import('../src/helpers/workflow-selector.js');
        const workflow = selectWorkflowByFocus('security');
        expect(workflow).toBe('pre-commit');
      });

      it('should select pre-merge for quality focus', async () => {
        const { selectWorkflowByFocus } = await import('../src/helpers/workflow-selector.js');
        const workflow = selectWorkflowByFocus('quality');
        expect(workflow).toBe('pre-merge');
      });

      it('should select quality-audit for performance focus', async () => {
        const { selectWorkflowByFocus } = await import('../src/helpers/workflow-selector.js');
        const workflow = selectWorkflowByFocus('performance');
        expect(workflow).toBe('quality-audit');
      });

      it('should select pre-merge for comprehensive focus', async () => {
        const { selectWorkflowByFocus } = await import('../src/helpers/workflow-selector.js');
        const workflow = selectWorkflowByFocus('comprehensive');
        expect(workflow).toBe('pre-merge');
      });
    });

    describe('isValidFocus', () => {
      it('should validate correct focus values', async () => {
        const { isValidFocus } = await import('../src/helpers/workflow-selector.js');
        expect(isValidFocus('security')).toBe(true);
        expect(isValidFocus('quality')).toBe(true);
        expect(isValidFocus('performance')).toBe(true);
        expect(isValidFocus('comprehensive')).toBe(true);
      });

      it('should reject invalid focus values', async () => {
        const { isValidFocus } = await import('../src/helpers/workflow-selector.js');
        expect(isValidFocus('invalid')).toBe(false);
        expect(isValidFocus('sec')).toBe(false);
        expect(isValidFocus('')).toBe(false);
      });
    });

    describe('getClarificationOptions', () => {
      it('should return 4 labeled options in English by default', async () => {
        const { getClarificationOptions } = await import('../src/helpers/workflow-selector.js');
        const options = getClarificationOptions();

        expect(options).toHaveLength(4);
        expect(options[0]).toHaveProperty('value', 'security');
        expect(options[0]).toHaveProperty('label', 'a) Security Analysis');
        expect(options[0]).toHaveProperty('description');
        expect(options[1].label).toContain('b)');
        expect(options[2].label).toContain('c)');
        expect(options[3].label).toContain('d)');
      });

      it('should return options in Spanish when language is "es"', async () => {
        const { getClarificationOptions } = await import('../src/helpers/workflow-selector.js');
        const options = getClarificationOptions('es');

        expect(options).toHaveLength(4);
        expect(options[0].label).toBe('a) Análisis de Seguridad');
        expect(options[1].label).toBe('b) Calidad de Código');
        expect(options[2].label).toBe('c) Rendimiento');
        expect(options[3].label).toBe('d) Todo');
      });
    });
  });

  describe('Bilingual Support (English/Spanish)', () => {
    describe('Language Detection', () => {
      it('should detect Spanish from keywords', async () => {
        const { detectLanguage } = await import('@j0kz/shared');

        expect(detectLanguage('revisar mi código')).toBe('es');
        expect(detectLanguage('analizar seguridad')).toBe('es');
        expect(detectLanguage('verificar calidad')).toBe('es');
        expect(detectLanguage('escanear proyecto')).toBe('es');
      });

      it('should detect English from keywords', async () => {
        const { detectLanguage } = await import('@j0kz/shared');

        expect(detectLanguage('review my code')).toBe('en');
        expect(detectLanguage('analyze security')).toBe('en');
        expect(detectLanguage('check quality')).toBe('en');
        expect(detectLanguage('scan project')).toBe('en');
      });

      it('should detect Spanish from special characters', async () => {
        const { detectLanguage } = await import('@j0kz/shared');

        expect(detectLanguage('revisión de código')).toBe('es');
        expect(detectLanguage('está funcionando')).toBe('es');
        expect(detectLanguage('mañana')).toBe('es');
      });

      it('should default to English for ambiguous input', async () => {
        const { detectLanguage } = await import('@j0kz/shared');

        expect(detectLanguage('xyz')).toBe('en');
        expect(detectLanguage('')).toBe('en');
        expect(detectLanguage('123')).toBe('en');
      });
    });

    describe('Clarification Messages', () => {
      it('should return English clarification by default', async () => {
        const { getClarificationMessage } = await import('@j0kz/shared');
        const msg = getClarificationMessage('en');

        expect(msg.message).toBe('To provide focused analysis, I need to know what aspect to check.');
        expect(msg.question).toBe('What would you like me to focus on?');
      });

      it('should return Spanish clarification when language is "es"', async () => {
        const { getClarificationMessage } = await import('@j0kz/shared');
        const msg = getClarificationMessage('es');

        expect(msg.message).toBe('Para proporcionar un análisis enfocado, necesito saber qué aspecto verificar.');
        expect(msg.question).toBe('¿En qué te gustaría que me enfocara?');
      });
    });

    describe('Invalid Focus Messages', () => {
      it('should return English error message by default', async () => {
        const { getInvalidFocusMessage } = await import('@j0kz/shared');
        const msg = getInvalidFocusMessage('xyz', 'en');

        expect(msg.message).toBe('Invalid focus "xyz". Please choose from valid options.');
        expect(msg.question).toBe('What would you like me to focus on?');
      });

      it('should return Spanish error message when language is "es"', async () => {
        const { getInvalidFocusMessage } = await import('@j0kz/shared');
        const msg = getInvalidFocusMessage('xyz', 'es');

        expect(msg.message).toBe('Enfoque inválido "xyz". Por favor elige entre las opciones válidas.');
        expect(msg.question).toBe('¿En qué te gustaría que me enfocara?');
      });
    });

    describe('Response Builders', () => {
      it('should build English clarification response', async () => {
        const { buildClarificationResponse } = await import('../src/helpers/response-builder.js');
        const response = buildClarificationResponse('en');

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.status).toBe('needs_clarification');
        expect(parsed.message).toContain('To provide focused analysis');
        expect(parsed.options[0].label).toBe('a) Security Analysis');
      });

      it('should build Spanish clarification response', async () => {
        const { buildClarificationResponse } = await import('../src/helpers/response-builder.js');
        const response = buildClarificationResponse('es');

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.status).toBe('needs_clarification');
        expect(parsed.message).toContain('Para proporcionar un análisis enfocado');
        expect(parsed.options[0].label).toBe('a) Análisis de Seguridad');
      });

      it('should build English invalid focus response', async () => {
        const { buildInvalidFocusResponse } = await import('../src/helpers/response-builder.js');
        const response = buildInvalidFocusResponse('bad', 'en');

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.message).toBe('Invalid focus "bad". Please choose from valid options.');
      });

      it('should build Spanish invalid focus response', async () => {
        const { buildInvalidFocusResponse } = await import('../src/helpers/response-builder.js');
        const response = buildInvalidFocusResponse('malo', 'es');

        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.message).toBe('Enfoque inválido "malo". Por favor elige entre las opciones válidas.');
      });
    });

    describe('End-to-End Bilingual Flow', () => {
      it('should handle English user flow', async () => {
        const { getClarificationOptions } = await import('../src/helpers/workflow-selector.js');
        const { buildClarificationResponse } = await import('../src/helpers/response-builder.js');

        // User: "review my code" (ambiguous, English)
        const clarification = buildClarificationResponse('en');
        const parsed = JSON.parse(clarification.content[0].text);

        expect(parsed.question).toBe('What would you like me to focus on?');
        expect(parsed.options[0].label).toContain('Security Analysis');
        expect(parsed.options[0].value).toBe('security');
      });

      it('should handle Spanish user flow', async () => {
        const { buildClarificationResponse } = await import('../src/helpers/response-builder.js');

        // User: "revisar mi código" (ambiguous, Spanish)
        const clarification = buildClarificationResponse('es');
        const parsed = JSON.parse(clarification.content[0].text);

        expect(parsed.question).toBe('¿En qué te gustaría que me enfocara?');
        expect(parsed.options[0].label).toContain('Análisis de Seguridad');
        expect(parsed.options[1].label).toContain('Calidad de Código');
      });
    });
  });
});
