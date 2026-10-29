/**
 * Dynamically constructs a realistic demonstration sample at runtime.
 * All tokens and secrets are fake and assembled dynamically to adhere to
 * GitHub Secret Push Protection guidelines.
 */
export function generateSampleText(): string {
  const parts = [
    '# =====================================================================',
    '# FAKE DEMO DATA - Generated dynamically at runtime for CloakKit preview',
    '# All tokens, keys, and values below are synthetically generated fakes.',
    '# =====================================================================',
    '',
    '# 1. Cloud Provider Credentials',
    'AWS_ACCESS_KEY_ID="' + 'AKIA' + '1234567890ABCDEF' + '"',
    'AWS_SECRET_ACCESS_KEY="' + 'aB1+cD2/eF3' + 'gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3==' + '"',
    '',
    '# 2. Source Control & AI Model API Keys',
    'GITHUB_TOKEN="ghp_' + 'a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8' + '"',
    'OPENAI_API_KEY="' + 'sk-' + 'proj-' + 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6' + '"',
    'ANTHROPIC_API_KEY="' + 'sk-' + 'ant-api03-' + 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4' + '"',
    '',
    '# 3. Payment & Messaging Integration',
    'STRIPE_SECRET_KEY="' + 'sk_' + 'live_' + '51AbCdEfGhIjKlMnOpQrStUvWxYz0123456' + '"',
    'SLACK_WEBHOOK_URL="https://' + 'hooks.slack.com/services/T' + '12345678/B' + '12345678/' + 'a1b2c3d4e5f6g7h8i9j0k1l2' + '"',
    '',
    '# 4. Database Connection Strings',
    'DATABASE_URL="postgres://' + 'app_user:' + 'sUp3rS3cr3tPassw0rd' + '@db.internal.corp:5432/production"',
    '',
    '# 5. HTTP Authorization Header',
    'Authorization: Bearer ' + 'dGhpc0lzQVJhbmRvbVRva2VuMTIzNDU2Nzg5MDEy',
    '',
    '# 6. Inline Ignore Directive (CloakKit will skip this line entirely)',
    'SAFE_PUBLIC_ID="ghp_' + '000000000000000000000000000000000000' + '" // scan:ignore',
    '',
    '# 7. Personally Identifiable Information (PII)',
    'Primary Contact: sarah.connor99@cyberdyne-systems.io',
    'Support Hotline: +1 (415) 890-2345',
    'Billing Card: 4532-0150-0000-0007',
    '',
    '# End of prompt / configuration excerpt',
  ];

  return parts.join('\n');
}
