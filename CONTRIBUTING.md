# Contributing to CloakKit

Thank you for your interest in improving CloakKit! CloakKit is designed to be lightweight, zero-dependency, and extremely reliable for scanning and redacting secrets before text is passed to LLMs.

---

## How to Add a New Rule (One File + Tests)

Adding a rule to CloakKit requires editing or adding a single file in `packages/core/src/rules/` and adding test fixtures.

### Step 1: Create or Update the Rule File

Create a file in `packages/core/src/rules/<provider>.ts`:

```typescript
import { Rule } from '../types.js';
import { isObviousPlaceholder } from '../placeholders.js';

export const myProviderRules: Rule[] = [
  {
    id: 'my-provider-api-key',
    label: 'MyProvider API Key',
    description: '32-character API key for MyProvider services',
    category: 'secret', // 'secret' | 'pii'
    severity: 'high',   // 'high' | 'medium' | 'low'
    confidence: 'high', // 'high' | 'medium' | 'low'
    regex: /\bmp_[a-zA-Z0-9]{32}\b/g,
    placeholderPrefix: 'MY_PROVIDER_KEY',
    docsUrl: 'https://docs.myprovider.com/authentication',
    validator: (match) => {
      // Return false if match is an obvious placeholder or fails checksum
      return !isObviousPlaceholder(match[0]);
    },
  },
];
```

### Step 2: Register the Rule in the Index

Add the new rule export to [`packages/core/src/rules/index.ts`](file:///packages/core/src/rules/index.ts):

```typescript
import { myProviderRules } from './my-provider.js';

export const standardRules: Rule[] = [
  ...
  ...myProviderRules,
];
```

### Step 3: Add Test Fixtures

> [!CRITICAL]
> **Never write real-looking tokens as raw literals in the repository.** GitHub Push Protection will automatically block commits containing token-like literals. Always construct test fixtures dynamically at runtime using string concatenation.

Open [`packages/core/test/fixtures.ts`](file:///packages/core/test/fixtures.ts) and add at least **2 positive** and **2 negative** fixtures:

```typescript
{
  ruleId: 'my-provider-api-key',
  positive: [
    'mp_' + 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    'mp_' + 'Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4',
  ],
  negative: [
    // Too short
    'mp_' + 'short123',
    // Obvious placeholder
    'mp_' + 'YOUR_API_KEY_PLACEHOLDER_STRING1',
  ],
}
```

### Step 4: Run the Tests

Execute vitest:

```bash
npm test
```

All 5 test suites (rules fixtures, redactor consistency, Luhn validator, Shannon entropy, and bundle size) must pass.

### Step 5: Regenerate the Rules Table

Update the documentation table automatically:

```bash
npm run generate:rules
```

---

## Guidelines for New Rules

1. **Zero Runtime Dependencies**: The core package MUST maintain zero external runtime dependencies.
2. **Bundle Size**: The core package bundle must stay strictly under **10 KB gzipped**.
3. **Official Documentation Reference**: Link to provider docs or RFC standards. If format cannot be officially verified, set `isExperimental: true` and `confidence: 'medium'`.
4. **Skip Obvious Placeholders**: Always use `isObviousPlaceholder` in your validator to avoid flagging examples in documentation.
