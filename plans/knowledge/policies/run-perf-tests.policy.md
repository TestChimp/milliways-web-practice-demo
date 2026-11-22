---
workflow-id: run-perf-tests
version: 1.0.0
allow-execute-without-approval: false
---

### Summary

Project-specific safety and repeatability decisions for k6 performance runs.
This policy supplies limits; TestChimp/TrueCoverage signals only select and
relatively weight journeys.

### Scoping Rules

Use explicit files first, then the generated related-perf selection for branch
changes. Ask before running a composite not named in the approved plan.

## Environment safety

- allowed_environment: local docker stack (demo only)
- base_url_source: API_BASE_URL (tests/.env-QA, default http://localhost:3001)
- health_check: curl -sf http://localhost:3001/health returns {"ok":true}
- production_allowed: false
- owner: TestChimp team (demo project)
- abort_command: Ctrl+C the k6 process; docker compose restart api

## Approved profile limits

```yaml
smoke:
  max_vus: 1
  max_duration: 30s
load:
  # Peak concurrent users (ramping-vus). Null until the team sets N.
  max_vus: 20
  think_time_sec: 1
  ramp_step: 15s
  hold_at_peak: 30s
  max_rps: null
  max_duration: 2m
volume:
  max_vus: 1
  # 10/50/100 holds in one k6 run (volume_size chart). Null until approved.
  staircase_pct: [10, 50, 100]
  step_duration: null
  max_duration: null
  max_records_per_tenant: null
```

`null` means **not configured**, not unlimited. Load/volume must stop until the
user/team supplies values. `max_vus` for load is the **peak** of the ramp.
Do not derive values from production observations.

## Data lifecycle

- seed_command: none — journeys create their own guests via POST /auth/signup
- teardown_command: docker compose down -v (local demo DB)
- namespace: perf- email prefix
- permitted_dataset_manifests:
  - k6/datasets/load.example.json
  - k6/datasets/volume.example.json

## Dependency modes

- llm_default: mock
- llm_mock_latency_ms: 250
- llm_mock_jitter_ms: 0
- llm_mock_error_rate: 0
- real_llm_requires_explicit_approval: true
- external_dependencies_default: stubbed
- zero_latency_stubs_allowed: false
- real_external_requires_explicit_approval: true
- external_dependencies:
  # - name: <!-- payment | email | idp | partner-api | … -->
  #   mode: stubbed  # stubbed | real (real needs approval)
  #   harness: <!-- env WireMock/stub service | k6/lib/mock-external.js -->
  #   latency_ms: <!-- realistic p50-class; not 0 for load/volume -->
  #   jitter_ms: 0
  #   error_rate: 0
  #   latency_evidence: <!-- REAL E2E timing | ops telemetry | documented typical -->
  []

## Baseline and comparison

- baseline_environment: local docker stack
- require_matching_profile: true
- require_matching_dataset: true
- require_matching_llm_mode: true
- require_matching_dependency_mocks: true
- threshold_changes_require_approval: true

## Composite membership

Agents must prompt for every add/remove/weight change. Relative weights do not
authorize absolute concurrency or arrival rate.
