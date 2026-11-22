---
title: order-placed
description: The API accepted an order and the delivery page opened.
added-on: 2026-11-23
significance: 5
---

## Rationale

Revenue event. The checkout slices (delivery method, planet, payment method, coupon) are where pricing rules branch, so slices that real guests use but tests never hit are the highest-value gaps.

Requirements: #US-102, #TS-107..#TS-114.

## Metadata keys

- `delivery.method` — standard | express | teleport | pickup
- `delivery.planet` — earth | magrathea | betelgeuse_v | santraginus_v | krikkit
- `payment.method` — card | babel_fish_credits | galactic_express | cash_on_delivery
- `order.has_coupon` — true | false
- `order.tip_percent` — 0 | 10 | 15 | 20
- `order.item_count_bucket` — 1 | 2-5 | 6+
