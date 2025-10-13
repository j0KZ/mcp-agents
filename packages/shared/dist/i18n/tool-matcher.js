/**
 * Language-Agnostic Tool Name Matching
 * Supports Spanish and English tool names
 * Maps natural language commands to canonical tool names
 */
/**
 * Tool name mappings for all MCP tools
 * Supports Spanish and English variations
 */
export const TOOL_NAME_MAPPINGS = {
    // Smart Reviewer Tools
    review_file: {
        canonical: 'review_file',
        aliases: [
            // English
            'review_file',
            'review',
            'reviewfile',
            'check_file',
            'checkfile',
            'analyze_file',
            'analyzefile',
            // Spanish
            'revisar_archivo',
            'revisar',
            'revisararchivo',
            'analizar_archivo',
            'analizararchivo',
            'verificar_archivo',
            'verificararchivo',
            'chequear_archivo',
            'chequeararchivo',
        ],
        description: {
            en: 'Review a code file for quality issues',
            es: 'Revisar un archivo de código para problemas de calidad',
        },
    },
    batch_review: {
        canonical: 'batch_review',
        aliases: [
            'batch_review',
            'review_multiple',
            'reviewmultiple',
            'revisar_varios',
            'revisarvarios',
            'revisar_multiples',
            'revisarmultiples',
        ],
        description: {
            en: 'Review multiple files at once',
            es: 'Revisar varios archivos a la vez',
        },
    },
    generate_auto_fixes: {
        canonical: 'generate_auto_fixes',
        aliases: [
            'generate_auto_fixes',
            'autofix',
            'autofixes',
            'suggest_fixes',
            'suggestfixes',
            'generar_correcciones',
            'generarcorrecciones',
            'correciones_automaticas',
            'correcciones',
        ],
        description: {
            en: 'Generate automatic fixes for code issues',
            es: 'Generar correcciones automáticas para problemas de código',
        },
    },
    apply_auto_fixes: {
        canonical: 'apply_auto_fixes',
        aliases: [
            'apply_auto_fixes',
            'apply_fixes',
            'applyautofixes',
            'fix',
            'aplicar_correcciones',
            'aplicarcorrecciones',
            'corregir',
            'arreglar',
        ],
        description: {
            en: 'Apply automatic fixes to a file',
            es: 'Aplicar correcciones automáticas a un archivo',
        },
    },
    // Test Generator Tools
    generate_tests: {
        canonical: 'generate_tests',
        aliases: [
            'generate_tests',
            'generatetests',
            'create_tests',
            'createtests',
            'write_tests',
            'writetests',
            'generar_pruebas',
            'generarpruebas',
            'crear_pruebas',
            'crearpruebas',
            'escribir_pruebas',
            'generar_tests',
            'crear_tests',
        ],
        description: {
            en: 'Generate test suite for a source file',
            es: 'Generar suite de pruebas para un archivo fuente',
        },
    },
    write_test_file: {
        canonical: 'write_test_file',
        aliases: [
            'write_test_file',
            'writetestfile',
            'save_tests',
            'savetests',
            'escribir_archivo_prueba',
            'escribirarchivoprueba',
            'guardar_pruebas',
            'guardarpruebas',
        ],
        description: {
            en: 'Write tests directly to a file',
            es: 'Escribir pruebas directamente a un archivo',
        },
    },
    // Architecture Analyzer Tools
    analyze_architecture: {
        canonical: 'analyze_architecture',
        aliases: [
            'analyze_architecture',
            'analyzearchitecture',
            'analyze_project',
            'analyzeproject',
            'analizar_arquitectura',
            'analizararquitectura',
            'analizar_proyecto',
            'analizarproyecto',
        ],
        description: {
            en: 'Analyze project architecture and dependencies',
            es: 'Analizar arquitectura y dependencias del proyecto',
        },
    },
    find_circular_deps: {
        canonical: 'find_circular_deps',
        aliases: [
            'find_circular_deps',
            'findcirculardeps',
            'circular_dependencies',
            'circulardependencies',
            'encontrar_dependencias_circulares',
            'dependencias_circulares',
            'buscar_ciclos',
        ],
        description: {
            en: 'Find circular dependencies in project',
            es: 'Encontrar dependencias circulares en el proyecto',
        },
    },
    // Security Scanner Tools
    scan_file: {
        canonical: 'scan_file',
        aliases: [
            'scan_file',
            'scanfile',
            'security_scan',
            'securityscan',
            'check_security',
            'checksecurity',
            'escanear_archivo',
            'escaneararchivo',
            'escanear_seguridad',
            'escanearseguridad',
            'verificar_seguridad',
            'verificarseguridad',
        ],
        description: {
            en: 'Scan file for security vulnerabilities',
            es: 'Escanear archivo en busca de vulnerabilidades de seguridad',
        },
    },
    scan_project: {
        canonical: 'scan_project',
        aliases: [
            'scan_project',
            'scanproject',
            'security_audit',
            'securityaudit',
            'escanear_proyecto',
            'escanearproyecto',
            'auditoria_seguridad',
            'auditoriaseguridad',
        ],
        description: {
            en: 'Scan entire project for security issues',
            es: 'Escanear proyecto completo en busca de problemas de seguridad',
        },
    },
    // Refactor Assistant Tools
    extract_function: {
        canonical: 'extract_function',
        aliases: [
            'extract_function',
            'extractfunction',
            'extract',
            'extraer_funcion',
            'extraerfuncion',
            'extraer',
        ],
        description: {
            en: 'Extract code block into a function',
            es: 'Extraer bloque de código en una función',
        },
    },
    simplify_conditionals: {
        canonical: 'simplify_conditionals',
        aliases: [
            'simplify_conditionals',
            'simplifyconditionals',
            'simplify',
            'simplificar_condicionales',
            'simplificarcondicionales',
            'simplificar',
        ],
        description: {
            en: 'Simplify nested conditionals',
            es: 'Simplificar condicionales anidados',
        },
    },
    rename_variable: {
        canonical: 'rename_variable',
        aliases: [
            'rename_variable',
            'renamevariable',
            'rename',
            'renombrar_variable',
            'renombrarvariable',
            'renombrar',
        ],
        description: {
            en: 'Rename variable throughout code',
            es: 'Renombrar variable en todo el código',
        },
    },
    // Doc Generator Tools
    generate_jsdoc: {
        canonical: 'generate_jsdoc',
        aliases: [
            'generate_jsdoc',
            'generatejsdoc',
            'jsdoc',
            'document',
            'generar_jsdoc',
            'generarjsdoc',
            'documentar',
        ],
        description: {
            en: 'Generate JSDoc comments',
            es: 'Generar comentarios JSDoc',
        },
    },
    generate_readme: {
        canonical: 'generate_readme',
        aliases: [
            'generate_readme',
            'generatereadme',
            'readme',
            'create_readme',
            'generar_readme',
            'generarreadme',
            'crear_readme',
        ],
        description: {
            en: 'Generate README documentation',
            es: 'Generar documentación README',
        },
    },
    // API Designer Tools
    generate_openapi: {
        canonical: 'generate_openapi',
        aliases: [
            'generate_openapi',
            'generateopenapi',
            'openapi',
            'generar_openapi',
            'generaropenapi',
        ],
        description: {
            en: 'Generate OpenAPI specification',
            es: 'Generar especificación OpenAPI',
        },
    },
    design_rest_api: {
        canonical: 'design_rest_api',
        aliases: [
            'design_rest_api',
            'designrestapi',
            'rest_api',
            'restapi',
            'disenar_api_rest',
            'disenarapirest',
            'api_rest',
            'apirest',
        ],
        description: {
            en: 'Design RESTful API',
            es: 'Diseñar API RESTful',
        },
    },
    // DB Schema Tools
    design_schema: {
        canonical: 'design_schema',
        aliases: [
            'design_schema',
            'designschema',
            'create_schema',
            'createschema',
            'disenar_esquema',
            'disenaresquema',
            'crear_esquema',
            'crearesquema',
        ],
        description: {
            en: 'Design database schema',
            es: 'Diseñar esquema de base de datos',
        },
    },
    generate_migration: {
        canonical: 'generate_migration',
        aliases: [
            'generate_migration',
            'generatemigration',
            'migration',
            'create_migration',
            'generar_migracion',
            'generarmigracion',
            'migracion',
            'crear_migracion',
        ],
        description: {
            en: 'Generate database migration',
            es: 'Generar migración de base de datos',
        },
    },
    // Health Check (Universal)
    __health: {
        canonical: '__health',
        aliases: [
            '__health',
            'health',
            'health_check',
            'healthcheck',
            'status',
            'diagnostics',
            'salud',
            'estado',
            'diagnosticos',
            'verificar_estado',
        ],
        description: {
            en: 'Check MCP server health status',
            es: 'Verificar estado de salud del servidor MCP',
        },
    },
};
/**
 * Match user input to canonical tool name
 * Case-insensitive, handles Spanish and English
 */
