#!/usr/bin/env node

/**
 * Skill Registry Generator
 *
 * Scans all skills in .claude/skills/ and generates:
 * 1. INDEX.md - Human-readable skill catalog
 * 2. skills.json - Machine-readable registry
 *
 * Usage:
 *   node scripts/generate-skill-index.js
 *   npm run skills:index
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILLS_DIR = path.join(__dirname, '..', '.claude', 'skills');
const OUTPUT_INDEX = path.join(SKILLS_DIR, 'INDEX.md');
const OUTPUT_JSON = path.join(SKILLS_DIR, 'skills.json');

/**
 * Parse YAML frontmatter from skill file
 */
function parseYamlFrontmatter(content) {
  // Handle both Unix (\n) and Windows (\r\n) line endings
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error('No YAML frontmatter found');
  }

  const yaml = match[1];
  const metadata = {};

  // Simple YAML parser (handles our specific format)
  const lines = yaml.split(/\r?\n/);
  for (const line of lines) {
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

  return metadata;
}

/**
 * Get file stats
 */
function getFileStats(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').length;
  const size = fs.statSync(filePath).size;

  return {
    lines,
    size,
    sizeKB: (size / 1024).toFixed(1)
  };
}

/**
 * Scan all skills
 */
function scanSkills() {
  const skills = [];
  const skillDirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const skillDir of skillDirs) {
    const skillFile = path.join(SKILLS_DIR, skillDir, 'SKILL.md');

    if (!fs.existsSync(skillFile)) {
      console.warn(`⚠️  No SKILL.md found in ${skillDir}`);
      continue;
    }

    try {
      const content = fs.readFileSync(skillFile, 'utf-8');
      const metadata = parseYamlFrontmatter(content);
      const stats = getFileStats(skillFile);

      // Check for reference files
      const referencesDir = path.join(SKILLS_DIR, skillDir, 'references');
      const hasReferences = fs.existsSync(referencesDir);
      let referenceFiles = [];

      if (hasReferences) {
        referenceFiles = fs.readdirSync(referencesDir)
          .filter(file => file.endsWith('.md'))
          .map(file => ({
            name: file,
            path: `references/${file}`,
            ...getFileStats(path.join(referencesDir, file))
          }));
      }

      skills.push({
        id: skillDir,
        ...metadata,
        stats,
        references: referenceFiles,
        path: `${skillDir}/SKILL.md`
      });

    } catch (error) {
      console.error(`❌ Error parsing ${skillDir}: ${error.message}`);
    }
  }

  return skills;
}

/**
 * Group skills by category
 */
function groupByCategory(skills) {
  const categories = {};

  for (const skill of skills) {
    const category = skill.category || 'uncategorized';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(skill);
  }

  // Sort skills within each category by name
  for (const category in categories) {
    categories[category].sort((a, b) => a.name.localeCompare(b.name));
  }

  return categories;
}

/**
 * Generate Markdown index
 */
