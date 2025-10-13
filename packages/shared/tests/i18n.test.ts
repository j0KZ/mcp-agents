/**
 * Tests for i18n (Internationalization) modules
 * Covers messages.ts and tool-matcher.ts
 */

import { describe, it, expect } from 'vitest';
import {
  detectLanguage,
  getText,
  getTextAuto,
  getClarificationOptions,
  getClarificationMessage,
  getInvalidFocusMessage,
  ORCHESTRATOR_MESSAGES,
  LANGUAGE_PATTERNS,
  type Language,
  type BilingualText,
} from '../src/i18n/messages.js';
import {
  matchToolName,
  getToolAliases,
  getToolDescription,
  isValidToolName,
  TOOL_NAME_MAPPINGS,
} from '../src/i18n/tool-matcher.js';

describe('i18n/messages', () => {
  describe('detectLanguage', () => {
    it('should detect Spanish from keywords', () => {
      expect(detectLanguage('revisar código')).toBe('es');
      expect(detectLanguage('analizar seguridad')).toBe('es');
      expect(detectLanguage('verificar mi proyecto')).toBe('es');
      expect(detectLanguage('escanear archivo')).toBe('es');
    });

    it('should detect English from keywords', () => {
      expect(detectLanguage('review code')).toBe('en');
      expect(detectLanguage('analyze security')).toBe('en');
      expect(detectLanguage('check my project')).toBe('en');
      expect(detectLanguage('scan file')).toBe('en');
    });

    it('should detect Spanish from special characters', () => {
      expect(detectLanguage('código')).toBe('es');
      expect(detectLanguage('análisis')).toBe('es');
      expect(detectLanguage('verificación')).toBe('es');
      expect(detectLanguage('qué es esto?')).toBe('es');
    });

    it('should default to English for empty input', () => {
      expect(detectLanguage('')).toBe('en');
      expect(detectLanguage('   ')).toBe('en');
    });

    it('should default to English for ambiguous input', () => {
      expect(detectLanguage('123')).toBe('en');
      expect(detectLanguage('!!!')).toBe('en');
      expect(detectLanguage('...')).toBe('en');
    });

    it('should handle mixed language input (Spanish wins if more signals)', () => {
      const spanish = detectLanguage('revisar el código and check quality');
      // Should be 'es' because 'revisar', 'el', and 'código' are strong Spanish signals
      expect(spanish).toBe('es');
    });

    it('should detect Spanish from verb endings', () => {
      expect(detectLanguage('trabajamos en el proyecto')).toBe('es');
      expect(detectLanguage('analizado completamente')).toBe('es');
    });
  });

  describe('getText', () => {
    const bilingualText: BilingualText = {
      en: 'Hello',
      es: 'Hola',
    };

    it('should return English text when language is "en"', () => {
      expect(getText(bilingualText, 'en')).toBe('Hello');
    });

    it('should return Spanish text when language is "es"', () => {
      expect(getText(bilingualText, 'es')).toBe('Hola');
    });

    it('should default to English when no language specified', () => {
      expect(getText(bilingualText)).toBe('Hello');
    });
  });

  describe('getTextAuto', () => {
    const bilingualText: BilingualText = {
      en: 'Review complete',
      es: 'Revisión completa',
    };

    it('should detect language from context and return appropriate text', () => {
      expect(getTextAuto(bilingualText, 'revisar código')).toBe('Revisión completa');
      expect(getTextAuto(bilingualText, 'review code')).toBe('Review complete');
    });

    it('should default to English when no context provided', () => {
      expect(getTextAuto(bilingualText)).toBe('Review complete');
    });
  });

  describe('getClarificationOptions', () => {
    it('should return 4 options in English', () => {
      const options = getClarificationOptions('en');
      expect(options).toHaveLength(4);
      expect(options[0].value).toBe('security');
      expect(options[0].label).toBe('a) Security Analysis');
      expect(options[1].value).toBe('quality');
      expect(options[2].value).toBe('performance');
      expect(options[3].value).toBe('comprehensive');
    });

    it('should return 4 options in Spanish', () => {
      const options = getClarificationOptions('es');
      expect(options).toHaveLength(4);
      expect(options[0].label).toBe('a) Análisis de Seguridad');
      expect(options[1].label).toBe('b) Calidad de Código');
      expect(options[2].label).toBe('c) Rendimiento');
      expect(options[3].label).toBe('d) Todo');
    });

    it('should include descriptions for all options', () => {
      const optionsEn = getClarificationOptions('en');
      optionsEn.forEach(option => {
        expect(option.description).toBeTruthy();
        expect(option.description.length).toBeGreaterThan(10);
      });

      const optionsEs = getClarificationOptions('es');
      optionsEs.forEach(option => {
        expect(option.description).toBeTruthy();
        expect(option.description.length).toBeGreaterThan(10);
      });
    });
  });

  describe('getClarificationMessage', () => {
    it('should return clarification message in English', () => {
      const msg = getClarificationMessage('en');
      expect(msg.message).toContain('focused analysis');
      expect(msg.question).toContain('What would you like');
    });

    it('should return clarification message in Spanish', () => {
      const msg = getClarificationMessage('es');
      expect(msg.message).toContain('análisis enfocado');
      expect(msg.question).toContain('En qué te gustaría');
    });
  });

  describe('getInvalidFocusMessage', () => {
    it('should return invalid focus message in English', () => {
      const msg = getInvalidFocusMessage('invalid', 'en');
      expect(msg.message).toContain('Invalid focus "invalid"');
      expect(msg.question).toContain('What would you like');
    });

    it('should return invalid focus message in Spanish', () => {
      const msg = getInvalidFocusMessage('invalido', 'es');
      expect(msg.message).toContain('Enfoque inválido "invalido"');
      expect(msg.question).toContain('En qué te gustaría');
    });
  });

  describe('ORCHESTRATOR_MESSAGES constants', () => {
    it('should have clarification messages', () => {
      expect(ORCHESTRATOR_MESSAGES.clarification.message.en).toBeTruthy();
      expect(ORCHESTRATOR_MESSAGES.clarification.message.es).toBeTruthy();
      expect(ORCHESTRATOR_MESSAGES.clarification.question.en).toBeTruthy();
      expect(ORCHESTRATOR_MESSAGES.clarification.question.es).toBeTruthy();
    });

    it('should have all focus options', () => {
      expect(ORCHESTRATOR_MESSAGES.focusOptions.security).toBeTruthy();
      expect(ORCHESTRATOR_MESSAGES.focusOptions.quality).toBeTruthy();
      expect(ORCHESTRATOR_MESSAGES.focusOptions.performance).toBeTruthy();
      expect(ORCHESTRATOR_MESSAGES.focusOptions.comprehensive).toBeTruthy();
    });

    it('should have bilingual labels for all focus options', () => {
      const options = ORCHESTRATOR_MESSAGES.focusOptions;
      for (const [key, value] of Object.entries(options)) {
        expect(value.label.en).toBeTruthy();
        expect(value.label.es).toBeTruthy();
        expect(value.description.en).toBeTruthy();
        expect(value.description.es).toBeTruthy();
      }
    });
  });

  describe('LANGUAGE_PATTERNS constants', () => {
    it('should have Spanish keywords', () => {
      expect(LANGUAGE_PATTERNS.spanish.keywords).toContain('revisar');
      expect(LANGUAGE_PATTERNS.spanish.keywords).toContain('código');
      expect(LANGUAGE_PATTERNS.spanish.keywords).toContain('seguridad');
    });

    it('should have English keywords', () => {
      expect(LANGUAGE_PATTERNS.english.keywords).toContain('review');
      expect(LANGUAGE_PATTERNS.english.keywords).toContain('code');
      expect(LANGUAGE_PATTERNS.english.keywords).toContain('security');
    });

    it('should have Spanish question words', () => {
      expect(LANGUAGE_PATTERNS.spanish.questionWords).toContain('qué');
      expect(LANGUAGE_PATTERNS.spanish.questionWords).toContain('cómo');
    });

    it('should have English question words', () => {
      expect(LANGUAGE_PATTERNS.english.questionWords).toContain('what');
      expect(LANGUAGE_PATTERNS.english.questionWords).toContain('how');
    });
  });
});

