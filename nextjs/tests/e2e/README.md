# E2E tests (skeleton)

Run these tests with the project's integration vitest config. These are skeleton files intended for further expansion.

Run all E2E tests:

```bash
npx vitest -c vitest.integration.config.ts
```

Run a single file while developing:

```bash
npx vitest -c vitest.integration.config.ts tests/e2e/auth.e2e.test.ts
```

Notes:

- The fixtures use `E2E_BASE_URL` if set, otherwise default to `http://localhost:3000`.
- These tests prefer API-driven setup; adapt to use Playwright or another browser automation tool if you need UI verification.
