import { Rule } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const googleRules: Rule[] = [
  {
    id: 'google-api-key',
    label: 'Google API Key',
    description: 'Google Cloud / Maps / Firebase 39-character API Key (AIza...)',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /\bAIza[0-9A-Za-z-_]{35}\b/g,
    docsUrl: 'https://cloud.google.com/docs/authentication/api-keys',
    placeholderPrefix: 'GOOGLE_API_KEY',
    validator: (match): boolean => {
      return !isObviousPlaceholder(match[0]);
    },
  },
];
