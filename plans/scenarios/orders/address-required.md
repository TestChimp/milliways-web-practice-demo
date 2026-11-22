---
type: scenario
id: TS-114
title: Delivery orders without an address are rejected
story: US-102
created_date: 2026-11-22
priority: medium
verification_strategy: auto
---

## Prerequisites

- User is signed in
- Order has at least one item

## Test Steps

1. Choose Standard delivery
2. Leave the address empty
3. Place order

## Expected Behaviour

- Error 'Delivery address is required unless you pick up' is shown
