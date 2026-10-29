# Security Policy

## Responsible Disclosure & Reporting Issues

Security and confidentiality are at the heart of CloakKit. If you discover a security vulnerability in CloakKit itself, or notice a missed credential pattern that should be detected, please follow this disclosure process.

### Reporting a Vulnerability

If you believe you have discovered a vulnerability in the CloakKit code (e.g., regex Denial of Service, unintended data persistence, or bypass):

1. **Do NOT open a public GitHub issue.**
2. Send an email to the security contacts or submit a private advisory on GitHub via **Security > Report a vulnerability**.
3. Include:
   - Detailed steps to reproduce
   - Environment details (Node.js version, OS, browser)
   - Proof of concept input

### Reporting a Missed Secret Format

If you encounter an API key, credential, or token format that CloakKit fails to catch:

> [!CAUTION]
> **NEVER paste live, active, or real secrets into public issue trackers or emails.**

To submit a missed secret format safely:
1. Revoke any real credential immediately.
2. Anonymize the credential by replacing alphanumeric characters with placeholder characters (e.g., `'ghp_' + 'a'.repeat(36)`).
3. Include the provider name, token type, and link to official provider documentation specifying the key structure.
4. Open an issue using the [Missed Secret Template](https://github.com/ABDULLAH-G-1/open-source-secret-scanner/issues/new?template=missed_secret.yml).

### Threat Model & Boundaries

- **Local Execution**: CloakKit executes 100% locally on your machine or inside the browser sandbox. No input text is transmitted anywhere.
- **Content Security Policy (Web)**: The web interface is strictly sandboxed with `connect-src 'none'`, mathematically precluding network exfiltration.
- **Heuristic Limitations**: Static regex and Shannon entropy are best-effort heuristics. They cannot replace manual human verification before sharing confidential data.
