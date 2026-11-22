---
type: scenario
id: TS-111
title: DONTPANIC coupon takes 42% off the food subtotal
story: US-102
created_date: 2026-11-22
priority: high
verification_strategy: auto
---

## Prerequisites

- User is signed in
- Order subtotal is at least ₭20

## Test Steps

1. Enter coupon DONTPANIC
2. Place order

## Expected Behaviour

- Discount equals 42% of the food subtotal only (never the delivery fee), for every delivery method
- Delivery page shows the amount saved
