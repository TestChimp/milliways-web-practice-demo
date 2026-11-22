---
title: order-rejected
description: The API rejected an order at checkout.
added-on: 2026-11-23
significance: 5
---

## Rationale

Which validation rules real guests trip over (teleport to Krikkit, cash on teleport, missing address, coupons).

Requirements: #US-102, #TS-109, #TS-110, #TS-112, #TS-114.

## Metadata keys

- `delivery.method` — as order-placed
- `delivery.planet` — as order-placed
- `payment.method` — as order-placed
- `error.kind` — address_missing | teleport_destination | payment_not_allowed | pickup_destination | coupon | other
