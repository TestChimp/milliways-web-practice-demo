---
workflow_id: run-qa
workflow_execution_id: 01M82V1DVGTYWMZ825CMAQKWPG
LastRunOnCommit: 18e08567d439df8d579ae43fbea216f3da1341ac
PlanApproved: yes
---

# Run QA — Milliways baseline suite

Approved by the project owner (System Demo Project V2 build).

## Tests to write

| Test | Type | Scenarios | Tags |
|------|------|-----------|------|
| new guest signs up and lands on the welcome screen | UI | #TS-100 | @smoke |
| returning user signs in with valid credentials | UI | #TS-101 | @smoke |
| sign-in with a wrong password shows an error | UI | #TS-102 | @regression |
| menu shows main dishes and drinks with prices | UI | #TS-104 | @regression |
| add a menu item with a chosen quantity to the order | UI | #TS-105 | @smoke |
| choose a spice level for a main dish | UI | #TS-106 | @regression |
| place a standard delivery order to Earth paid by card | UI | #TS-107, #TS-115 | @smoke |
| express delivery adds the express fee | UI | #TS-108 | @regression |
| DONTPANIC coupon takes 42% off the food subtotal | UI | #TS-111 | @regression |
| unknown coupon codes are rejected | UI | #TS-112 | @regression |
| Orders API: standard / express / coupon / invalid coupon / missing address / list+status | API | #TS-107, #TS-108, #TS-111, #TS-112, #TS-114, #TS-115 | @smoke/@regression |
| Auth and menu API: sign-up+sign-in / wrong password / menu | API | #TS-100, #TS-101, #TS-102, #TS-104 | @smoke/@regression |

Arrange: fresh user per test via POST /auth/signup (fixtures/user.fixture.js); no seed endpoints needed. Act/Assert: see each spec. Mocking: none (real backend). TrueCoverage: instrumented (plans/events). ExploreChimp: yes (markScreenState on UI journeys).

Not covered yet (planned follow-ups): #TS-103, #TS-109, #TS-110, #TS-113, #TS-116, #TS-117.

## Checklist

- [x] Fixtures and page helpers
- [x] Specs authored with scenario annotations and suite tags
- [x] Screen states registered
- [x] Final validation batch (release v1.0.0, ExploreChimp, API capture) — batch 01M82V1H5CXFSEKRCAN9KWH11A: 20 passed, 1 failed (express countdown bug, expected); ExploreChimp COMPLETED_EXPLORATION
