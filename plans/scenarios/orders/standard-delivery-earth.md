---
type: scenario
id: TS-107
title: Place a standard delivery order to Earth paid by card
story: US-102
created_date: 2026-11-22
priority: high
verification_strategy: auto
---

## Prerequisites

- User is signed in
- Order has at least one item

## Test Steps

1. Open the order
2. Keep Standard delivery and Earth
3. Enter a delivery address
4. Keep Card payment
5. Place order

## Expected Behaviour

- The delivery page is shown
- The order total equals the food subtotal (no fee)
