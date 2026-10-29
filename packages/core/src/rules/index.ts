import { Rule } from '../types.js';
import { awsRules } from './aws.js';
import { githubRules } from './github.js';
import { openaiRules } from './openai.js';
import { anthropicRules } from './anthropic.js';
import { googleRules } from './google.js';
import { stripeRules } from './stripe.js';
import { slackRules } from './slack.js';
import { sendgridRules } from './sendgrid.js';
import { jwtRules } from './jwt.js';
import { privateKeyRules } from './private-key.js';
import { databaseUrlRules } from './database-url.js';
import { urlCredentialsRules } from './url-credentials.js';
import { authHeaderRules } from './auth-header.js';
import { genericSecretRules } from './generic-secret.js';
import { piiRules } from './pii.js';

export const standardRules: Rule[] = [
  ...awsRules,
  ...githubRules,
  ...openaiRules,
  ...anthropicRules,
  ...googleRules,
  ...stripeRules,
  ...slackRules,
  ...sendgridRules,
  ...jwtRules,
  ...privateKeyRules,
  ...databaseUrlRules,
  ...urlCredentialsRules,
  ...authHeaderRules,
  ...genericSecretRules,
  ...piiRules,
];

export {
  awsRules,
  githubRules,
  openaiRules,
  anthropicRules,
  googleRules,
  stripeRules,
  slackRules,
  sendgridRules,
  jwtRules,
  privateKeyRules,
  databaseUrlRules,
  urlCredentialsRules,
  authHeaderRules,
  genericSecretRules,
  piiRules,
};
