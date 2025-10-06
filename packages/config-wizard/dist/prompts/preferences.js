/**
 * Preferences prompts
 */
export function preferencesPrompt(detected) {
    const prompts = [];
    // Code review severity
    prompts.push({
        type: 'list',
        name: 'reviewSeverity',
        message: 'Code review severity:',
        choices: [
            { name: 'Lenient (minimal noise)', value: 'lenient' },
            { name: 'Moderate (balanced)', value: 'moderate' },
            { name: 'Strict (catch everything)', value: 'strict' },
        ],
        default: 'moderate',
        when: (answers) => answers.mcps.includes('smart-reviewer'),
    });
    // Test framework (if not detected)
    if (!detected.testFramework) {
        prompts.push({
            type: 'list',
            name: 'testFramework',
            message: 'Select test framework:',
            choices: [
                { name: 'Jest', value: 'jest' },
                { name: 'Vitest', value: 'vitest' },
                { name: 'Mocha', value: 'mocha' },
                { name: 'Ava', value: 'ava' },
                { name: 'Skip (no tests)', value: null },
            ],
            when: (answers) => answers.mcps.includes('test-generator'),
        });
    }
    // Install globally option
    prompts.push({
        type: 'confirm',
        name: 'installGlobally',
        message: 'Install MCP packages globally? (Recommended for faster startup)',
        default: true,
    });
    return prompts;
}
//# sourceMappingURL=preferences.js.map