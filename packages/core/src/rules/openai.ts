import { Rule } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const openaiRules: Rule[] = [
  {
    id: 'openai-api-key',
    label: 'OpenAI API Key',
    description: 'OpenAI API Key (standard, project-scoped sk-proj-, or admin-scoped)',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /\bsk-(?!(?:ant)-)(?:proj-|admin-|live-)?[A-Za-z0-9_-]{32,}\b/g,
    docsUrl: 'https://platform.openai.com/docs/api-reference/authentication',
    placeholderPrefix: 'OPENAI_KEY',
    validator: (match): boolean => {
      return !isObviousPlaceholder(match[0]);
    },
  },
];
