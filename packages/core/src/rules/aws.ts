import { Rule, RuleMatch } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const awsRules: Rule[] = [
  {
    id: 'aws-access-key-id',
    label: 'AWS Access Key ID',
    description: 'AWS 20-character Access Key Identifier (AKIA, ASIA, etc.)',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/g,
    docsUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
    placeholderPrefix: 'AWS_ACCESS_KEY',
    validator: (match): boolean => {
      const val = match[0];
      return !isObviousPlaceholder(val);
    },
  },
  {
    id: 'aws-secret-access-key',
    label: 'AWS Secret Access Key',
    description: 'AWS 40-character Secret Access Key associated with AWS credentials',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /\b(?:aws_secret_access_key|aws_secret_key|aws_secret)\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi,
    docsUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
    placeholderPrefix: 'AWS_SECRET_KEY',
    validator: (match): boolean | RuleMatch => {
      const secret = match[1];
      if (!secret || isObviousPlaceholder(secret)) {
        return false;
      }
      const fullMatch = match[0];
      const valIndex = fullMatch.indexOf(secret);
      const start = match.index + valIndex;
      return {
        start,
        end: start + secret.length,
        value: secret,
      };
    },
  },
];
