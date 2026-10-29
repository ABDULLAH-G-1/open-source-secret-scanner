import { Rule, RuleMatch } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const authHeaderRules: Rule[] = [
  {
    id: 'authorization-header',
    label: 'Authorization Header Token',
    description: 'HTTP Authorization header with Bearer or Basic token',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /\bAuthorization\s*:\s*(?:Bearer|Basic)\s+([A-Za-z0-9._~+/-]{12,}=*)/gi,
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization',
    placeholderPrefix: 'AUTH_TOKEN',
    validator: (match): boolean | RuleMatch => {
      const token = match[1];
      if (!token || isObviousPlaceholder(token)) {
        return false;
      }
      const fullMatch = match[0];
      const tokenIndex = fullMatch.indexOf(token);
      const start = match.index + tokenIndex;
      return {
        start,
        end: start + token.length,
        value: token,
      };
    },
  },
];
