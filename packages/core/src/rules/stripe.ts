import { Rule } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const stripeRules: Rule[] = [
  {
    id: 'stripe-live-key',
    label: 'Stripe Live Key',
    description: 'Stripe live secret key (sk_live_...) or restricted key (rk_live_...)',
    category: 'secret',
    severity: 'high',
    confidence: 'high',
    regex: /\b(?:sk|rk)_live_[0-9a-zA-Z]{24,}\b/g,
    docsUrl: 'https://docs.stripe.com/keys',
    placeholderPrefix: 'STRIPE_LIVE_KEY',
    validator: (match): boolean => {
      return !isObviousPlaceholder(match[0]);
    },
  },
];
