#!/usr/bin/env node
/**
 * Create Claude Desktop compatible ZIP files with Unix-style paths
 */

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SKILLS_DIR = path.join(__dirname, '../starter-kit/template/.claude/skills');
const OUTPUT_DIR = path.join(__dirname, '../starter-kit/claude-desktop-skills');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Clear existing ZIPs
const existingZips = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.zip'));
for (const zip of existingZips) {
  fs.unlinkSync(path.join(OUTPUT_DIR, zip));
}

// Get all skill directories
const skills = fs.readdirSync(SKILLS_DIR).filter(f => {
  const skillPath = path.join(SKILLS_DIR, f);
  return fs.statSync(skillPath).isDirectory() && fs.existsSync(path.join(skillPath, 'SKILL.md'));
});

console.log(`🔧 Creating ${skills.length} Claude Desktop skill ZIPs...\n`);

async function createZip(skillName) {
  return new Promise((resolve, reject) => {
    const skillPath = path.join(SKILLS_DIR, skillName);
    const outputPath = path.join(OUTPUT_DIR, `${skillName}.zip`);

    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const size = (archive.pointer() / 1024).toFixed(1);
      console.log(`   ✅ ${skillName}.zip (${size} KB)`);
      resolve();
    });

    archive.on('error', reject);
    archive.pipe(output);

    // Add files with Unix-style paths (forward slashes)
    // The key is using the 'name' option to set the path in the ZIP
    const files = getAllFiles(skillPath);
    for (const file of files) {
      const relativePath = path.relative(skillPath, file);
      // Convert Windows backslashes to Unix forward slashes
      const unixPath = `${skillName}/${relativePath.replace(/\\/g, '/')}`;
      archive.file(file, { name: unixPath });
    }

    archive.finalize();
  });
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// Create all ZIPs
async function main() {
  for (const skill of skills) {
    await createZip(skill);
  }

  console.log(`\n✅ Created ${skills.length} ZIPs in:`);
  console.log(`   ${OUTPUT_DIR}`);
}

main().catch(console.error);
