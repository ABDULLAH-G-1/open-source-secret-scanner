import { Rule } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const githubRules: Rule[] = [
  {
    id: 'github-token',
    label: 'GitHub Token',
    description: 'GitHub Personal Access Token, OAuth token, or fine-grained PAT',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /\b(?:gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82})\b/g,
    docsUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github',
    placeholderPrefix: 'GITHUB_TOKEN',
    validator: (match): boolean => {
      return !isObviousPlaceholder(match[0]);
    },
  },
];
