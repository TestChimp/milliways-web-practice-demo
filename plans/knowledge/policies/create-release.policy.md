---
workflow-id: create-release
version: 1.0.0
allow-execute-without-approval: false
---

### Summary

Release QA posture for Milliways. Locked with the recommended defaults (project owner, 2026-11-23).

### Tag convention

semver `vMAJOR.MINOR.PATCH` (e.g. `v1.0.0`).

### Scope default

- MAJOR: full (focus area: root `plans/stories`)
- MINOR: changed
- HOTFIX: changed

### By release type

## MAJOR

- upkeep: no (suite authored for this release; nothing to trim yet)
- suite_execution: full
- explorechimp: yes
- perf: run
- security_static: yes
- security_dast: ask

## MINOR

- upkeep: no
- suite_execution: smart-smoke
- explorechimp: yes
- perf: run
- security_static: no
- security_dast: never

## HOTFIX

- upkeep: no
- suite_execution: smart-smoke
- explorechimp: no
- perf: never
- security_static: no
- security_dast: never

### Subflows

upkeep, execute-tests, run-smart-smoke, run-explorechimp, upkeep-perf, run-perf-tests, run-release-check
