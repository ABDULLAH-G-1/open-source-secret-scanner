import { describe, it, expect } from 'vitest';
import { redact } from '../src/redactor.js';
import { scan } from '../src/scanner.js';
import { Rule } from '../src/types.js';

describe('Redactor & Options', () => {
  const tokenA = 'ghp_' + 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8';
  const tokenB = 'ghp_' + 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2';
  const awsKey = 'AKIA' + '1234567890ABCDEF';

  describe('Redact Consistency', () => {
    it('assigns the exact same placeholder to duplicate secret occurrences', () => {
      const text = `Primary: ${tokenA}\nSecondary: ${tokenA}\nTertiary: ${tokenB}`;
      const res = redact(text);

      expect(res.text).toContain('Primary: [GITHUB_TOKEN_1]');
      expect(res.text).toContain('Secondary: [GITHUB_TOKEN_1]');
      expect(res.text).toContain('Tertiary: [GITHUB_TOKEN_2]');
      expect(res.findings.length).toBe(3);
    });

    it('assigns numbered placeholders grouped by rule type', () => {
      const text = `GitHub: ${tokenA}\nAWS: ${awsKey}\nGitHub2: ${tokenB}`;
      const res = redact(text);

      expect(res.text).toContain('GitHub: [GITHUB_TOKEN_1]');
      expect(res.text).toContain('AWS: [AWS_ACCESS_KEY_1]');
      expect(res.text).toContain('GitHub2: [GITHUB_TOKEN_2]');
    });
  });

  describe('Allowlist Option', () => {
    it('skips findings for strings present in the allowlist', () => {
      const text = `Active token: ${tokenA}\nIgnored token: ${tokenB}`;
      const res = redact(text, { allowlist: [tokenB] });

      expect(res.text).toContain(`Active token: [GITHUB_TOKEN_1]`);
      expect(res.text).toContain(`Ignored token: ${tokenB}`);
      expect(res.findings.length).toBe(1);
      expect(res.findings[0].preview).not.toBe('');
    });
  });

  describe('Inline Ignore (scan:ignore)', () => {
    it('skips lines containing scan:ignore', () => {
      const text = `
const secret1 = "${tokenA}"; // scan:ignore
const secret2 = "${tokenB}";
      `.trim();

      const findings = scan(text);
      expect(findings.length).toBe(1);
      expect(findings[0].line).toBe(2);

      const res = redact(text);
      expect(res.text).toContain(`const secret1 = "${tokenA}"; // scan:ignore`);
      expect(res.text).toContain(`const secret2 = "[GITHUB_TOKEN_1]";`);
    });
  });

  describe('Scan Options (include, exclude, pii, entropy, customRules)', () => {
    it('respects include option', () => {
      const text = `AWS: ${awsKey}\nGitHub: ${tokenA}`;
      const findings = scan(text, { include: ['aws-access-key-id'] });
      expect(findings.length).toBe(1);
      expect(findings[0].ruleId).toBe('aws-access-key-id');
    });

    it('respects exclude option', () => {
      const text = `AWS: ${awsKey}\nGitHub: ${tokenA}`;
      const findings = scan(text, { exclude: ['aws-access-key-id'] });
      expect(findings.length).toBe(1);
      expect(findings[0].ruleId).toBe('github-token');
    });

    it('skips PII when pii is set to false', () => {
      const email = 'developer.test99@corp-internal.com';
      const text = `Contact: ${email}\nGitHub: ${tokenA}`;

      const withPii = scan(text, { pii: true });
      expect(withPii.some((f) => f.ruleId === 'pii-email')).toBe(true);

      const noPii = scan(text, { pii: false });
      expect(noPii.some((f) => f.ruleId === 'pii-email')).toBe(false);
      expect(noPii.some((f) => f.ruleId === 'github-token')).toBe(true);
    });

    it('supports customRules', () => {
      const customRule: Rule = {
        id: 'internal-corp-token',
        label: 'Internal Corp Token',
        description: 'Corp token starting with CORP_',
        category: 'secret',
        severity: 'high',
        confidence: 'high',
        regex: /\bCORP_[A-Z0-9]{12}\b/g,
        placeholderPrefix: 'CORP_TOKEN',
      };

      const text = 'Token is CORP_ABC123XYZ999';
      const findings = scan(text, { customRules: [customRule] });
      expect(findings.length).toBe(1);
      expect(findings[0].ruleId).toBe('internal-corp-token');

      const res = redact(text, { customRules: [customRule] });
      expect(res.text).toBe('Token is [CORP_TOKEN_1]');
    });
  });
});