function generateMarkdownIndex(skills) {
  const categories = groupByCategory(skills);
  const totalLines = skills.reduce((sum, s) => sum + s.stats.lines, 0);
  const totalSize = skills.reduce((sum, s) => sum + parseFloat(s.stats.sizeKB), 0);

  let markdown = `# Claude Skills Index

**Generated:** ${new Date().toISOString().split('T')[0]}
**Total Skills:** ${skills.length}
**Total Lines:** ${totalLines.toLocaleString()}
**Total Size:** ${totalSize.toFixed(1)} KB

---

## Quick Navigation

`;

  // Table of contents
  for (const category of Object.keys(categories).sort()) {
    const count = categories[category].length;
    markdown += `- [${category.charAt(0).toUpperCase() + category.slice(1)}](#${category.toLowerCase().replace(/\s+/g, '-')}) (${count})\n`;
  }

  markdown += '\n---\n\n';

  // Skills by category
  for (const [category, categorySkills] of Object.entries(categories).sort()) {
    markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;

    for (const skill of categorySkills) {
      markdown += `### ${skill.name}\n\n`;
      markdown += `**File:** [\`${skill.path}\`](${skill.path})  \n`;
      markdown += `**Version:** ${skill.version}  \n`;
      markdown += `**Size:** ${skill.stats.lines} lines (${skill.stats.sizeKB} KB)  \n`;

      if (skill['mcp-tools'] && Array.isArray(skill['mcp-tools']) && skill['mcp-tools'].length > 0) {
        markdown += `**MCP Tools:** ${skill['mcp-tools'].join(', ')}  \n`;
      }

      if (skill.tags && Array.isArray(skill.tags) && skill.tags.length > 0) {
        markdown += `**Tags:** ${skill.tags.map(t => `\`${t}\``).join(', ')}  \n`;
      }

      markdown += `\n${skill.description}\n\n`;

      // Reference files
      if (skill.references.length > 0) {
        markdown += `**References:**\n`;
        for (const ref of skill.references) {
          markdown += `- [\`${ref.name}\`](${skill.id}/${ref.path}) (${ref.lines} lines)\n`;
        }
        markdown += '\n';
      }

      markdown += '---\n\n';
    }
  }

  // Statistics
  markdown += `## Statistics\n\n`;
  markdown += `### By Category\n\n`;
  markdown += `| Category | Skills | Total Lines | Avg Lines |\n`;
  markdown += `|----------|--------|-------------|----------|\n`;

  for (const [category, categorySkills] of Object.entries(categories).sort()) {
    const totalCatLines = categorySkills.reduce((sum, s) => sum + s.stats.lines, 0);
    const avgLines = Math.round(totalCatLines / categorySkills.length);
    markdown += `| ${category} | ${categorySkills.length} | ${totalCatLines.toLocaleString()} | ${avgLines} |\n`;
  }

  markdown += `\n### Tag Cloud\n\n`;
  const tagCount = {};
  for (const skill of skills) {
    if (skill.tags && Array.isArray(skill.tags)) {
      for (const tag of skill.tags) {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      }
    }
  }

  const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
  for (const [tag, count] of sortedTags) {
    markdown += `\`${tag}\` (${count}) • `;
  }
  markdown += '\n\n';

  markdown += `---\n\n`;
  markdown += `*Generated by \`scripts/generate-skill-index.js\`*\n`;

  return markdown;
}

/**
 * Generate JSON registry
 */
function generateJsonRegistry(skills) {
  return {
    generated: new Date().toISOString(),
    version: '1.0.0',
    totalSkills: skills.length,
    skills: skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      version: skill.version,
      category: skill.category,
      tags: skill.tags || [],
      mcpTools: skill['mcp-tools'] || [],
      author: skill.author,
      path: skill.path,
      stats: {
        lines: skill.stats.lines,
        sizeKB: parseFloat(skill.stats.sizeKB)
      },
      references: skill.references.map(ref => ({
        name: ref.name,
        path: `${skill.id}/${ref.path}`,
        lines: ref.lines
      }))
    }))
  };
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Scanning skills...\n');

  const skills = scanSkills();
  console.log(`✅ Found ${skills.length} skills\n`);

  console.log('📝 Generating INDEX.md...');
  const markdown = generateMarkdownIndex(skills);
  fs.writeFileSync(OUTPUT_INDEX, markdown, 'utf-8');
  console.log(`✅ Created ${OUTPUT_INDEX}\n`);

  console.log('📦 Generating skills.json...');
  const json = generateJsonRegistry(skills);
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`✅ Created ${OUTPUT_JSON}\n`);

  console.log('📊 Summary:');
  console.log(`   Skills: ${skills.length}`);
  console.log(`   Categories: ${Object.keys(groupByCategory(skills)).length}`);
  console.log(`   Total Lines: ${skills.reduce((sum, s) => sum + s.stats.lines, 0).toLocaleString()}`);
  console.log(`   Total Size: ${skills.reduce((sum, s) => sum + parseFloat(s.stats.sizeKB), 0).toFixed(1)} KB`);

  console.log('\n✅ Skill index generation complete!\n');
}

main();
