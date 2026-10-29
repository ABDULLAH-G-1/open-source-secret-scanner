const DOCUMENTED_AWS_ACCESS_KEY = 'AKIA' + 'IOSFODNN7EXAMPLE';
const DOCUMENTED_AWS_SECRET_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCY' + 'EXAMPLEKEY';

// Exact placeholder words (case-insensitive)
const EXACT_PLACEHOLDER_WORDS = new Set([
  'changeme',
  'change_me',
  'change-me',
  'password',
  'secret',
  'example',
]);

// Common prefixes used by secret rules where the inner value itself could be a placeholder
const PROVIDER_PREFIX_REGEX = /^(?:gh[pousr]_|github_pat_|sk-(?:proj-|admin-|live-|ant-api03-|ant-)?|AIza[A-Za-z0-9_-]*?(?=YOUR_|<)|AIzaSy|AIza|sk_live_|rk_live_|xox[baprs]-|SG\.)/i;

function isPlaceholderContent(content: string): boolean {
  if (!content) return false;
  const trimmed = content.trim();
  if (trimmed.length === 0) return true;

  // 1. All the same character (xxxx, 0000)
  if (trimmed.length >= 2 && /^(.)\1+$/s.test(trimmed)) {
    return true;
  }

  // 2. Starts with YOUR_ or <...>
  const upper = trimmed.toUpperCase();
  if (upper.startsWith('YOUR_')) {
    return true;
  }
  if ((trimmed.startsWith('<') && trimmed.endsWith('>')) || trimmed.startsWith('<...')) {
    return true;
  }

  // 3. Equals changeme / password / secret / example
  const lower = trimmed.toLowerCase();
  if (EXACT_PLACEHOLDER_WORDS.has(lower)) {
    return true;
  }

  return false;
}

/**
 * Checks if a candidate secret string is an obvious placeholder.
 *
 * A value may be skipped as a placeholder only when the secret value itself is a placeholder:
 * - all the same character (xxxx, 0000)
 * - starts with YOUR_ or <...>
 * - equals changeme / password / secret / example
 * - is exactly the documented AWS example key
 *
 * The words "example", "test" or "sample" appearing in the host, the comment,
 * or elsewhere on the line must NOT cause a skip.
 */
export function isObviousPlaceholder(val: string): boolean {
  if (!val || typeof val !== 'string') return true;

  const trimmed = val.trim();
  if (trimmed.length === 0) return true;

  // 4. Exact documented AWS example key
  if (trimmed === DOCUMENTED_AWS_ACCESS_KEY || trimmed === DOCUMENTED_AWS_SECRET_KEY) {
    return true;
  }

  // Check the secret value itself
  if (isPlaceholderContent(trimmed)) {
    return true;
  }

  // Check if starts with YOUR_ after known token prefix
  if (/^(?:gh[pousr]_|github_pat_|sk-[a-z0-9_-]*|AIza[a-z0-9_-]*|sk_live_|rk_live_|xox[baprs]-|SG\.)YOUR_/i.test(trimmed)) {
    return true;
  }

  // If the secret has a provider prefix (e.g. ghp_YOUR_..., sk-proj-YOUR_..., ghp_xxxx...),
  // check whether the payload itself is a placeholder.
  const prefixMatch = trimmed.match(PROVIDER_PREFIX_REGEX);
  if (prefixMatch) {
    const payload = trimmed.slice(prefixMatch[0].length);
    if (isPlaceholderContent(payload)) {
      return true;
    }
  }

  // Also check if wrapped in quotes
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    const unquoted = trimmed.slice(1, -1);
    if (isPlaceholderContent(unquoted)) {
      return true;
    }
  }

  return false;
}

/**
 * Safely masks a secret string so it can be previewed without revealing the secret.
 * Never outputs the full secret.
 */
export function maskSecret(val: string): string {
  if (!val) return '***';
  const len = val.length;

  if (len <= 4) {
    return '*'.repeat(len);
  }

  if (len <= 8) {
    return `${val[0]}***${val[len - 1]}`;
  }

  if (len <= 16) {
    return `${val.slice(0, 2)}...${val.slice(-2)}`;
  }

  // Standard token mask: first 3 characters, ellipsis, last 3 characters
  return `${val.slice(0, 3)}...${val.slice(-3)}`;
}
