import { Rule } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const urlCredentialsRules: Rule[] = [
  {
    id: 'url-credentials',
    label: 'URL with Embedded Credentials',
    description: 'HTTP or HTTPS URL containing an embedded username and password',
    category: 'secret',
    severity: 'high',
    confidence: 'medium',
    regex: /\bhttps?:\/\/[^\s:@/]+:[^\s:@/]+@[^\s/:]+(?::\d+)?(?:\/[^\s"';,)\]]*)?/gi,
    docsUrl: 'https://datatracker.ietf.org/doc/html/rfc3986#section-3.2.1',
    placeholderPrefix: 'URL_CREDENTIALS',
    validator: (match): boolean => {
      const full = match[0];
      const creds = full.match(/:\/\/[^:]+:([^@]+)@/);
      if (creds && creds[1]) {
        return !isObviousPlaceholder(creds[1]);
      }
      return !isObviousPlaceholder(full);
    },
  },
];
