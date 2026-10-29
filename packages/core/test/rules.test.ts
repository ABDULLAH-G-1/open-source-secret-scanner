import { describe, it, expect } from 'vitest';
import { scan } from '../src/scanner.js';
import { buildRuleFixtures } from './fixtures.js';

describe('Rules Fixture Verification', () => {
  const fixtures = buildRuleFixtures();

  for (const fixture of fixtures) {
    describe(`Rule: ${fixture.ruleId}`, () => {
      it('has at least 2 positive and 2 negative fixtures', () => {
        expect(fixture.positive.length).toBeGreaterThanOrEqual(2);
        expect(fixture.negative.length).toBeGreaterThanOrEqual(2);
      });

      for (let i = 0; i < fixture.positive.length; i++) {
        const text = fixture.positive[i];
        it(`detects positive fixture #${i + 1}`, () => {
          const findings = scan(text, { pii: true, entropy: true });
          const matching = findings.filter((f) => f.ruleId === fixture.ruleId);
          expect(
            matching.length,
            `Expected finding for rule '${fixture.ruleId}' in: ${text}`
          ).toBeGreaterThanOrEqual(1);
        });
      }

      for (let i = 0; i < fixture.negative.length; i++) {
        const text = fixture.negative[i];
        it(`rejects negative fixture #${i + 1}`, () => {
          const findings = scan(text, { pii: true, entropy: true });
          const matching = findings.filter((f) => f.ruleId === fixture.ruleId);
          expect(
            matching.length,
            `Expected no finding for rule '${fixture.ruleId}' in negative fixture: ${text}`
          ).toBe(0);
        });
      }
    });
  }
});
