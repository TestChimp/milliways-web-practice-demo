---
type: scenario
id: TS-108
title: Express delivery adds the express fee and planet surcharge
story: US-102
created_date: 2026-11-22
priority: high
verification_strategy: auto
---

## Prerequisites

- User is signed in
- Order has at least one item

## Test Steps

1. Choose Express delivery
2. Choose a planet
3. Enter an address
4. Place order

## Expected Behaviour

- Total = subtotal + ₭8 + the planet surcharge
- Estimated delivery is 20 minutes
