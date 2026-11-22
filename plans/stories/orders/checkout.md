---
type: story
id: US-102
title: Guests check out with their choice of delivery, payment, tip and coupon
created_date: 2026-11-22
priority: high
---

## Summary

At checkout the guest picks how the order gets to them (Standard, Express, Teleport or Pickup), the destination planet, a payment method (Card, Babel Fish credits, Galactic Express, Cash on delivery), an optional tip and an optional coupon. The backend prices and validates the order.

## Business rules

- Delivery fees: Standard ₭0, Express ₭8, Teleport ₭15, Pickup ₭0. Standard and Express add a distance surcharge for planets other than Earth (Magrathea ₭3, Santraginus V ₭4.50, Betelgeuse V ₭6, Krikkit ₭9).
- Address is required unless the guest picks up. Pickup is only available on Earth.
- Teleport is not available to Krikkit and cannot be paid cash on delivery.
- Coupons apply to food only: DONTPANIC (42% off, min ₭20 subtotal), TOWELDAY (25% off, Pickup only). Unknown codes are rejected.
- Babel Fish credits give an extra 5% off the discounted food total.
- Tip is 0, 10, 15 or 20% of the food subtotal.
