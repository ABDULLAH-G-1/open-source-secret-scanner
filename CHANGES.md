# Changes & Verification Log

## 1. Project Naming & Availability Verification

In accordance with the specification:
> "Pick the first name that is free on BOTH npm (`npm view <name>` returns 404) and GitHub from: prepaste, hushkit, redactkit, scrubkit. If none is free, invent a short similar name and check it the same way. Use it everywhere. Report the chosen name in CHANGES.md."

### Evaluation of Candidates:
- `prepaste`:
  - `npm view prepaste` -> **404 Not Found**
  - `curl -sI https://github.com/prepaste` -> **200 OK** (Taken: GitHub organization `https://github.com/prepaste` exists with repository `prepaste.github.io`).
- `hushkit`:
  - `npm view hushkit` -> **Taken** (version `0.1.1` published 7 months ago).
- `redactkit`:
  - `npm view redactkit` -> **Taken** (version `1.0.2` published).
- `scrubkit`:
  - `npm view scrubkit` -> **Taken/Unavailable** (`E404 Unpublished on 2026-03-10`, npm registry disallows reusing unpublished names).
  - `curl -sI https://github.com/scrubkit` -> **200 OK** (Taken on GitHub).

Because none of the initial four candidates was free on **both** platforms, similar candidate names matching the `...kit` convention were checked:
- **`cloakkit`**:
  - `npm view cloakkit` -> **404 Not Found** (`E404: The requested resource 'cloakkit@*' could not be found`).
  - `curl -sI https://github.com/cloakkit` -> **404 Not Found** (`HTTP/1.1 404 Not Found`).

**Chosen Name**: **`cloakkit`** (used universally across packages, CLI, web app, and documentation).

---

## 2. Command Execution & Test Output Summary

### 2.1 Test Suite (`npm test` / Vitest)
All 6 test files and 123 test cases passed:

```
> test
> vitest run


 RUN  v2.1.9 D:/open-source secret scanner

stdout | packages/core/test/size.test.ts > Bundle Size Verification > core bundle must stay under 10 KB gzipped

========================================
Core Bundle (dist/index.mjs) Size Check:
Raw Size:      13401 bytes (13.09 KB)
Gzipped Size:  4858 bytes (4.74 KB)
Limit:         10240 bytes (10.00 KB)
Status:        PASS (Under 10 KB)
========================================


 ✓ packages/core/test/size.test.ts (1 test) 5ms
 ✓ packages/core/test/entropy.test.ts (3 tests) 5ms
 ✓ packages/core/test/luhn.test.ts (3 tests) 5ms
 ✓ packages/core/test/placeholder-logic.test.ts (8 tests) 19ms
 ✓ packages/core/test/redactor.test.ts (8 tests) 32ms
 ✓ packages/core/test/rules.test.ts (100 tests) 31ms

 Test Files  6 passed (6)
      Tests  123 passed (123)
   Start at  20:40:33
   Duration  1.05s (transform 617ms, setup 0ms, collect 1.61s, tests 97ms, environment 2ms, prepare 1.36s)
```

### 2.2 Core Bundle Size Check
- Target: Under 10 KB gzipped.
- **Actual raw size**: 13.09 KB (13,401 bytes).
- **Actual gzipped size**: **4.74 KB** (4,858 bytes) — well under the 10 KB limit.
- **Runtime dependencies**: **0** (strictly zero external production dependencies).

### 2.3 Package Dry Run (`npm pack --dry-run` in `packages/core`)
```
npm notice package: cloakkit@0.1.0
npm notice Tarball Contents
npm notice 5.5kB  bin/cloakkit.cjs
npm notice 13.7kB dist/index.cjs
npm notice 44.8kB dist/index.cjs.map
npm notice 3.2kB  dist/index.d.mts
npm notice 3.2kB  dist/index.d.ts
npm notice 13.1kB dist/index.mjs
npm notice 44.0kB dist/index.mjs.map
npm notice 1.3kB  package.json
npm notice Tarball Details
npm notice name:          cloakkit
npm notice version:       0.1.0
npm notice package size:  34.1 kB
npm notice unpacked size: 128.8 kB
npm notice total files:   8
```

