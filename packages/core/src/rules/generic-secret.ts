import { Rule, RuleMatch } from '../types.js';
import { calculateShannonEntropy } from '../entropy.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const genericSecretRules: Rule[] = [
  {
    id: 'generic-secret-key-value',
    label: 'Generic Secret Assignment',
    description: 'Key-value assignment containing keywords (secret, token, password, api_key) with high-entropy value',
    category: 'secret',
    severity: 'medium',
    confidence: 'medium',
    regex: /\b([a-zA-Z0-9_-]*(?:secret|token|password|passwd|api_key|apikey|auth_token)[a-zA-Z0-9_-]*)\s*[:=]\s*["']?([^\s"';,`]{8,})["']?/gi,
    docsUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html',
    placeholderPrefix: 'SECRET_VALUE',
    validator: (match, _text, context): boolean | RuleMatch => {
      const key = match[1];
      const val = match[2];

      if (!key || !val) return false;
      if (isObviousPlaceholder(val)) return false;

      // Entropy check if enabled
      if (context.options.entropy !== false) {
        const entropy = calculateShannonEntropy(val);
        // Requires minimum entropy to reduce false positives
        if (entropy < 3.0) {
          return false;
        }
      }

      const fullMatch = match[0];
      const valIndex = fullMatch.lastIndexOf(val);
      const start = match.index + valIndex;
      return {
        start,
        end: start + val.length,
        value: val,
      };
    },
  },
];
