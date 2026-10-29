import { Rule } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const anthropicRules: Rule[] = [
  {
    id: 'anthropic-api-key',
    label: 'Anthropic API Key',
    description: 'Anthropic Claude API Key (sk-ant-...)',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /\bsk-ant-(?:api03-)?[A-Za-z0-9_-]{32,}\b/g,
    docsUrl: 'https://docs.anthropic.com/en/api/getting-started',
    placeholderPrefix: 'ANTHROPIC_KEY',
    validator: (match): boolean => {
      return !isObviousPlaceholder(match[0]);
    },
  },
];
