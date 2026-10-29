import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coreIndexPath = path.resolve(__dirname, '../packages/core/dist/index.mjs');
if (!fs.existsSync(coreIndexPath)) {
  console.error('Error: Build core first before generating rules table.');
  process.exit(1);
}

const { standardRules } = await import(pathToFileURL(coreIndexPath).href);

export function generateRulesMarkdown() {
  const headers = [
    '| Rule ID | Label | Category | Severity | Confidence | Reference / Docs |',
    '|:---|:---|:---:|:---:|:---:|:---|',
  ];

  const rows = standardRules.map((rule) => {
    const sevBadge = `**${rule.severity.toUpperCase()}**`;
    const confBadge = rule.confidence;
    const docs = rule.docsUrl ? `[Docs](${rule.docsUrl})` : 'N/A';
    return `| \`${rule.id}\` | ${rule.label} | \`${rule.category}\` | ${sevBadge} | ${confBadge} | ${docs} |`;
  });

  return [...headers, ...rows].join('\n');
}

function main() {
  const table = generateRulesMarkdown();

  const readmePath = path.resolve(__dirname, '../README.md');
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf8');
    const startTag = '<!-- RULES_TABLE_START -->';
    const endTag = '<!-- RULES_TABLE_END -->';

    if (readme.includes(startTag) && readme.includes(endTag)) {
      const updated = readme.replace(
        new RegExp(`${startTag}[\\s\\S]*?${endTag}`),
        `${startTag}\n\n${table}\n\n${endTag}`
      );
      fs.writeFileSync(readmePath, updated, 'utf8');
      console.log('✓ README.md rules table updated successfully.');
    }
  }

  const coreReadmePath = path.resolve(__dirname, '../packages/core/README.md');
  if (fs.existsSync(coreReadmePath)) {
    const coreReadme = fs.readFileSync(coreReadmePath, 'utf8');
    const startTag = '<!-- RULES_TABLE_START -->';
    const endTag = '<!-- RULES_TABLE_END -->';

    if (coreReadme.includes(startTag) && coreReadme.includes(endTag)) {
      const updated = coreReadme.replace(
        new RegExp(`${startTag}[\\s\\S]*?${endTag}`),
        `${startTag}\n\n${table}\n\n${endTag}`
      );
      fs.writeFileSync(coreReadmePath, updated, 'utf8');
      console.log('✓ packages/core/README.md rules table updated successfully.');
    }
  }
}

main();
