import { Rule } from '../types.js';
import { isValidLuhn } from '../luhn.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const piiRules: Rule[] = [
  {
    id: 'pii-credit-card',
    label: 'Credit Card Number',
    description: 'Credit Card number (Visa, MasterCard, Amex, Discover) validated by Luhn algorithm',
    category: 'pii',
    severity: 'high',
    confidence: 'high',
    regex: /\b(?:4\d{3}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}|5[1-5]\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}|3[47]\d{2}[-\s]?\d{6}[-\s]?\d{5}|6(?:011|5\d{2})[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})\b/g,
    docsUrl: 'https://en.wikipedia.org/wiki/Luhn_algorithm',
    placeholderPrefix: 'CREDIT_CARD',
    validator: (match): boolean => {
      const card = match[0];
      if (isObviousPlaceholder(card)) return false;
      return isValidLuhn(card);
    },
  },
  {
    id: 'pii-email',
    label: 'Email Address',
    description: 'Personally identifiable email address',
    category: 'pii',
    severity: 'low',
    confidence: 'medium',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    docsUrl: 'https://datatracker.ietf.org/doc/html/rfc5322',
    placeholderPrefix: 'EMAIL',
    validator: (match): boolean => {
      const email = match[0];
      return !isObviousPlaceholder(email);
    },
  },
  {
    id: 'pii-phone',
    label: 'Phone Number',
    description: 'Loose international or North American phone number',
    category: 'pii',
    severity: 'low',
    confidence: 'low',
    regex: /(?:\+?1[-.\s]?)?(?:\([2-9]\d{2}\)|[2-9]\d{2})[-.\s]?[2-9]\d{2}[-.\s]?\d{4}\b|\b\+?[1-9]\d{0,3}[-.\s]?(?:\(?\d{2,4}\)?[-.\s]?)\d{3,4}[-.\s]?\d{3,4}\b/g,
    docsUrl: 'https://en.wikipedia.org/wiki/Telephone_numbering_plan',
    placeholderPrefix: 'PHONE_NUMBER',
    validator: (match): boolean => {
      const phone = match[0];
      if (isObviousPlaceholder(phone)) return false;
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) return false;
      // Filter monotonous digits
      if (/^(.)\1+$/.test(digits)) return false;
      if (digits === '1234567890' || digits === '0123456789') return false;
      return true;
    },
  },
];
