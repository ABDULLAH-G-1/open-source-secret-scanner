/**
 * Test fixtures dynamically constructed at runtime to prevent triggering
 * GitHub Secret Scanning or Push Protection.
 * Every rule has at least 2 positive and 2 negative fixtures.
 */

export interface RuleFixture {
  ruleId: string;
  positive: string[];
  negative: string[];
}

export function buildRuleFixtures(): RuleFixture[] {
  return [
    {
      ruleId: 'aws-access-key-id',
      positive: [
        // AWS AKIA access key (20 chars)
        'AKIA' + '1234567890ABCDEF',
        // AWS ASIA temporary access key (20 chars)
        'ASIA' + '9876543210FEDCBA',
      ],
      negative: [
        // Documented AWS example key (must be skipped)
        'AKIA' + 'IOSFODNN7EXAMPLE',
        // Too short (19 chars)
        'AKIA' + '1234567890ABCDE',
        // Lowercase (AWS access keys are all uppercase)
        'akia' + '1234567890abcdef',
      ],
    },
    {
      ruleId: 'aws-secret-access-key',
      positive: [
        'aws_secret_access_key="' + 'aB1+cD2/eF3' + 'gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3==' + '"',
        'aws_secret_key = ' + 'wJalrXUtnFEMI/K7MDENG/bPxRfiCY1234567890',
      ],
      negative: [
        // Documented AWS example secret key
        'aws_secret_access_key="' + 'wJalrXUtnFEMI/K7MDENG/bPxRfiCY' + 'EXAMPLEKEY"',
        // Missing key assignment context
        'aB1+cD2/eF3' + 'gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3==',
        // Obvious placeholder
        'aws_secret_access_key="YOUR_AWS_SECRET_ACCESS_KEY_HERE12345678"',
      ],
    },
    {
      ruleId: 'github-token',
      positive: [
        // Personal Access Token (ghp_ + 36 alphanumeric)
        'ghp_' + 'a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8',
        // Fine-grained PAT (github_pat_ + 82 chars)
        'github_' + 'pat_' + '11A' + 'b'.repeat(79),
      ],
      negative: [
        // Too short
        'ghp_' + 'short123',
        // Obvious placeholder
        'ghp_' + 'YOUR_TOKEN_HERE_EXAMPLE_PLACEHOLDER1',
      ],
    },
    {
      ruleId: 'openai-api-key',
      positive: [
        // Standard OpenAI key
        'sk-' + 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4',
        // Project-scoped key (sk-proj-)
        'sk-' + 'proj-' + 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6',
      ],
      negative: [
        // Too short
        'sk-' + 'short',
        // Obvious placeholder
        'sk-' + 'proj-' + 'YOUR_OPENAI_API_KEY_PLACEHOLDER_HERE',
      ],
    },
    {
      ruleId: 'anthropic-api-key',
      positive: [
        // Claude standard API key
        'sk-' + 'ant-' + 'api03-' + 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4',
        // Alternate format
        'sk-' + 'ant-' + 'live01-' + 'Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4J3I2H1G0F9E8D7C6',
      ],
      negative: [
        // Too short
        'sk-' + 'ant-' + 'short',
        // Placeholder
        'sk-' + 'ant-api03-' + 'YOUR_ANTHROPIC_KEY_PLACEHOLDER_VALUE',
      ],
    },
    {
      ruleId: 'google-api-key',
      positive: [
        // Google AIza key (exact 39 chars: AIzaSy (6) + 33 chars = 39)
        'AI' + 'zaSy' + '1234567890ABCDEFGHIJKLMN012345678',
        'AI' + 'zaSy' + 'Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4J',
      ],
      negative: [
        // Invalid prefix
        'BI' + 'zaSy' + '1234567890ABCDEFGHIJKLMN012345678',
        // Too short
        'AI' + 'za' + 'short123',
        // Obvious placeholder
        'AI' + 'za' + 'SyD' + 'YOUR_API_KEY_PLACEHOLDER_VALUE12',
      ],
    },
    {
      ruleId: 'stripe-live-key',
      positive: [
        // Stripe sk_live
        'sk_' + 'live_' + '51AbC' + 'dEfGhIjKlMnOpQrStUvWxYz0123456',
        // Stripe rk_live (restricted)
        'rk_' + 'live_' + '51XyZ' + 'aBcDeFgHiJkLmNoPqRsTuVwXyZ01234',
      ],
      negative: [
        // Test key (not a live key)
        'sk_test_' + '51AbCdEfGhIjKlMnOpQrStUvWxYz0123456',
        // Obvious placeholder
        'sk_' + 'live_' + 'YOUR_STRIPE_LIVE_KEY_HERE12345',
      ],
    },
    {
      ruleId: 'slack-token',
      positive: [
        // Bot token (xoxb-)
        'xox' + 'b-' + '123456789012-' + '1234567890123-' + 'AbCdEfGhIjKlMnOpQrStUvWx',
        // User token (xoxp-)
        'xox' + 'p-' + '987654321098-' + '9876543210987-' + 'ZyXwVuTsRqPoNmLkJiHgFeDc',
      ],
      negative: [
        // Invalid prefix
        'xoxz-' + '123456789012-' + '1234567890123-' + 'AbCdEfGhIjKlMnOpQrStUvWx',
        // Obvious placeholder
        'xox' + 'b-' + 'YOUR_SLACK_BOT_TOKEN_PLACEHOLDER_VALUE',
      ],
    },
    {
      ruleId: 'slack-webhook-url',
      positive: [
        'https://hooks.slack.com/services/T' + '12345678/B' + '12345678/' + 'a1b2c3d4e5f6g7h8i9j0k1l2',
        'https://hooks.slack.com/services/T' + 'ABCDEFGH/B' + 'IJKLMNOP/' + 'q1w2e3r4t5y6u7i8o9p0a1s2',
      ],
      negative: [
        // Invalid domain
        'https://evil-hooks.slack.com/services/T12345678/B12345678/a1b2c3d4e5f6g7h8i9j0k1l2',
        // Obvious placeholder
        'https://hooks.slack.com/services/T00000000/B00000000/YOUR_WEBHOOK_URL_PLACEHOLD',
      ],
    },
    {
      ruleId: 'sendgrid-api-key',
      positive: [
        'S' + 'G.' + 'a1B2c3D4e5F6g7H8i9J0k1' + '.' + 'L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6a7B8c9D0e1F2g',
        'S' + 'G.' + 'Z9y8X7w6V5u4T3s2R1q0P9' + '.' + 'O8n7M6l5K4j3I2h1G0f9E8d7C6b5A4z3Y2x1W0v9U8t',
      ],
      negative: [
        // Bad prefix
        'M' + 'G.' + 'a1B2c3D4e5F6g7H8i9J0k1' + '.' + 'L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6a7B8c9D0e1F2g',
        // Obvious placeholder
        'S' + 'G.' + 'YOUR_SENDGRID_API_KEY_HERE' + '.' + 'PLACEHOLDER_TOKEN_VALUE_FOR_SENDING_EMAILS_NOW',
      ],
    },
    {
      ruleId: 'jwt-token',
      positive: [
        'eyJ' + 'hbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 'eyJ' + 'zdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.' + 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'eyJ' + 'hbGciOiJSUzI1NiJ9.' + 'eyJ' + 'pc3MiOiJhdXRoMCJ9.' + 'kE4k7QZ3e2W1x9y8z7a6b5c4d3e2f1g0h9i8j7k6l5m',
      ],
      negative: [
        // Single dot (not 3 parts)
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0',
        // Obvious placeholder
        'eyJhbGciOiJIUzI1NiJ9.YOUR_JWT_PAYLOAD_HERE.YOUR_SIGNATURE_HERE',
      ],
    },
    {
      ruleId: 'pem-private-key',
      positive: [
        '-----' + 'BEGIN RSA PRIVATE KEY-----\n' +
          'MIIEowIBAAKCAQEA0Y1p3q4r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n\n' +
          'opqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghij\n' +
          '-----' + 'END RSA PRIVATE KEY-----',
        '-----' + 'BEGIN PRIVATE KEY-----\n' +
          'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDabc1234567890def\n' +
          'ghi0123456789jklmnopqr0123456789stuvwxyz0123456789ABCDEFGHIJKLMN\n' +
          '-----' + 'END PRIVATE KEY-----',
      ],
      negative: [
        // Public key instead of private key
        '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A\n-----END PUBLIC KEY-----',
        // Empty block
        '-----' + 'BEGIN PRIVATE KEY-----\n-----' + 'END PRIVATE KEY-----',
      ],
    },
    {
      ruleId: 'database-url-credentials',
      positive: [
        'postgres://' + 'app_user:' + 'sUp3rS3cr3tPassw0rd' + '@db.internal.corp:5432/production',
        'mongodb+srv://' + 'admin:' + 'v3ryStr0ngK3y99' + '@cluster0.mongodb.net/test?retryWrites=true',
      ],
      negative: [
        // No password / credentials
        'postgres://localhost:5432/my_database',
        // HTTP URL (not a database URI)
        'https://example.com/api',
      ],
    },
    {
      ruleId: 'url-credentials',
      positive: [
        'https://' + 'deployer:' + 'ghp_deploy_token_987654321' + '@git.company.com/repo.git',
        'http://' + 'service_account:' + 'customSecretPass987' + '@internal.corp.net/v1/sync',
      ],
      negative: [
        // URL without user credentials
        'https://github.com/my-org/my-project',
        // Obvious placeholder credentials
        'https://user:password@example.com/test',
      ],
    },
    {
      ruleId: 'authorization-header',
      positive: [
        'Authorization: Bearer ' + 'dGhpc0lzQVJhbmRvbVRva2VuMTIzNDU2Nzg5MDEy',
        'authorization: basic ' + 'YWRtaW46aHVudGVyMjEyMzQ1Njc4OTA=',
      ],
      negative: [
        // Header without token
        'Authorization: Bearer',
        // Header with obvious placeholder
        'Authorization: Bearer YOUR_TOKEN_HERE',
      ],
    },
    {
      ruleId: 'generic-secret-key-value',
      positive: [
        'API_SECRET = "' + 'x7F#9qK@2mZ$8vL!' + '"',
        'export DATABASE_PASSWORD=' + 'k8J2m9P0v7L4n1X6q3',
      ],
      negative: [
        // Exact trivial word placeholder
        'my_password = "password"',
        // Obvious placeholder
        'api_key="YOUR_API_KEY"',
      ],
    },
    {
      ruleId: 'pii-credit-card',
      positive: [
        // Valid Luhn Visa (4532 0150 0000 0007)
        '4532-0150-0000-0007',
        // Valid Luhn MasterCard (5425 2334 3010 9903)
        '5425 2334 3010 9903',
      ],
      negative: [
        // Invalid Luhn checksum (last digit flipped)
        '4532-0150-0000-0008',
        // Too short
        '4532-0150-00',
        // Monotonous digits
        '0000-0000-0000-0000',
      ],
    },
    {
      ruleId: 'pii-email',
      positive: [
        'contact.support@developer-preview.org',
        'sarah.connor99@cyberdyne-systems.io',
      ],
      negative: [
        // Missing domain
        'invalid.user@',
        // Obvious placeholder starting with YOUR_
        'YOUR_EMAIL@developer-preview.org',
      ],
    },
    {
      ruleId: 'pii-phone',
      positive: [
        '+1 (415) 890-2345',
        '+44 20 7946 0958',
      ],
      negative: [
        // Too short
        '555-12',
        // Monotonous
        '000-000-0000',
        // Obvious sequential
        '123-456-7890',
      ],
    },
  ];
}
