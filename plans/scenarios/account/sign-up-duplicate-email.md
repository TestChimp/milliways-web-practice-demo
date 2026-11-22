---
type: scenario
id: TS-103
title: Signing up with an already registered email is rejected
story: US-100
created_date: 2026-11-22
priority: low
verification_strategy: auto
---

## Prerequisites

- An account exists for the email

## Test Steps

1. Open Sign up
2. Enter the same email
3. Submit

## Expected Behaviour

- An 'Email already exists' error is shown
- No second account is created (API returns 409)
