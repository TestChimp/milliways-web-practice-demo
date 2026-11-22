---
title: item-added-to-order
description: A guest added an item from the item dialog.
added-on: 2026-11-23
significance: 4
---

## Rationale

Which kinds of items and spice levels real guests pick. Supernova carries a surcharge, so it is a pricing path worth testing.

Requirements: #US-101, #TS-105, #TS-106.

## Metadata keys

- `item.section` — main | drink
- `item.spice_level` — mild | medium | hot | supernova | none
- `item.quantity_bucket` — 1 | 2-3 | 4+
