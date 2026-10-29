import { describe, it, expect } from 'vitest';
import { scan } from '../src/scanner.js';
import { isObviousPlaceholder } from '../src/placeholders.js';

describe('Placeholder Logic & False Negative Prevention', () => {
  // Test (a): Database URL whose host contains "example" with a random-looking password
  it('(a) detects database URL whose host contains "example" with a random-looking password', () => {
    // Constructed dynamically at runtime
    const scheme = 'postgres://';
    const user = 'app_user';
    const randomPassword = 'k9' + 'X#m2P$vL8n' + 'Q1z';
    const hostWithExample = 'db.example.com:5432';
    const database = 'production_db';
    const dbUrl = `${scheme}${user}:${randomPassword}@${hostWithExample}/${database}`;

    const findings = scan(dbUrl);
    const dbFindings = findings.filter((f) => f.ruleId === 'database-url-credentials');

    expect(dbFindings.length).toBeGreaterThanOrEqual(1);
    expect(dbFindings[0].preview).toBeDefined();
    expect(dbFindings[0].preview).toContain('...');
  });

  // Test (b): Real-looking GitHub token on a line that also has a comment "# example config"
  it('(b) detects a real-looking GitHub token on a line that also has a comment "# example config"', () => {
    // Constructed dynamically at runtime
    const token = 'ghp_' + 'b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9';
    const lineWithComment = `GITHUB_TOKEN="${token}" # example config`;

    const findings = scan(lineWithComment);
    const ghFindings = findings.filter((f) => f.ruleId === 'github-token');

    expect(ghFindings.length).toBe(1);
    expect(ghFindings[0].ruleId).toBe('github-token');
  });

  // Test (c): The same key inside a file whose text says "sample" and "test" nearby
  it('(c) detects the same key inside a file whose text says "sample" and "test" nearby', () => {
    // Constructed dynamically at runtime
    const token = 'ghp_' + 'b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9';
    const fileContent = [
      '# Sample configuration file for automated test runner',
      '# This is a sample environment template used during integration test runs.',
      `export GITHUB_AUTH_KEY="${token}"`,
      '# Run sample test suite: npm run test:sample',
      '# Ensure all test mocks and sample data are purged.',
    ].join('\n');

    const findings = scan(fileContent);
    const ghFindings = findings.filter((f) => f.ruleId === 'github-token');

    expect(ghFindings.length).toBe(1);
    expect(ghFindings[0].line).toBe(3);
  });

  describe('isObviousPlaceholder specific criteria', () => {
    it('skips when secret value itself is all the same character (xxxx, 0000)', () => {
      expect(isObviousPlaceholder('xxxx')).toBe(true);
      expect(isObviousPlaceholder('0000')).toBe(true);
      expect(isObviousPlaceholder('11111111')).toBe(true);
      expect(isObviousPlaceholder('ghp_' + 'x'.repeat(36))).toBe(true);
      expect(isObviousPlaceholder('ghp_' + '0'.repeat(36))).toBe(true);
    });

    it('skips when secret value starts with YOUR_ or <...>', () => {
      expect(isObviousPlaceholder('YOUR_API_KEY')).toBe(true);
      expect(isObviousPlaceholder('YOUR_SECRET_TOKEN_HERE')).toBe(true);
      expect(isObviousPlaceholder('your_token_value')).toBe(true);
      expect(isObviousPlaceholder('<API_KEY>')).toBe(true);
      expect(isObviousPlaceholder('<insert-key-here>')).toBe(true);
      expect(isObviousPlaceholder('<...>') ).toBe(true);
      expect(isObviousPlaceholder('ghp_' + 'YOUR_TOKEN_HERE123456789012345678901')).toBe(true);
      expect(isObviousPlaceholder('sk-' + 'proj-' + 'YOUR_OPENAI_KEY_PLACEHOLDER12345678')).toBe(true);
    });

    it('skips when secret value equals changeme / password / secret / example', () => {
      expect(isObviousPlaceholder('changeme')).toBe(true);
      expect(isObviousPlaceholder('CHANGEME')).toBe(true);
      expect(isObviousPlaceholder('password')).toBe(true);
      expect(isObviousPlaceholder('PASSWORD')).toBe(true);
      expect(isObviousPlaceholder('secret')).toBe(true);
      expect(isObviousPlaceholder('SECRET')).toBe(true);
      expect(isObviousPlaceholder('example')).toBe(true);
      expect(isObviousPlaceholder('EXAMPLE')).toBe(true);
    });

    it('skips exactly the documented AWS example keys', () => {
      const awsAccess = 'AKIA' + 'IOSFODNN7EXAMPLE';
      const awsSecret = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCY' + 'EXAMPLEKEY';
      expect(isObviousPlaceholder(awsAccess)).toBe(true);
      expect(isObviousPlaceholder(awsSecret)).toBe(true);
    });

    it('does NOT skip when "example", "test", or "sample" appears in host or password or context', () => {
      expect(isObviousPlaceholder('r4nd0m_p4ssw0rd_987')).toBe(false);
      expect(isObviousPlaceholder('db.example.com')).toBe(false);
      expect(isObviousPlaceholder('sample_token_xyz99')).toBe(false);
      expect(isObviousPlaceholder('test_runner_prod_key_77')).toBe(false);
    });
  });
});