### 2.4 Monorepo Build (`npm run build`)
```
> build
> npm run build:core && npm run build:web


> build:core
> npm run build --workspace=cloakkit


> cloakkit@0.1.0 build
> tsup

CLI Building entry: src/index.ts
CLI Using tsconfig: tsconfig.json
CLI tsup v8.5.1
CLI Using tsup config: D:\open-source secret scanner\packages\core\tsup.config.ts
CLI Target: node18
CLI Cleaning output folder
ESM Build start
CJS Build start
ESM dist\index.mjs     13.09 KB
ESM dist\index.mjs.map 44.02 KB
ESM ⚡️ Build success in 76ms
CJS dist\index.cjs     13.68 KB
CJS dist\index.cjs.map 44.80 KB
CJS ⚡️ Build success in 76ms
DTS Build start
DTS ⚡️ Build success in 1391ms
DTS dist\index.d.mts 3.17 KB
DTS dist\index.d.ts  3.17 KB

> build:web
> npm run build --workspace=@cloakkit/web


> @cloakkit/web@0.1.0 build
> tsc && vite build

vite v5.4.21 building for production...

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
⚠️  WARNING: SITE_URL in apps/web/src/constants/site.ts contains "TODO"
   Current value: https://cloakkit-app.vercel.app/
   Update this with your real production domain before launch.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

transforming...
✓ 1565 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   2.60 kB │ gzip:  0.90 kB
dist/assets/index-BpViju2c.css   25.02 kB │ gzip:  4.94 kB
dist/assets/index-Co6S-dlH.js   179.55 kB │ gzip: 56.76 kB
✓ built in 2.68s
```

### 2.5 CLI Smoke Test
Tested directly via `node ./packages/core/bin/cloakkit.cjs`:
- Input file scanning: accurately detected GitHub tokens, AWS keys, and emails.
- Masked preview: printed safe masks (`ghp...7R8`, `AKI...DEF`, `dev...nal`), never the full secret.
- Redact output (`--redact`): replaced secrets with consistent placeholders `[GITHUB_TOKEN_1]`, `[AWS_ACCESS_KEY_1]`, `[EMAIL_1]`.
- Stdin piping (`cat .env | cloakkit --redact`): verified identical output.
- Inline ignore: lines containing `// scan:ignore` skipped without generating findings.
- CI gatekeeper (`--fail-on high`): returned exit code 1 on finding high-severity secrets.

---

## 3. Architecture & Implementation Decisions

1. **GitHub Push Protection Compliance**:
   - Zero real-looking token literals exist anywhere in the repository.
   - All test fixtures in `fixtures.ts`, sample text in `sample.ts`, and CLI smoke tests are dynamically assembled at runtime via string concatenation (e.g. `'ghp_' + 'a'.repeat(36)`).
2. **Overlap Resolution & Rule Disambiguation**:
   - Scanner prioritizes specific provider rules (e.g., `openai-api-key`, `github-token`) over generic rules (`generic-secret-key-value`, `url-credentials`) when match spans overlap.
   - Anthropic pattern excluded from OpenAI pattern via negative lookahead `(?!(?:ant)-)` to eliminate false collision.
3. **Network Claim Verification**:
   - `apps/web/index.html` enforces CSP: `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none';`.
   - All external fonts and CDNs removed in favor of a native system font stack.
   - Your text never leaves your browser. The page makes no network requests after it loads.

---

## 4. Items Not Verified in Local Environment

1. **Remote Git Push & Commits**: Omitted per explicit instructions ("Do not git push and do not commit").
2. **Live Vercel Deployment**: Root `vercel.json` configured with `buildCommand: "npm run build --workspace=@cloakkit/web"` and `outputDirectory: "apps/web/dist"`, but live hosting requires user's Vercel deployment credentials.
3. **Live NPM Publish**: Verified locally via `npm pack --dry-run`.

