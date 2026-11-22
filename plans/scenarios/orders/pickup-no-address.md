---
type: scenario
id: TS-109
title: Pickup orders need no address and are only available on Earth
story: US-102
created_date: 2026-11-22
priority: medium
verification_strategy: auto
---

## Prerequisites

- User is signed in
- Order has at least one item

## Test Steps

1. Choose Pickup
2. Place order without an address
3. Try Pickup with a planet other than Earth

## Expected Behaviour

- Earth pickup succeeds with no delivery fee
- Pickup elsewhere is rejected with a clear message
