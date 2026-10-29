import { Rule } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const databaseUrlRules: Rule[] = [
  {
    id: 'database-url-credentials',
    label: 'Database URL with Credentials',
    description: 'Database connection URI containing embedded username and password',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis|amqp|mssql):\/\/[^\s:@/]+:[^\s:@/]+@[^\s/:]+(?::\d+)?(?:\/[^\s"';,)\]]*)?/gi,
    docsUrl: 'https://www.iana.org/assignments/uri-schemes/prov/mongodb',
    placeholderPrefix: 'DATABASE_URL',
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