describe('i18n/tool-matcher', () => {
  describe('matchToolName', () => {
    it('should match English tool names', () => {
      expect(matchToolName('review_file')).toBe('review_file');
      expect(matchToolName('review')).toBe('review_file');
      expect(matchToolName('check_file')).toBe('review_file');
      expect(matchToolName('analyze_file')).toBe('review_file');
    });

    it('should match Spanish tool names', () => {
      expect(matchToolName('revisar_archivo')).toBe('review_file');
      expect(matchToolName('revisar')).toBe('review_file');
      expect(matchToolName('analizar_archivo')).toBe('review_file');
      expect(matchToolName('verificar_archivo')).toBe('review_file');
    });

    it('should be case-insensitive', () => {
      expect(matchToolName('REVIEW_FILE')).toBe('review_file');
      expect(matchToolName('Review_File')).toBe('review_file');
      expect(matchToolName('REVISAR_ARCHIVO')).toBe('review_file');
    });

    it('should handle spaces and underscores', () => {
      expect(matchToolName('review file')).toBe('review_file');
      expect(matchToolName('review-file')).toBe('review_file');
      expect(matchToolName('reviewfile')).toBe('review_file');
    });

    it('should match test generator tools', () => {
      expect(matchToolName('generate_tests')).toBe('generate_tests');
      expect(matchToolName('generar_pruebas')).toBe('generate_tests');
      expect(matchToolName('create_tests')).toBe('generate_tests');
      expect(matchToolName('crear_pruebas')).toBe('generate_tests');
    });

    it('should match security scanner tools', () => {
      expect(matchToolName('scan_file')).toBe('scan_file');
      expect(matchToolName('escanear_archivo')).toBe('scan_file');
      expect(matchToolName('security_scan')).toBe('scan_file');
      expect(matchToolName('escanear_seguridad')).toBe('scan_file');
    });

    it('should return null for unknown tool names', () => {
      expect(matchToolName('unknown_tool')).toBeNull();
      expect(matchToolName('xyz123')).toBeNull();
      expect(matchToolName('herramienta_desconocida')).toBeNull();
    });

    it('should match health check tool', () => {
      expect(matchToolName('__health')).toBe('__health');
      expect(matchToolName('health')).toBe('__health');
      expect(matchToolName('salud')).toBe('__health');
      expect(matchToolName('estado')).toBe('__health');
    });

    it('should match refactor tools', () => {
      expect(matchToolName('extract_function')).toBe('extract_function');
      expect(matchToolName('extraer_funcion')).toBe('extract_function');
      expect(matchToolName('simplify_conditionals')).toBe('simplify_conditionals');
      expect(matchToolName('simplificar_condicionales')).toBe('simplify_conditionals');
    });
  });

  describe('getToolAliases', () => {
    it('should return all aliases for a canonical tool name', () => {
      const aliases = getToolAliases('review_file');
      expect(aliases).toContain('review_file');
      expect(aliases).toContain('review');
      expect(aliases).toContain('revisar_archivo');
      expect(aliases.length).toBeGreaterThan(5);
    });

    it('should return empty array for unknown tool', () => {
      expect(getToolAliases('unknown')).toEqual([]);
    });

    it('should include both English and Spanish aliases', () => {
      const aliases = getToolAliases('generate_tests');
      expect(aliases).toContain('generate_tests');
      expect(aliases).toContain('generar_pruebas');
    });
  });

  describe('getToolDescription', () => {
    it('should return English description', () => {
      const desc = getToolDescription('review_file', 'en');
      expect(desc).toContain('Review');
      expect(desc).toContain('code file');
    });

    it('should return Spanish description', () => {
      const desc = getToolDescription('review_file', 'es');
      expect(desc).toContain('Revisar');
      expect(desc).toContain('código');
    });

    it('should return empty string for unknown tool', () => {
      expect(getToolDescription('unknown', 'en')).toBe('');
      expect(getToolDescription('unknown', 'es')).toBe('');
    });

    it('should have descriptions for all registered tools', () => {
      for (const canonical of Object.keys(TOOL_NAME_MAPPINGS)) {
        const descEn = getToolDescription(canonical, 'en');
        const descEs = getToolDescription(canonical, 'es');
        expect(descEn).toBeTruthy();
        expect(descEs).toBeTruthy();
      }
    });
  });

  describe('isValidToolName', () => {
    it('should return true for valid tool names', () => {
      expect(isValidToolName('review_file')).toBe(true);
      expect(isValidToolName('revisar_archivo')).toBe(true);
      expect(isValidToolName('generate_tests')).toBe(true);
      expect(isValidToolName('generar_pruebas')).toBe(true);
    });

    it('should return false for invalid tool names', () => {
      expect(isValidToolName('invalid_tool')).toBe(false);
      expect(isValidToolName('xyz')).toBe(false);
      expect(isValidToolName('')).toBe(false);
    });

    it('should work with different cases and formats', () => {
      expect(isValidToolName('REVIEW FILE')).toBe(true);
      expect(isValidToolName('review-file')).toBe(true);
      expect(isValidToolName('reviewfile')).toBe(true);
    });
  });

  describe('TOOL_NAME_MAPPINGS constants', () => {
    it('should have mappings for all major MCP tools', () => {
      expect(TOOL_NAME_MAPPINGS.review_file).toBeTruthy();
      expect(TOOL_NAME_MAPPINGS.generate_tests).toBeTruthy();
      expect(TOOL_NAME_MAPPINGS.analyze_architecture).toBeTruthy();
      expect(TOOL_NAME_MAPPINGS.scan_file).toBeTruthy();
      expect(TOOL_NAME_MAPPINGS.extract_function).toBeTruthy();
      expect(TOOL_NAME_MAPPINGS.generate_jsdoc).toBeTruthy();
      expect(TOOL_NAME_MAPPINGS.generate_openapi).toBeTruthy();
      expect(TOOL_NAME_MAPPINGS.design_schema).toBeTruthy();
    });

    it('should have canonical names for all mappings', () => {
      for (const [key, mapping] of Object.entries(TOOL_NAME_MAPPINGS)) {
        expect(mapping.canonical).toBe(key);
      }
    });

    it('should have aliases for all mappings', () => {
      for (const mapping of Object.values(TOOL_NAME_MAPPINGS)) {
        expect(mapping.aliases.length).toBeGreaterThan(0);
        expect(mapping.aliases).toContain(mapping.canonical);
      }
    });

    it('should have bilingual descriptions for all mappings', () => {
      for (const mapping of Object.values(TOOL_NAME_MAPPINGS)) {
        expect(mapping.description.en).toBeTruthy();
        expect(mapping.description.es).toBeTruthy();
      }
    });

    it('should have Spanish aliases for most tools', () => {
      const toolsWithSpanish = Object.values(TOOL_NAME_MAPPINGS).filter(
        mapping => mapping.aliases.some(alias =>
          alias.includes('ar') || // Spanish verb endings
          alias.includes('ción') ||
          alias.includes('ción') ||
          alias === 'salud' ||
          alias === 'estado'
        )
      );
      // Most tools should have Spanish aliases
      expect(toolsWithSpanish.length).toBeGreaterThan(10);
    });
  });

  describe('Edge cases and partial matching', () => {
    it('should handle partial matches within tolerance', () => {
      // Typos or abbreviations within 2 characters should match
      const result = matchToolName('revie'); // 1 char short of 'review'
      // This should match review_file via partial matching
      expect(result).toBeTruthy();
    });

    it('should not match if difference is too large', () => {
      const result = matchToolName('rev'); // Too short
      expect(result).toBeNull();
    });

    it('should handle empty input', () => {
      expect(matchToolName('')).toBeNull();
    });

    it('should handle whitespace-only input', () => {
      expect(matchToolName('   ')).toBeNull();
    });
  });
});
