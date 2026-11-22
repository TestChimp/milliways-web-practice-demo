---
workflow-id: project-init
workflow-execution-id: 01M82RS5GD4VM2QDBQARRSF1CN
PlanApproved: yes
---

# Project init — Milliways (SystemDemoV2)

Approved by the project owner as part of the System Demo Project V2 build plan.

## Init action items

| # | Item | Status | Acceptance |
|---|------|--------|------------|
| 1 | Platform comms | done | get-eaas-config returns {} (no 401) with the project API key |
| 2 | Folder mapping | done | plans/ (.testchimp-plans) and tests/ (.testchimp-tests, project_type=web) scaffolded; platform mapping updated |
| 3 | Connect to test environment | done | plans/knowledge/policies/connect-to-test-env.policy.md (local docker + ng serve on 4300, health checks, URL mapping) |
| 4 | Import plans | N/A | No existing plans; stories/scenarios authored next via author-plans |
| 5 | Import tests | N/A | No existing tests in the repo |
