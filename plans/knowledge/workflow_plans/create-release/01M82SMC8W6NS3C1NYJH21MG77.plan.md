---
workflow-id: create-release
workflow-execution-id: 01M82SMC8W6NS3C1NYJH21MG77
PlanApproved: yes
---

# Create release v1.0.0 (MAJOR)

Approved by the project owner (System Demo Project V2 build). Cut: 15ae49bf5ec92bc6b70d9e9ef3b059431ac5b23d. Scope: full (root plans/stories). DAST confirmed by the owner.

- [x] upsert-release v1.0.0 MAJOR, focus area plans/stories
- [x] named test run "default"
- [x] security scans: SAST (FULL_REPOSITORY, STANDARD), deps (FULL_DEPENDENCY_TREE, STANDARD), leaks (ALL_REPOSITORY_SECRETS), DAST (QA, active, SMOKE)
- [x] full suite execution with TESTCHIMP_RELEASE + TESTCHIMP_TEST_RUN_ID, ExploreChimp on, API capture on, video on
- [x] perf: run-perf-tests (place-order, order-history)
- [x] GATE + QA posture summary
