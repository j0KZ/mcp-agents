/**
 * Changelog generation helpers
 */

/**
 * Grouped commits by type
 */
export interface GroupedCommits {
  feat: string[];
  fix: string[];
  docs: string[];
  other: string[];
}

/**
 * Group commits by conventional commit type
 *
 * @param commits - Array of commit lines (format: hash|message|author|date)
 * @returns Grouped commits by type
 */
export function groupCommitsByType(commits: string[]): GroupedCommits {
  const grouped: GroupedCommits = {
    feat: [],
    fix: [],
    docs: [],
    other: [],
  };

  commits.forEach(line => {
    const [hash, message] = line.split('|');
    const shortHash = hash.substring(0, 7);

    if (message.startsWith('feat:')) {
      grouped.feat.push(`- ${message.replace('feat:', '').trim()} (\`${shortHash}\`)`);
    } else if (message.startsWith('fix:')) {
      grouped.fix.push(`- ${message.replace('fix:', '').trim()} (\`${shortHash}\`)`);
    } else if (message.startsWith('docs:')) {
      grouped.docs.push(`- ${message.replace('docs:', '').trim()} (\`${shortHash}\`)`);
    } else {
      grouped.other.push(`- ${message} (\`${shortHash}\`)`);
    }
  });

  return grouped;
}

/**
 * Build changelog sections from grouped commits
 *
 * @param grouped - Grouped commits
 * @returns Array of section lines
 */
export function buildChangelogSections(grouped: GroupedCommits): string[] {
  const sections: string[] = [];

  if (grouped.feat.length > 0) {
    sections.push('## Features');
    sections.push('');
    sections.push(...grouped.feat);
    sections.push('');
  }

  if (grouped.fix.length > 0) {
    sections.push('## Bug Fixes');
    sections.push('');
    sections.push(...grouped.fix);
    sections.push('');
  }

  if (grouped.docs.length > 0) {
    sections.push('## Documentation');
    sections.push('');
    sections.push(...grouped.docs);
    sections.push('');
  }

  if (grouped.other.length > 0) {
    sections.push('## Other Changes');
    sections.push('');
    sections.push(...grouped.other);
    sections.push('');
  }

  return sections;
}
