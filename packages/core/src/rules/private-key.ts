import { Rule } from '../types.js';

export const privateKeyRules: Rule[] = [
  {
    id: 'pem-private-key',
    label: 'PEM Private Key',
    description: 'Privacy-Enhanced Mail (PEM) encoded private cryptographic key block',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /-----BEGIN (?:[A-Z0-9_-]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z0-9_-]+ )?PRIVATE KEY-----/g,
    docsUrl: 'https://datatracker.ietf.org/doc/html/rfc7468',
    placeholderPrefix: 'PRIVATE_KEY',
    validator: (match): boolean => {
      // Must contain more than just header and footer
      return match[0].length > 60;
    },
  },
];
