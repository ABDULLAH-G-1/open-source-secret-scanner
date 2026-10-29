import { Rule } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const slackRules: Rule[] = [
  {
    id: 'slack-token',
    label: 'Slack Token',
    description: 'Slack API Token (Bot xoxb-, User xoxp-, App xoxa-, etc.)',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /\bxox[baprs]-[0-9a-zA-Z-]{10,}\b/g,
    docsUrl: 'https://api.slack.com/authentication/token-types',
    placeholderPrefix: 'SLACK_TOKEN',
    validator: (match): boolean => {
      return !isObviousPlaceholder(match[0]);
    },
  },
  {
    id: 'slack-webhook-url',
    label: 'Slack Webhook URL',
    description: 'Slack Incoming Webhook URL',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /https:\/\/hooks\.slack\.com\/services\/T[0-9A-Z]{8,12}\/B[0-9A-Z]{8,12}\/[0-9a-zA-Z]{24}/g,
    docsUrl: 'https://api.slack.com/messaging/webhooks',
    placeholderPrefix: 'SLACK_WEBHOOK',
    validator: (match): boolean => {
      return !isObviousPlaceholder(match[0]);
    },
  },
];
