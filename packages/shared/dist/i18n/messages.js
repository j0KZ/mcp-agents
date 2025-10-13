/**
 * Bilingual Messages for MCP Tools
 * Supports English and Spanish for frictionless international usage
 */
/**
 * Orchestrator workflow messages
 */
export const ORCHESTRATOR_MESSAGES = {
    clarification: {
        message: {
            en: 'To provide focused analysis, I need to know what aspect to check.',
            es: 'Para proporcionar un análisis enfocado, necesito saber qué aspecto verificar.',
        },
        question: {
            en: 'What would you like me to focus on?',
            es: '¿En qué te gustaría que me enfocara?',
        },
    },
    invalidFocus: {
        message: {
            en: (focus) => `Invalid focus "${focus}". Please choose from valid options.`,
            es: (focus) => `Enfoque inválido "${focus}". Por favor elige entre las opciones válidas.`,
        },
        question: {
            en: 'What would you like me to focus on?',
            es: '¿En qué te gustaría que me enfocara?',
        },
    },
    focusOptions: {
        security: {
            label: {
                en: 'a) Security Analysis',
                es: 'a) Análisis de Seguridad',
            },
            description: {
                en: 'Fast security scan for vulnerabilities (uses pre-commit workflow)',
                es: 'Escaneo rápido de seguridad para vulnerabilidades (usa flujo pre-commit)',
            },
        },
        quality: {
            label: {
                en: 'b) Code Quality',
                es: 'b) Calidad de Código',
            },
            description: {
                en: 'Review with complexity and test coverage (uses pre-merge workflow)',
                es: 'Revisión con complejidad y cobertura de tests (usa flujo pre-merge)',
            },
        },
        performance: {
            label: {
                en: 'c) Performance',
                es: 'c) Rendimiento',
            },
            description: {
                en: 'Architecture analysis and bottleneck detection (uses quality-audit workflow)',
                es: 'Análisis de arquitectura y detección de cuellos de botella (usa flujo quality-audit)',
            },
        },
        comprehensive: {
            label: {
                en: 'd) Everything',
                es: 'd) Todo',
            },
            description: {
                en: 'Complete analysis across all areas (uses pre-merge workflow)',
                es: 'Análisis completo en todas las áreas (usa flujo pre-merge)',
            },
        },
    },
};
/**
 * Language detection patterns
 */
export const LANGUAGE_PATTERNS = {
    spanish: {
        // Common Spanish words and phrases
        keywords: [
            'revisar',
            'analizar',
            'escanear',
            'verificar',
            'código',
            'seguridad',
            'calidad',
            'rendimiento',
            'todo',
            'archivo',
            'proyecto',
            'pruebas',
            'documentación',
            'refactorizar',
            'optimizar',
            'mi',
            'el',
            'la',
            'los',
            'las',
            'qué',
            'cómo',
            'dónde',
            'cuándo',
            'por qué',
        ],
        // Common Spanish question words
        questionWords: ['qué', 'cómo', 'dónde', 'cuándo', 'por qué', 'cuál', 'quién'],
    },
    english: {
        // Common English words
        keywords: [
            'review',
            'analyze',
            'scan',
            'check',
            'verify',
            'code',
            'security',
            'quality',
            'performance',
            'everything',
            'file',
            'project',
            'tests',
            'documentation',
            'refactor',
            'optimize',
            'my',
            'the',
            'what',
            'how',
            'where',
            'when',
            'why',
        ],
        questionWords: ['what', 'how', 'where', 'when', 'why', 'which', 'who'],
    },
};
/**
 * Detect language from user input
 * Returns 'es' for Spanish, 'en' for English (default)
 */
export function detectLanguage(input) {
    if (!input || input.trim().length === 0) {
        return 'en'; // Default to English
    }
    const normalized = input.toLowerCase().trim();
    // Count Spanish indicators
    let spanishScore = 0;
    let englishScore = 0;
    // Check for Spanish keywords
    for (const keyword of LANGUAGE_PATTERNS.spanish.keywords) {
        if (normalized.includes(keyword)) {
            spanishScore += keyword.length > 4 ? 2 : 1; // Longer words = stronger signal
        }
    }
    // Check for English keywords
    for (const keyword of LANGUAGE_PATTERNS.english.keywords) {
        if (normalized.includes(keyword)) {
            englishScore += keyword.length > 4 ? 2 : 1;
        }
    }
    // Spanish-specific characters (ñ, á, é, í, ó, ú, ü)
    const spanishChars = /[ñáéíóúü]/;
    if (spanishChars.test(normalized)) {
        spanishScore += 5; // Strong indicator
    }
    // Common Spanish verbs endings (-ar, -er, -ir conjugations)
    const spanishVerbEndings = /(amos|áis|emos|éis|imos|ís|aba|ían|ado|ido)$/;
    const words = normalized.split(/\s+/);
    for (const word of words) {
        if (spanishVerbEndings.test(word)) {
            spanishScore += 3;
        }
    }
    // Return Spanish if Spanish score is significantly higher
    return spanishScore > englishScore ? 'es' : 'en';
}
/**
 * Get text in detected or specified language
 */
export function getText(text, language) {
    const lang = language || 'en';
    return text[lang];
}
/**
 * Get text with automatic language detection from context
 */
export function getTextAuto(text, context) {
    const lang = context ? detectLanguage(context) : 'en';
    return text[lang];
}
/**
 * Format bilingual clarification options
 */
export function getClarificationOptions(language) {
    const options = ORCHESTRATOR_MESSAGES.focusOptions;
    return [
        {
            value: 'security',
            label: getText(options.security.label, language),
            description: getText(options.security.description, language),
        },
        {
            value: 'quality',
            label: getText(options.quality.label, language),
            description: getText(options.quality.description, language),
        },
        {
            value: 'performance',
            label: getText(options.performance.label, language),
            description: getText(options.performance.description, language),
        },
        {
            value: 'comprehensive',
            label: getText(options.comprehensive.label, language),
            description: getText(options.comprehensive.description, language),
        },
    ];
}
/**
 * Format clarification message
 */
export function getClarificationMessage(language) {
    return {
        message: getText(ORCHESTRATOR_MESSAGES.clarification.message, language),
        question: getText(ORCHESTRATOR_MESSAGES.clarification.question, language),
    };
}
/**
 * Format invalid focus message
 */
export function getInvalidFocusMessage(invalidFocus, language) {
    const msgFunc = ORCHESTRATOR_MESSAGES.invalidFocus.message[language];
    return {
        message: msgFunc(invalidFocus),
        question: getText(ORCHESTRATOR_MESSAGES.invalidFocus.question, language),
    };
}
//# sourceMappingURL=messages.js.map