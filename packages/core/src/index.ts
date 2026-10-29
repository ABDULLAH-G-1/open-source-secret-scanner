export { scan } from './scanner.js';
export { redact } from './redactor.js';
export { standardRules } from './rules/index.js';
export { calculateShannonEntropy, hasHighEntropy } from './entropy.js';
export { isValidLuhn } from './luhn.js';
export { isObviousPlaceholder, maskSecret } from './placeholders.js';
export type {
  Finding,
  Rule,
  RuleMatch,
  RuleContext,
  ScanOptions,
  RedactResult,
  Severity,
  Confidence,
  Category,
} from './types.js';
