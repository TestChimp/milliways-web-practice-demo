---
type: scenario
id: TS-112
title: Unknown coupon codes are rejected
story: US-102
created_date: 2026-11-22
priority: medium
verification_strategy: auto
---

## Prerequisites

- User is signed in
- Order has at least one item

## Test Steps

1. Enter coupon FREELUNCH
2. Place order

## Expected Behaviour

- Error 'Coupon FREELUNCH is not valid' is shown
- No order is created
