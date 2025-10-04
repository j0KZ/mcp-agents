/**
 * MCP selection prompt
 */
import { getRecommendedMCPs } from '../detectors/project.js';
export function mcpPrompt(project) {
    const recommended = getRecommendedMCPs(project);
    return {
        type: 'checkbox',
        name: 'mcps',
        message: 'Which MCP tools do you want? (Space to select, Enter to continue)',
        choices: [
            {
                name: 'Smart Reviewer (code quality analysis)',
                value: 'smart-reviewer',
                checked: recommended.includes('smart-reviewer')
            },
            {
                name: 'Security Scanner (vulnerability scanning)',
                value: 'security-scanner',
                checked: recommended.includes('security-scanner')
            },
            {
                name: 'Test Generator (auto-generate tests)',
                value: 'test-generator',
                checked: recommended.includes('test-generator')
            },
            {
                name: 'Architecture Analyzer (dependency analysis)',
                value: 'architecture-analyzer',
                checked: recommended.includes('architecture-analyzer')
            },
            {
                name: 'Refactor Assistant (code improvements)',
                value: 'refactor-assistant',
                checked: false
            },
            {
                name: 'API Designer (REST/GraphQL design)',
                value: 'api-designer',
                checked: recommended.includes('api-designer')
            },
            {
                name: 'DB Schema Designer (database design)',
                value: 'db-schema',
                checked: recommended.includes('db-schema')
            },
            {
                name: 'Doc Generator (documentation)',
                value: 'doc-generator',
                checked: false
            }
        ],
        validate: (answer) => {
            if (answer.length < 1) {
                return 'You must select at least one MCP tool.';
            }
            return true;
        }
    };
}
//# sourceMappingURL=mcp-select.js.map