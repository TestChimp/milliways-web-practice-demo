---
title: sign-up-failed
description: Sign-up was rejected by the API.
added-on: 2026-11-23
significance: 2
---

## Rationale

Shows how often guests hit duplicate-email errors, which the SmartTests only cover via TS-103.

Requirements: #US-100, #TS-103.

## Metadata keys

- `error.kind` — email_taken | other
