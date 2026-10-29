import { describe, it, expect } from 'vitest';
import { isValidLuhn } from '../src/luhn.js';

describe('Luhn Algorithm', () => {
  it('validates genuine credit card checksums correctly', () => {
    // Valid Visa
    expect(isValidLuhn('4532 0150 0000 0007')).toBe(true);
    expect(isValidLuhn('4532-0150-0000-0007')).toBe(true);
    expect(isValidLuhn('4532015000000007')).toBe(true);

    // Valid MasterCard
    expect(isValidLuhn('5425 2334 3010 9903')).toBe(true);

    // Valid Amex (15 digits)
    expect(isValidLuhn('3782 822463 10005')).toBe(true);
  });

  it('rejects invalid checksums', () => {
    // Last digit altered from 7 to 8
    expect(isValidLuhn('4532 0150 0000 0008')).toBe(false);

    // Transposed digits
    expect(isValidLuhn('5425 2343 3010 9903')).toBe(false);

    // Random non-Luhn digits
    expect(isValidLuhn('4111 1111 1111 1112')).toBe(false);
  });

  it('handles length constraints and edge cases', () => {
    expect(isValidLuhn('')).toBe(false);
    expect(isValidLuhn('12345')).toBe(false); // too short
    expect(isValidLuhn('1234567890123456789012')).toBe(false); // too long
    expect(isValidLuhn('abcd-efgh-ijkl-mnop')).toBe(false);
  });
});