---

## 5. Follow-Up Fixes & Verification

### 5.1 Placeholder Logic (False Negative Elimination)
- **Constraint Implemented**: A candidate secret value may be skipped as a placeholder **only** when the secret value itself is an explicit placeholder:
  1. All the same character (`xxxx`, `0000`, `11111111`).
  2. Starts with `YOUR_` or `<...>` (e.g. `YOUR_API_KEY`, `<token>`).
  3. Equals `changeme`, `password`, `secret`, or `example` (case-insensitive).
  4. Is exactly the documented AWS example key (`AKIAIOSFODNN7EXAMPLE` / `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`).
  The words "example", "test", or "sample" appearing in the host, comment, or elsewhere on the line **must NOT** cause a skip.
- **Dedicated Test Suite**: `packages/core/test/placeholder-logic.test.ts`
  All fixtures dynamically built at runtime.
  - Test `(a) detects database URL whose host contains "example" with a random-looking password`: **PASS**
  - Test `(b) detects a real-looking GitHub token on a line that also has a comment "# example config"`: **PASS**
  - Test `(c) detects the same key inside a file whose text says "sample" and "test" nearby`: **PASS**
  - Test `skips when secret value itself is all the same character (xxxx, 0000)`: **PASS**
  - Test `skips when secret value starts with YOUR_ or <...>`: **PASS**
  - Test `skips when secret value equals changeme / password / secret / example`: **PASS**
  - Test `skips exactly the documented AWS example keys`: **PASS**
  - Test `does NOT skip when "example", "test", or "sample" appears in host or password or context`: **PASS**

### 5.2 Network Claim & Zero-Network Verification
- **CSP Updated**: In `apps/web/index.html`:
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none';" />
  ```
- **Font Stack**: External Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) links completely removed. Replaced with pure system font stack in `tailwind.config.ts`.
- **Browser Subagent Testing Report**:
  - The built web application was served on `http://localhost:4173/`.
  - Browser subagent loaded the page, loaded sample text via "Load Sample" button, clicked "Copy Redacted", clicked theme toggle (dark/light), clicked PII detection switch, and clicked Entropy validation switch.
  - Console inspection confirmed **0 CSP violations**, **0 console errors**, and **0 outbound network requests** after initial asset loading.
- **Copy Alignment**: All occurrences of "air-gapped" and "zero network traffic" across UI, README, and documentation updated to:
  > *"Your text never leaves your browser. The page makes no network requests after it loads."*

### 5.3 Secret Literal Scan Before Push
A complete regex scan of the working tree (excluding `node_modules` and `dist`) was conducted for all prohibited token patterns:
1. `ghp_/gho_/ghu_/ghs_/ghr_` followed by 36 characters: **0 matches**
2. `github_pat_`: **0 literal matches** (broken into `'github_' + 'pat_'` in test fixtures; regex pattern preserved in rule)
3. `AKIA` followed by 16 uppercase/digits: **0 matches** (truncated to `AKIA...` in docs, concatenated at runtime in tests & placeholders)
4. `sk-ant-`: **0 literal matches** (broken into `'sk-' + 'ant-'` in sample and fixtures; regex definition preserved)
5. `sk-proj-`: **0 literal matches** (broken into `'sk-' + 'proj-'` in sample and fixtures; truncated to `sk-...` in docs)
6. `AIza` followed by 35 chars: **0 matches** (broken into `'AI' + 'zaSy' + ...` in fixtures)
7. `sk_live_`: **0 literal matches** (broken into `'sk_' + 'live_'` in sample and fixtures)
8. `xox[baprs]-`: **0 literal matches** (broken into `'xox' + 'b-'` / `'xox' + 'p-'` in fixtures)
9. `SG.` with two segments: **0 literal matches** (broken into `'S' + 'G.' + ...` in fixtures)
10. `PEM BEGIN PRIVATE KEY` blocks: **0 literal matches** (assembled dynamically at runtime as `'-----' + 'BEGIN...'`)
