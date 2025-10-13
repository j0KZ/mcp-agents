/**
 * Bilingual Messages for MCP Tools
 * Supports English and Spanish for frictionless international usage
 */
export type Language = 'en' | 'es';
export interface BilingualText {
    en: string;
    es: string;
}
/**
 * Orchestrator workflow messages
 */
export declare const ORCHESTRATOR_MESSAGES: {
    readonly clarification: {
        readonly message: {
            readonly en: "To provide focused analysis, I need to know what aspect to check.";
            readonly es: "Para proporcionar un análisis enfocado, necesito saber qué aspecto verificar.";
        };
        readonly question: {
            readonly en: "What would you like me to focus on?";
            readonly es: "¿En qué te gustaría que me enfocara?";
        };
    };
    readonly invalidFocus: {
        readonly message: {
            readonly en: (focus: string) => string;
            readonly es: (focus: string) => string;
        };
        readonly question: {
            readonly en: "What would you like me to focus on?";
            readonly es: "¿En qué te gustaría que me enfocara?";
        };
    };
    readonly focusOptions: {
        readonly security: {
            readonly label: {
                readonly en: "a) Security Analysis";
                readonly es: "a) Análisis de Seguridad";
            };
            readonly description: {
                readonly en: "Fast security scan for vulnerabilities (uses pre-commit workflow)";
                readonly es: "Escaneo rápido de seguridad para vulnerabilidades (usa flujo pre-commit)";
            };
        };
        readonly quality: {
            readonly label: {
                readonly en: "b) Code Quality";
                readonly es: "b) Calidad de Código";
            };
            readonly description: {
                readonly en: "Review with complexity and test coverage (uses pre-merge workflow)";
                readonly es: "Revisión con complejidad y cobertura de tests (usa flujo pre-merge)";
            };
        };
        readonly performance: {
            readonly label: {
                readonly en: "c) Performance";
                readonly es: "c) Rendimiento";
            };
            readonly description: {
                readonly en: "Architecture analysis and bottleneck detection (uses quality-audit workflow)";
                readonly es: "Análisis de arquitectura y detección de cuellos de botella (usa flujo quality-audit)";
            };
        };
        readonly comprehensive: {
            readonly label: {
                readonly en: "d) Everything";
                readonly es: "d) Todo";
            };
            readonly description: {
                readonly en: "Complete analysis across all areas (uses pre-merge workflow)";
                readonly es: "Análisis completo en todas las áreas (usa flujo pre-merge)";
            };
        };
    };
};
/**
 * Language detection patterns
 */
export declare const LANGUAGE_PATTERNS: {
    readonly spanish: {
        readonly keywords: readonly ["revisar", "analizar", "escanear", "verificar", "código", "seguridad", "calidad", "rendimiento", "todo", "archivo", "proyecto", "pruebas", "documentación", "refactorizar", "optimizar", "mi", "el", "la", "los", "las", "qué", "cómo", "dónde", "cuándo", "por qué"];
        readonly questionWords: readonly ["qué", "cómo", "dónde", "cuándo", "por qué", "cuál", "quién"];
    };
    readonly english: {
        readonly keywords: readonly ["review", "analyze", "scan", "check", "verify", "code", "security", "quality", "performance", "everything", "file", "project", "tests", "documentation", "refactor", "optimize", "my", "the", "what", "how", "where", "when", "why"];
        readonly questionWords: readonly ["what", "how", "where", "when", "why", "which", "who"];
    };
};
/**
 * Detect language from user input
 * Returns 'es' for Spanish, 'en' for English (default)
 */
export declare function detectLanguage(input: string): Language;
/**
 * Get text in detected or specified language
 */
export declare function getText(text: BilingualText, language?: Language): string;
/**
 * Get text with automatic language detection from context
 */
export declare function getTextAuto(text: BilingualText, context?: string): string;
/**
 * Format bilingual clarification options
 */
export declare function getClarificationOptions(language: Language): {
    value: string;
    label: string;
    description: string;
}[];
/**
 * Format clarification message
 */
export declare function getClarificationMessage(language: Language): {
    message: string;
    question: string;
};
/**
 * Format invalid focus message
 */
export declare function getInvalidFocusMessage(invalidFocus: string, language: Language): {
    message: string;
    question: string;
};
//# sourceMappingURL=messages.d.ts.map