export function matchToolName(input) {
    // Normalize input: lowercase, remove spaces and underscores
    const normalized = input.toLowerCase().replace(/[\s_-]/g, '');
    // Try exact match first (after normalization)
    for (const [canonical, mapping] of Object.entries(TOOL_NAME_MAPPINGS)) {
        for (const alias of mapping.aliases) {
            const normalizedAlias = alias.toLowerCase().replace(/[\s_-]/g, '');
            if (normalizedAlias === normalized) {
                return canonical;
            }
        }
    }
    // Try partial match (input contains alias or alias contains input)
    for (const [canonical, mapping] of Object.entries(TOOL_NAME_MAPPINGS)) {
        for (const alias of mapping.aliases) {
            const normalizedAlias = alias.toLowerCase().replace(/[\s_-]/g, '');
            if (normalized.includes(normalizedAlias) || normalizedAlias.includes(normalized)) {
                if (Math.abs(normalized.length - normalizedAlias.length) < 3) {
                    return canonical;
                }
            }
        }
    }
    return null;
}
/**
 * Get all aliases for a canonical tool name
 */
export function getToolAliases(canonical) {
    return TOOL_NAME_MAPPINGS[canonical]?.aliases || [];
}
/**
 * Get tool description in specific language
 */
export function getToolDescription(canonical, language) {
    return TOOL_NAME_MAPPINGS[canonical]?.description[language] || '';
}
/**
 * Check if a tool name exists (in any language)
 */
export function isValidToolName(name) {
    return matchToolName(name) !== null;
}
//# sourceMappingURL=tool-matcher.js.map