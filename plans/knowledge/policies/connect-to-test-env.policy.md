---
workflow-id: connect-to-test-env
version: 1.0.0
---

### Summary

How this project brings up Milliways (Angular web + Node API + Postgres) for create-tests, smart smoke, ExploreChimp, perf and related flows.

### Pre-Execute Workflows

### Post-Execute Workflows

### Scoping Rules

Use the skill-wide rule (explicit scope → feature-branch changes → default branch).

## Local Agent

### When on a feature branch

1. **Local up (API + DB):** from the repo root run `./scripts/qa/local-up.sh` (Docker Compose: `postgres` on 5432, `api` on 3001).
2. **Web:** `cd web && npm install && npx ng serve --port 4300` (port 4200 may be taken by another checkout on this machine; any free port works if `.env-QA` is updated).
3. **Wait for healthy:** `curl -sf http://localhost:3001/health` returns `{"ok":true}` and `curl -sf http://localhost:4300/` returns 200.
4. **URL mapping (tests/.env-QA):**
   - `BASE_URL=http://localhost:4300` (web UI; the dev server proxies `/auth`, `/menu`, `/orders`, `/qa` to the API)
   - `API_BASE_URL=http://localhost:3001` (direct API tests)
5. **Teardown:** `docker compose down` (add `-v` to wipe the database); stop the `ng serve` process.

### When on default branch

Same local-up contract as the feature branch. There is no shared staging environment for this demo app.

## CI / Cloud

On the runner: `docker compose up --build -d`, wait for `http://localhost:3001/health`, then `cd web && npm ci && npx ng serve --port 4300 &` and wait for `http://localhost:4300/`. Export the same `BASE_URL` / `API_BASE_URL` as Local Agent before running Playwright from `tests/`.

## Auth flows

- Provider: custom (demo backend). `POST /auth/signup` and `POST /auth/signin` with email + password; token format `demo-user-<id>`.
- Ladder step: 3 — create a fresh user per test via `POST /auth/signup` (unique email) and sign in through the UI.
- No email verification, OTP or MFA.

## Performance testing (when enabled)

- Target: local Docker stack only (`http://localhost:3001`). There is no production for this demo; never point k6 at any other host.
- Limits approved for this demo: max 20 VUs, max 2 minutes per run.
- Seed: k6 setup creates its own users via `POST /auth/signup` with a `perf-` email prefix; no teardown needed (local DB).
- External dependencies: none.
