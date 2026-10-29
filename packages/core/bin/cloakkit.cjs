#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Safe require of cloakkit core bundle
let core;
try {
  core = require('../dist/index.cjs');
} catch (err) {
  // Fallback for direct development execution before build
  console.error('Error: CloakKit build bundle not found. Please run "npm run build" first.');
  process.exit(1);
}

const { scan, redact } = core;

const PKG_VERSION = '0.1.0';

function printHelp() {
  console.log(`
CloakKit CLI v${PKG_VERSION}
Detect and redact secrets and PII locally before sending text to AI models.

Usage:
  npx cloakkit [file] [options]
  cat .env | npx cloakkit [options]

Options:
  --redact             Output the redacted text instead of finding details
  --json               Output findings in JSON format
  --fail-on <level>    Exit with code 1 if findings meet or exceed severity:
                       'high', 'medium', or 'low' (ideal for CI / pre-commit)
  --no-pii             Disable Personally Identifiable Information (PII) scanning
  --no-entropy         Disable Shannon entropy heuristics
  -h, --help           Show this help message
  -v, --version        Show version number

Examples:
  npx cloakkit prompt.txt
  cat .env | npx cloakkit --redact
  npx cloakkit log.txt --fail-on high
  cat CLAUDE.md | npx cloakkit --json
`.trim());
}

function parseArgs(args) {
  const flags = {
    file: null,
    redact: false,
    json: false,
    failOn: null,
    pii: true,
    entropy: true,
    help: false,
    version: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      flags.help = true;
    } else if (arg === '--version' || arg === '-v') {
      flags.version = true;
    } else if (arg === '--redact') {
      flags.redact = true;
    } else if (arg === '--json') {
      flags.json = true;
    } else if (arg === '--no-pii') {
      flags.pii = false;
    } else if (arg === '--no-entropy') {
      flags.entropy = false;
    } else if (arg === '--fail-on') {
      const next = args[++i];
      if (next && ['high', 'medium', 'low'].includes(next.toLowerCase())) {
        flags.failOn = next.toLowerCase();
      } else {
        console.error("Error: --fail-on must be one of: 'high', 'medium', or 'low'");
        process.exit(1);
      }
    } else if (arg.startsWith('--fail-on=')) {
      const val = arg.split('=')[1].toLowerCase();
      if (['high', 'medium', 'low'].includes(val)) {
        flags.failOn = val;
      } else {
        console.error("Error: --fail-on must be one of: 'high', 'medium', or 'low'");
        process.exit(1);
      }
    } else if (!arg.startsWith('-')) {
      if (!flags.file) {
        flags.file = arg;
      }
    }
  }

  return flags;
}

async function readInput(file) {
  if (file) {
    const resolvedPath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`Error: File not found: ${resolvedPath}`);
      process.exit(1);
    }
    return fs.readFileSync(resolvedPath, 'utf8');
  }

  if (process.stdin.isTTY) {
    return null;
  }

  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    process.stdin.on('error', (err) => {
      reject(err);
    });
  });
}

const SEVERITY_LEVELS = {
  low: 1,
  medium: 2,
  high: 3,
};

async function main() {
  const args = process.argv.slice(2);
  const flags = parseArgs(args);

  if (flags.help) {
    printHelp();
    process.exit(0);
  }

  if (flags.version) {
    console.log(`cloakkit v${PKG_VERSION}`);
    process.exit(0);
  }

  const input = await readInput(flags.file);

  if (input === null) {
    printHelp();
    process.exit(0);
  }

  const scanOptions = {
    pii: flags.pii,
    entropy: flags.entropy,
  };

  if (flags.redact) {
    const result = redact(input, scanOptions);
    if (flags.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      process.stdout.write(result.text);
      if (!result.text.endsWith('\n')) {
        process.stdout.write('\n');
      }
    }

    if (flags.failOn) {
      const threshold = SEVERITY_LEVELS[flags.failOn];
      const hasViolation = result.findings.some(
        (f) => SEVERITY_LEVELS[f.severity] >= threshold
      );
      if (hasViolation) {
        process.exit(1);
      }
    }
    process.exit(0);
  }

  const findings = scan(input, scanOptions);

  if (flags.json) {
    console.log(JSON.stringify(findings, null, 2));
  } else {
    if (findings.length === 0) {
      console.log('✓ No secrets or PII detected.');
    } else {
      console.error(`Found ${findings.length} secret/PII issue(s):\n`);
      for (const f of findings) {
        const sevColor = f.severity.toUpperCase().padEnd(6);
        console.error(
          `  [${sevColor}] ${f.label} at line ${f.line}, col ${f.column}`
        );
        console.error(
          `           Preview: ${f.preview} (rule: ${f.ruleId})`
        );
      }
      console.error('\nRun with --redact to output sanitized text.');
    }
  }

  if (flags.failOn) {
    const threshold = SEVERITY_LEVELS[flags.failOn];
    const hasViolation = findings.some(
      (f) => SEVERITY_LEVELS[f.severity] >= threshold
    );
    if (hasViolation) {
      process.exit(1);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
