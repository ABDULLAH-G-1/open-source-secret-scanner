# CloakKit 🛡️

> A tiny, zero-dependency library that detects and redacts secrets and PII in text you are about to send to an AI (prompts, `.env` files, logs, `CLAUDE.md`). Everything runs locally; nothing is ever sent anywhere.

[![CI](https://github.com/ABDULLAH-G-1/open-source-secret-scanner/actions/workflows/ci.yml/badge.svg)](https://github.com/ABDULLAH-G-1/open-source-secret-scanner/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](file:///LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](file:///packages/core/package.json)
[![Bundle Size](https://img.shields.io/badge/gzipped%20size-%3C5%20KB-blue.svg)](file:///packages/core)

---

## Demo & Overview

<!-- GIF_PLACEHOLDER_START -->
```
+-------------------------------------------------------------------------------------------------+
|                                     CloakKit Interactive Demo                                   |
|                                                                                                 |
|  [Input Text]                                        [Redacted Output]                          |
|  AWS_KEY="AKIA..."                             -->   AWS_KEY="[AWS_ACCESS_KEY_1]"               |
|  GITHUB="ghp_..."                              -->   GITHUB="[GITHUB_TOKEN_1]"                  |
|  OPENAI="sk-..."                               -->   OPENAI="[OPENAI_KEY_1]"                    |
|  DB="postgres://user:pass@internal/prod"       -->   DB="[DATABASE_URL_1]"                      |
|                                                                                                 |
|  Your text never leaves your browser. The page makes no network requests after it loads.        |
+-------------------------------------------------------------------------------------------------+
```
*(Interactive GIF / Demo preview)*
<!-- GIF_PLACEHOLDER_END -->

---

## One Core, Three Front Doors

CloakKit is architected for convenience across your entire developer workflow:

1. **NPM Library**: Zero runtime dependencies, ESM + CJS + TypeScript types. Works in Browser, Node 18+, and Deno.
2. **CLI (`npx cloakkit`)**: Pipe stdin or inspect files directly in CI, Git pre-commit hooks, or scripts.
3. **Web App**: Your text never leaves your browser. The page makes no network requests after it loads. Live highlighted overlays and 1-click consistent redaction.

---

## What It Catches vs. What It Does Not

### ✅ What CloakKit Catches
- **Cloud Providers**: AWS Access Key IDs (`AKIA...`), AWS Secret Access Keys in key-value context.
- **VCS & Developer Services**: GitHub Personal Access Tokens (`ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`) and fine-grained PATs (`github_pat_`).
- **AI Providers**: OpenAI API Keys (`sk-`, `sk-proj-`, `sk-admin-`) and Anthropic Claude Keys (`sk-ant-`).
- **Payment & Messaging**: Stripe live keys (`sk_live_`, `rk_live_`), Slack bot/user tokens (`xoxb-`, `xoxp-`), and Slack webhook URLs.
- **Email & Auth**: SendGrid keys (`SG....`), JWT tokens (`eyJ...`), PEM private key blocks (`-----BEGIN ... PRIVATE KEY-----`), and HTTP Authorization headers (`Bearer` / `Basic`).
- **Database & URLs**: URIs with embedded credentials (`postgres://user:pass@host`, `mongodb+srv://...`, `https://user:pass@...`).
- **Generic Key-Value Assignments**: Environment keys containing `secret`, `token`, `password`, or `api_key` validated against Shannon entropy thresholds.
- **PII**: Luhn-validated credit cards (Visa, MasterCard, Amex, Discover), email addresses, and phone numbers.

### ❌ What CloakKit Does NOT Catch
- Plain English passwords with low entropy (e.g., `admin123`, `qwerty`).
- Documented examples and common dummy placeholders (e.g., documented AWS example keys, `<API_KEY>`, `YOUR_API_KEY`).
- Custom obfuscated secrets, encrypted binary payloads, or proprietary hash formats without registered patterns.

---

## Quickstart & Installation

### NPM Library

```bash
npm install cloakkit
```

```typescript
import { scan, redact } from 'cloakkit';

const prompt = `
Please fix my query:
DATABASE_URL="postgres://admin:sUp3rPass@db.internal:5432/app"
OPENAI_KEY="sk-..."
`;

// 1. Scan for findings
const findings = scan(prompt);
console.log(findings);
/*
[
  {
    ruleId: 'database-url-credentials',
    label: 'Database URL with Credentials',
    severity: 'high',
    confidence: 'high',
    start: 36,
    end: 84,
    preview: 'pos...app',
    line: 3,
    column: 14
  },
  ...
]
*/

// 2. Redact text with consistent numbered placeholders
const result = redact(prompt);
console.log(result.text);
/*
Please fix my query:
DATABASE_URL="[DATABASE_URL_1]"
OPENAI_KEY="[OPENAI_KEY_1]"
*/
```

### CLI

Scan a file or pipe stdin directly:

```bash
# Scan a file
npx cloakkit .env

# Redact and pipe into clipboard or another tool
cat prompt.txt | npx cloakkit --redact

# CI / Pre-commit enforcement (exit code 1 on findings)
npx cloakkit .env --fail-on high

# Output structured JSON findings
cat CLAUDE.md | npx cloakkit --json
```

**CLI Flags:**
- `--redact`: Output the redacted text with numbered placeholders.
- `--json`: Output findings in JSON format.
- `--fail-on <high|medium|low>`: Exit with code 1 if findings meet or exceed severity.
- `--no-pii`: Disable Personally Identifiable Information (PII) scanning.
- `--no-entropy`: Disable Shannon entropy filtering.
- `-h, --help`: Display help documentation.
- `-v, --version`: Display version information.

### Web Application

Launch the local web application:

```bash
npm run build --workspace=@cloakkit/web
npm run dev --workspace=@cloakkit/web
```

The web application is protected by a strict Content-Security-Policy:
```http
connect-src 'none';
```
This guarantees that the browser cannot make any outbound HTTP or WebSocket network requests. Your text never leaves memory.

---

## Core API Reference

### `scan(text: string, options?: ScanOptions): Finding[]`

Scans text for secrets and PII and returns an array of findings.

```typescript
interface Finding {
  ruleId: string;
  label: string;
  severity: 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  start: number;
  end: number;
  preview: string; // Masked representation (never full secret)
  line: number;    // 1-indexed line number
  column: number;  // 1-indexed column offset
}
```

### `redact(text: string, options?: ScanOptions): RedactResult`

Scans and replaces secret occurrences with consistent numbered placeholders (e.g. `[OPENAI_KEY_1]`). Identical secrets encountered multiple times receive the exact same placeholder.

```typescript
interface RedactResult {
  text: string;
  findings: Finding[];
}
```

### `ScanOptions`

```typescript
interface ScanOptions {
  include?: string[];     // Only evaluate these rule IDs
  exclude?: string[];     // Skip these rule IDs
  pii?: boolean;          // Enable PII detection (default: true)
  entropy?: boolean;      // Enable Shannon entropy heuristics (default: true)
  customRules?: Rule[];   // Custom user-defined detection rules
  allowlist?: string[];   // Specific strings to ignore and leave unredacted
}
```

### Inline Ignore Directive

Add `// scan:ignore` or `# scan:ignore` anywhere on a line to skip that line from all scanning:

```bash
AWS_ACCESS_KEY_ID="AKIA..." # scan:ignore
```

---

## Active Detection Rules

The following rules are built into CloakKit:

<!-- RULES_TABLE_START -->

| Rule ID | Label | Category | Severity | Confidence | Reference / Docs |
|:---|:---|:---:|:---:|:---:|:---|
| `aws-access-key-id` | AWS Access Key ID | `secret` | **HIGH** | high | [Docs](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) |
| `aws-secret-access-key` | AWS Secret Access Key | `secret` | **HIGH** | high | [Docs](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) |
| `github-token` | GitHub Token | `secret` | **HIGH** | high | [Docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github) |
| `openai-api-key` | OpenAI API Key | `secret` | **HIGH** | high | [Docs](https://platform.openai.com/docs/api-reference/authentication) |
| `anthropic-api-key` | Anthropic API Key | `secret` | **HIGH** | high | [Docs](https://docs.anthropic.com/en/api/getting-started) |
| `google-api-key` | Google API Key | `secret` | **HIGH** | high | [Docs](https://cloud.google.com/docs/authentication/api-keys) |
| `stripe-live-key` | Stripe Live Key | `secret` | **HIGH** | high | [Docs](https://docs.stripe.com/keys) |
| `slack-token` | Slack Token | `secret` | **HIGH** | high | [Docs](https://api.slack.com/authentication/token-types) |
| `slack-webhook-url` | Slack Webhook URL | `secret` | **HIGH** | high | [Docs](https://api.slack.com/messaging/webhooks) |
| `sendgrid-api-key` | SendGrid API Key | `secret` | **HIGH** | high | [Docs](https://docs.sendgrid.com/for-developers/sending-email/api-keys) |
| `jwt-token` | JSON Web Token (JWT) | `secret` | **MEDIUM** | high | [Docs](https://jwt.io/introduction) |
| `pem-private-key` | PEM Private Key | `secret` | **HIGH** | high | [Docs](https://datatracker.ietf.org/doc/html/rfc7468) |
| `database-url-credentials` | Database URL with Credentials | `secret` | **HIGH** | high | [Docs](https://www.iana.org/assignments/uri-schemes/prov/mongodb) |
| `url-credentials` | URL with Embedded Credentials | `secret` | **HIGH** | medium | [Docs](https://datatracker.ietf.org/doc/html/rfc3986#section-3.2.1) |
| `authorization-header` | Authorization Header Token | `secret` | **HIGH** | high | [Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization) |
| `generic-secret-key-value` | Generic Secret Assignment | `secret` | **MEDIUM** | medium | [Docs](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) |
| `pii-credit-card` | Credit Card Number | `pii` | **HIGH** | high | [Docs](https://en.wikipedia.org/wiki/Luhn_algorithm) |
| `pii-email` | Email Address | `pii` | **LOW** | medium | [Docs](https://datatracker.ietf.org/doc/html/rfc5322) |
| `pii-phone` | Phone Number | `pii` | **LOW** | low | [Docs](https://en.wikipedia.org/wiki/Telephone_numbering_plan) |

<!-- RULES_TABLE_END -->

---

## Limitations & Disclaimer

> [!WARNING]
> **Best effort, not a guarantee. Review text before you send it.**

- **Static Heuristics**: CloakKit relies on targeted regular expressions, Luhn checksums, and Shannon entropy analysis. Adversarial obfuscation, base64-wrapped data, or unconventional naming conventions might bypass pattern checks.
- **Context Boundaries**: A string with high entropy that is not prefixed or placed in a recognizable variable declaration might be skipped to avoid aggressive false positives on random hashes.
- **Never rely on automated redaction alone** for classified, mission-critical, or high-risk military/healthcare infrastructure secrets without human-in-the-loop validation.

---

## References & Credits

Rule patterns and formats are independently verified against the following public specifications:
- [AWS IAM Access Key Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
- [GitHub Token Formats & Verification](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)
- [OpenAI Authentication Documentation](https://platform.openai.com/docs/api-reference/authentication)
- [Anthropic Claude API Reference](https://docs.anthropic.com/en/api/getting-started)
- [Stripe API Keys Reference](https://docs.stripe.com/keys)
- [Slack Webhooks & Token Formats](https://api.slack.com/authentication/token-types)
- [SendGrid API Key Structure](https://docs.sendgrid.com/for-developers/sending-email/api-keys)
- [RFC 7519 JSON Web Token (JWT)](https://jwt.io/introduction)
- [RFC 7468 Textual Encodings of PKIX Artifacts (PEM)](https://datatracker.ietf.org/doc/html/rfc7468)
- [RFC 3986 Uniform Resource Identifier (URI) Generic Syntax](https://datatracker.ietf.org/doc/html/rfc3986)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Gitleaks Public Rule Patterns](https://github.com/gitleaks/gitleaks) (Reference format cross-checks)

---

## License

[MIT](file:///LICENSE) © 2026 CloakKit Contributors.
