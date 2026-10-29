import { Rule } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const jwtRules: Rule[] = [
  {
    id: 'jwt-token',
    label: 'JSON Web Token (JWT)',
    description: 'Compact signed JSON Web Token (RFC 7519)',
    category: 'secret',
    severity: 'medium',
    confidence: 'high',
    regex: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    docsUrl: 'https://jwt.io/introduction',
    placeholderPrefix: 'JWT_TOKEN',
    validator: (match): boolean => {
      return !isObviousPlaceholder(match[0]);
    },
  },
];
