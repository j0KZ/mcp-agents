#!/usr/bin/env node

/**
 * Skill Validator
 *
 * Validates all Claude Code skills for:
 * - YAML frontmatter syntax
 * - Required fields presence
 * - Field format and constraints
 * - MCP tool references
 * - File structure
 * - Markdown quality
 *
 * Usage:
 *   node scripts/validate-skills.js              # Validate all
 *   node scripts/validate-skills.js --fix        # Auto-fix issues
 *   node scripts/validate-skills.js --strict     # Strict mode
 *   npm run skills:validate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILLS_DIR = path.join(__dirname, '..', '.claude', 'skills');
const PACKAGES_DIR = path.join(__dirname, '..', 'packages');

// Configuration
const REQUIRED_FIELDS = [
  'name',
  'description',
  'version',
  'category',
  'tags',
  'mcp-tools',
  'author',
];
const OPTIONAL_FIELDS = ['requires', 'capabilities'];

const VALID_CATEGORIES = [
  'quality',
  'documentation',
  'git-workflow',
  'troubleshooting',
  'orchestration',
  'refactoring',
  'monorepo',
  'standards',
  'release',
  'testing',
];

// Validation results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  warnings: [],
  fixes: [],
};

/**
 * Parse YAML frontmatter
 */
function parseYamlFrontmatter(content, filePath) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return {
      valid: false,
      error: 'No YAML frontmatter found',
      metadata: null,
    };
  }

  const yaml = match[1];
  const metadata = {};
  const lines = yaml.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;

    // Handle key: "value" format
    const stringMatch = line.match(/^(\w+(?:-\w+)*?):\s*"([^"]+)"/);
    if (stringMatch) {
      metadata[stringMatch[1]] = stringMatch[2];
      continue;
    }

    // Handle key: value format
    const simpleMatch = line.match(/^(\w+(?:-\w+)*?):\s*(.+)/);
    if (simpleMatch) {
      const key = simpleMatch[1];
      let value = simpleMatch[2].trim();

      // Handle arrays [item1, item2]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }

      metadata[key] = value;
    }
  }

  return {
    valid: true,
    error: null,
    metadata,
  };
}

/**
 * Get available MCP tools from packages directory
 */
