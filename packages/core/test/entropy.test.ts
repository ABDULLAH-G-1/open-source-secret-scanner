import { describe, it, expect } from 'vitest';
import { calculateShannonEntropy, hasHighEntropy } from '../src/entropy.js';

describe('Shannon Entropy', () => {
  it('returns 0 for empty or single repeated character strings', () => {
    expect(calculateShannonEntropy('')).toBe(0);
    expect(calculateShannonEntropy('aaaa')).toBe(0);
    expect(calculateShannonEntropy('000000000')).toBe(0);
  });

  it('calculates higher entropy for diverse/random character strings', () => {
    const lowEntropy = calculateShannonEntropy('adminadmin');
    const highEntropy = calculateShannonEntropy('x7F#9qK@2mZ$8vL!');

    expect(lowEntropy).toBeLessThan(3.0);
    expect(highEntropy).toBeGreaterThan(3.5);
  });

  it('determines high entropy status according to threshold', () => {
    expect(hasHighEntropy('adminadmin', 3.0)).toBe(false);
    expect(hasHighEntropy('x7F#9qK@2mZ$8vL!', 3.0)).toBe(true);
    expect(hasHighEntropy('short', 3.0)).toBe(false); // short strings rejected
  });
});
