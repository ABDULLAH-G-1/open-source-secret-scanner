/**
 * Calculates the Shannon entropy of a string (in bits per symbol).
 * Higher entropy indicates greater randomness/unpredictability.
 */
export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;

  const frequencies: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  const len = str.length;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Checks if a string has high entropy, typical of generated secrets and keys.
 * Default threshold of 3.0 bits per char for strings of length >= 8.
 */
export function hasHighEntropy(str: string, threshold = 3.0): boolean {
  if (!str || str.length < 8) return false;
  return calculateShannonEntropy(str) >= threshold;
}