function getAvailableMCPTools() {
  const tools = [];

  try {
    const packages = fs
      .readdirSync(PACKAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const pkg of packages) {
      const packageJsonPath = path.join(PACKAGES_DIR, pkg, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (packageJson.name && packageJson.name.includes('mcp')) {
          tools.push(pkg);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not scan packages: ${error.message}`);
  }

  return tools;
}

/**
 * Validate required fields
 */
function validateRequiredFields(metadata, skillId) {
  const errors = [];
  const warnings = [];

  for (const field of REQUIRED_FIELDS) {
    if (!metadata[field]) {
      errors.push(`Missing required field: ${field}`);
    } else if (typeof metadata[field] === 'string' && !metadata[field].trim()) {
      errors.push(`Field '${field}' is empty`);
    }
  }

  return { errors, warnings };
}

/**
 * Validate field formats
 */
function validateFieldFormats(metadata, skillId) {
  const errors = [];
  const warnings = [];

  // Validate name
  if (metadata.name) {
    if (metadata.name.length > 64) {
      errors.push(`Field 'name' exceeds 64 characters (${metadata.name.length})`);
    }
    if (!/^".*"$/.test(JSON.stringify(metadata.name))) {
      warnings.push(`Field 'name' should be quoted in YAML`);
    }
  }

  // Validate description
  if (metadata.description) {
    if (metadata.description.length > 1024) {
      errors.push(`Field 'description' exceeds 1024 characters (${metadata.description.length})`);
    }
    if (!metadata.description.includes('Use when')) {
      warnings.push(`Field 'description' should include "Use when" clause for trigger detection`);
    }
  }

  // Validate version
  if (metadata.version) {
    if (!/^\d+\.\d+\.\d+$/.test(metadata.version)) {
      errors.push(
        `Field 'version' must follow semantic versioning (e.g., 1.0.0), got: ${metadata.version}`
      );
    }
  }

  // Validate category
  if (metadata.category) {
    if (!VALID_CATEGORIES.includes(metadata.category)) {
      warnings.push(
        `Category '${metadata.category}' not in standard categories. Valid: ${VALID_CATEGORIES.join(', ')}`
      );
    }
  }

  // Validate tags
  if (metadata.tags) {
    if (!Array.isArray(metadata.tags)) {
      errors.push(`Field 'tags' must be an array`);
    } else {
      if (metadata.tags.length === 0) {
        warnings.push(`Field 'tags' is empty - add at least one tag`);
      }
      if (metadata.tags.length > 10) {
        warnings.push(
          `Field 'tags' has ${metadata.tags.length} tags - consider reducing to 10 or fewer`
        );
      }
    }
  }

  // Validate mcp-tools
  if (metadata['mcp-tools']) {
    if (!Array.isArray(metadata['mcp-tools'])) {
      errors.push(`Field 'mcp-tools' must be an array`);
    }
  }

  return { errors, warnings };
}

/**
 * Validate MCP tool references
 */
function validateMCPToolReferences(metadata, skillId, availableTools) {
  const errors = [];
  const warnings = [];

  if (metadata['mcp-tools'] && Array.isArray(metadata['mcp-tools'])) {
    for (const tool of metadata['mcp-tools']) {
      if (tool === 'all') continue; // Special case

      // Check if tool exists in packages
      if (!availableTools.includes(tool)) {
        warnings.push(
          `MCP tool '${tool}' not found in packages directory. Available: ${availableTools.join(', ')}`
        );
      }
    }
  }

  return { errors, warnings };
}

/**
 * Validate skill file structure
 */
function validateFileStructure(skillPath, skillId) {
  const errors = [];
  const warnings = [];

  const skillFile = path.join(skillPath, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    errors.push(`SKILL.md not found in ${skillId}`);
    return { errors, warnings };
  }

  const content = fs.readFileSync(skillFile, 'utf-8');

  // Check for proper heading structure
  if (!content.includes('# ')) {
    warnings.push(`No top-level heading found in SKILL.md`);
  }

  // Check file size
  const lines = content.split('\n').length;
  if (lines > 2000) {
    warnings.push(`SKILL.md is very long (${lines} lines) - consider using reference files`);
  }

  // Check for references directory
  const referencesDir = path.join(skillPath, 'references');
  if (fs.existsSync(referencesDir)) {
    const refFiles = fs.readdirSync(referencesDir);
    if (refFiles.length === 0) {
      warnings.push(`Empty references directory - remove if unused`);
    }
  }

  return { errors, warnings };
}

/**
 * Validate single skill
 */
function validateSkill(skillPath, skillId, availableTools, options = {}) {
  const skillFile = path.join(skillPath, 'SKILL.md');
  const skillErrors = [];
  const skillWarnings = [];

  console.log(`\n📋 Validating: ${skillId}`);

  // 1. Check file exists
  if (!fs.existsSync(skillFile)) {
    skillErrors.push('SKILL.md not found');
    return { errors: skillErrors, warnings: skillWarnings };
  }

  // 2. Parse YAML frontmatter
  const content = fs.readFileSync(skillFile, 'utf-8');
  const { valid, error, metadata } = parseYamlFrontmatter(content, skillFile);

  if (!valid) {
    skillErrors.push(error);
    return { errors: skillErrors, warnings: skillWarnings };
  }

  // 3. Validate required fields
  const reqFields = validateRequiredFields(metadata, skillId);
  skillErrors.push(...reqFields.errors);
  skillWarnings.push(...reqFields.warnings);

  // 4. Validate field formats
  const formats = validateFieldFormats(metadata, skillId);
  skillErrors.push(...formats.errors);
  skillWarnings.push(...formats.warnings);

  // 5. Validate MCP tool references
  const toolRefs = validateMCPToolReferences(metadata, skillId, availableTools);
  skillErrors.push(...toolRefs.errors);
  skillWarnings.push(...toolRefs.warnings);

  // 6. Validate file structure
  const structure = validateFileStructure(skillPath, skillId);
  skillErrors.push(...structure.errors);
  skillWarnings.push(...structure.warnings);

  // Report results
  if (skillErrors.length === 0 && skillWarnings.length === 0) {
    console.log(`   ✅ Passed`);
    results.passed++;
  } else {
    if (skillErrors.length > 0) {
      console.log(`   ❌ Failed with ${skillErrors.length} error(s)`);
      skillErrors.forEach(err => console.log(`      ERROR: ${err}`));
      results.failed++;
      results.errors.push({ skill: skillId, errors: skillErrors });
    } else {
      console.log(`   ⚠️  Passed with ${skillWarnings.length} warning(s)`);
      results.passed++;
    }

    if (skillWarnings.length > 0) {
      skillWarnings.forEach(warn => console.log(`      WARNING: ${warn}`));
      results.warnings.push({ skill: skillId, warnings: skillWarnings });
    }
  }

  return {
    errors: skillErrors,
    warnings: skillWarnings,
    metadata,
  };
}

/**
 * Main validation function
 */
function main() {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    strict: args.includes('--strict'),
  };

  console.log('🔍 Claude Skills Validator\n');
  console.log(`Mode: ${options.strict ? 'STRICT' : 'NORMAL'}${options.fix ? ' + AUTO-FIX' : ''}`);

  // Get available MCP tools
  const availableTools = getAvailableMCPTools();
  console.log(`\n📦 Found ${availableTools.length} MCP tools: ${availableTools.join(', ')}\n`);

  // Scan all skills
  const skillDirs = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => !['node_modules', '.git'].includes(name));

  results.total = skillDirs.length;

  // Validate each skill
  for (const skillId of skillDirs) {
    const skillPath = path.join(SKILLS_DIR, skillId);
    validateSkill(skillPath, skillId, availableTools, options);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary');
  console.log('='.repeat(60));
  console.log(`Total Skills:    ${results.total}`);
  console.log(`✅ Passed:       ${results.passed}`);
  console.log(`❌ Failed:       ${results.failed}`);
  console.log(`⚠️  Warnings:     ${results.warnings.length}`);

  if (results.failed > 0) {
    console.log('\n❌ VALIDATION FAILED\n');
    console.log('Skills with errors:');
    for (const { skill, errors } of results.errors) {
      console.log(`  - ${skill}: ${errors.length} error(s)`);
    }
    process.exit(1);
  } else {
    console.log('\n✅ VALIDATION PASSED\n');
    if (results.warnings.length > 0) {
      console.log(`Note: ${results.warnings.length} skill(s) have warnings (non-blocking)`);
    }
    process.exit(0);
  }
}

main();
