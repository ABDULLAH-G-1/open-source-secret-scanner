import { Finding, RedactResult, ScanOptions } from './types.js';
import { scan } from './scanner.js';
import { standardRules } from './rules/index.js';

const DEFAULT_PREFIX_MAP: Record<string, string> = {
  'aws-access-key-id': 'AWS_ACCESS_KEY',
  'aws-secret-access-key': 'AWS_SECRET_KEY',
  'github-token': 'GITHUB_TOKEN',
  'openai-api-key': 'OPENAI_KEY',
  'anthropic-api-key': 'ANTHROPIC_KEY',
  'google-api-key': 'GOOGLE_API_KEY',
  'stripe-live-key': 'STRIPE_LIVE_KEY',
  'slack-token': 'SLACK_TOKEN',
  'slack-webhook-url': 'SLACK_WEBHOOK',
  'sendgrid-api-key': 'SENDGRID_KEY',
  'jwt-token': 'JWT_TOKEN',
  'pem-private-key': 'PRIVATE_KEY',
  'database-url-credentials': 'DATABASE_URL',
  'url-credentials': 'URL_CREDENTIALS',
  'authorization-header': 'AUTH_TOKEN',
  'generic-secret-key-value': 'SECRET_VALUE',
  'pii-credit-card': 'CREDIT_CARD',
  'pii-email': 'EMAIL',
  'pii-phone': 'PHONE_NUMBER',
};

function getPrefixForRule(ruleId: string, customRules?: Array<{ id: string; placeholderPrefix?: string }>): string {
  if (customRules) {
    const custom = customRules.find((r) => r.id === ruleId);
    if (custom?.placeholderPrefix) {
      return custom.placeholderPrefix;
    }
  }

  const standard = standardRules.find((r) => r.id === ruleId);
  if (standard?.placeholderPrefix) {
    return standard.placeholderPrefix;
  }

  if (DEFAULT_PREFIX_MAP[ruleId]) {
    return DEFAULT_PREFIX_MAP[ruleId];
  }

  return ruleId.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

/**
 * Detects secrets and PII in text and replaces them with consistent, numbered placeholders.
 * The same secret always receives the same placeholder across the text.
 */
export function redact(text: string, options: ScanOptions = {}): RedactResult {
  if (!text || typeof text !== 'string') {
    return { text: text ?? '', findings: [] };
  }

  const findings = scan(text, options);
  if (findings.length === 0) {
    return { text, findings: [] };
  }

  const secretToPlaceholder = new Map<string, string>();
  const prefixCounters = new Map<string, number>();

  // Assign placeholders in document order
  for (const finding of findings) {
    const secretVal = text.slice(finding.start, finding.end);
    if (!secretToPlaceholder.has(secretVal)) {
      const prefix = getPrefixForRule(finding.ruleId, options.customRules);
      const nextNum = (prefixCounters.get(prefix) || 0) + 1;
      prefixCounters.set(prefix, nextNum);
      const placeholder = `[${prefix}_${nextNum}]`;
      secretToPlaceholder.set(secretVal, placeholder);
    }
  }

  // Replace from end to start so earlier string indices remain accurate
  let redacted = text;
  for (let i = findings.length - 1; i >= 0; i--) {
    const f = findings[i];
    const secretVal = text.slice(f.start, f.end);
    const placeholder = secretToPlaceholder.get(secretVal) || '[REDACTED]';
    redacted = redacted.slice(0, f.start) + placeholder + redacted.slice(f.end);
  }

  return {
    text: redacted,
    findings,
  };
}
