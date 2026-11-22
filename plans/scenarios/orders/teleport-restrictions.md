---
type: scenario
id: TS-110
title: Teleport delivery is refused for Krikkit and for cash on delivery
story: US-102
created_date: 2026-11-22
priority: high
verification_strategy: auto
---

## Prerequisites

- User is signed in
- Order has at least one item

## Test Steps

1. Choose Teleport to Krikkit and place order
2. Choose Teleport to Magrathea with Cash on delivery and place order
3. Choose Teleport to Magrathea with Card and place order

## Expected Behaviour

- Krikkit is rejected: 'Teleport delivery is not available to Krikkit'
- Cash on delivery is rejected for teleport
- Magrathea by card succeeds with the ₭15 teleport fee and no distance surcharge
