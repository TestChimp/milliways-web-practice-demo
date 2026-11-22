# AI test instructions

### TrueCoverage Plan

- Opted in. Web SDK `@testchimp/rum-js`, initialised in `web/src/main.ts` via `initRum()`.
- RUM `environment` tag: `QA` by default (matches SmartTests `TESTCHIMP_ENV=QA`). Real-user traffic is tagged `production` (`window.__MILLIWAYS_RUM_ENV`). Use `production` as the base scope and `QA` with `automationEmitsOnly: true` as the comparison scope.
- Events and metadata: `plans/events/`; tracker: `plans/knowledge/truecoverage-instrument-progress.md`.

### API capture

- Run SmartTests with `TESTCHIMP_ENABLE_API_CAPTURE=1` so API payloads feed API contract coverage (OpenAPI root `backend/openapi.yaml`).
