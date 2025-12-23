#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '../starter-kit/template/.claude/skills');

function fixSkillYaml(skillPath) {
  const skillMdPath = path.join(skillPath, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) return null;

  let content = fs.readFileSync(skillMdPath, 'utf-8');
  
  // Find frontmatter boundaries
  if (!content.startsWith('---')) {
    console.log('  ⚠️  No frontmatter');
    return null;
  }
  
  // Find the second ---
  const secondDash = content.indexOf('---', 3);
  if (secondDash === -1) {
    console.log('  ⚠️  Malformed frontmatter');
    return null;
  }
  
  const frontmatter = content.slice(4, secondDash).trim();
  const body = content.slice(secondDash + 3);
  
  // Extract name and description from frontmatter
  let name = path.basename(skillPath);
  let description = `Skill for ${name}`;
  
  // Parse name
  const nameMatch = frontmatter.match(/^name:\s*["']?([^"'\n]+)["']?/m);
  if (nameMatch) {
    name = nameMatch[1].trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  // Parse description
  const descMatch = frontmatter.match(/^description:\s*["']?([^"'\n]+)["']?/m);
  if (descMatch) {
    description = descMatch[1].trim();
    if (description.length > 200) {
      description = description.slice(0, 197) + '...';
    }
  }
  
  // Build clean frontmatter
  const newFrontmatter = `---
name: ${name}
description: "${description.replace(/"/g, '\\"')}"
---`;
  
  const newContent = newFrontmatter + body;
  fs.writeFileSync(skillMdPath, newContent, 'utf-8');
  
  return name;
}

console.log('🔧 Fixing SKILL.md YAML for Claude Desktop...\n');

const skills = fs.readdirSync(SKILLS_DIR).filter(f => {
  const fp = path.join(SKILLS_DIR, f);
  return fs.statSync(fp).isDirectory() && fs.existsSync(path.join(fp, 'SKILL.md'));
});

let fixed = 0;
for (const skill of skills) {
  console.log(`📋 ${skill}`);
  const result = fixSkillYaml(path.join(SKILLS_DIR, skill));
  if (result) {
    console.log(`   ✅ Fixed -> ${result}`);
    fixed++;
  }
}

console.log(`\n✅ Fixed ${fixed}/${skills.length} skills`);
