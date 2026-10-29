import { Rule } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const sendgridRules: Rule[] = [
  {
    id: 'sendgrid-api-key',
    label: 'SendGrid API Key',
    description: 'SendGrid 69-character API Key (SG....)',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /\bSG\.[0-9a-zA-Z_-]{22}\.[0-9a-zA-Z_-]{43}\b/g,
    docsUrl: 'https://docs.sendgrid.com/for-developers/sending-email/api-keys',
    placeholderPrefix: 'SENDGRID_KEY',
    validator: (match): boolean => {
      return !isObviousPlaceholder(match[0]);
    },
  },
];
