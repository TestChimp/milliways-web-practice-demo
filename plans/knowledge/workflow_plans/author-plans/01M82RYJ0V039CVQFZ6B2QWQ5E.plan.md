---
workflow-id: author-plans
workflow-execution-id: 01M82RYJ0V039CVQFZ6B2QWQ5E
PlanApproved: yes
---

# Author plans — Milliways baseline

Approved by the project owner (System Demo Project V2 build plan).

## Guests can create an account and sign in (plans/stories/account/sign-up-and-sign-in.md)

- New guest signs up and lands on the welcome screen — plans/scenarios/account/sign-up-new-guest.md
- Returning user signs in with valid credentials — plans/scenarios/account/sign-in-returning-user.md
- Sign-in with a wrong password shows an error — plans/scenarios/account/sign-in-wrong-password.md
- Signing up with an already registered email is rejected — plans/scenarios/account/sign-up-duplicate-email.md

## Guests browse the menu and build an order (plans/stories/menu/browse-menu.md)

- Menu shows main dishes and drinks with prices — plans/scenarios/menu/menu-shows-sections.md
- Add a menu item with a chosen quantity to the order — plans/scenarios/menu/add-item-with-quantity.md
- Choose a spice level for a main dish — plans/scenarios/menu/choose-spice-level.md

## Guests check out with their choice of delivery, payment, tip and coupon (plans/stories/orders/checkout.md)

- Place a standard delivery order to Earth paid by card — plans/scenarios/orders/standard-delivery-earth.md
- Express delivery adds the express fee and planet surcharge — plans/scenarios/orders/express-delivery-fee.md
- Pickup orders need no address and are only available on Earth — plans/scenarios/orders/pickup-no-address.md
- Teleport delivery is refused for Krikkit and for cash on delivery — plans/scenarios/orders/teleport-restrictions.md
- DONTPANIC coupon takes 42% off the food subtotal — plans/scenarios/orders/dontpanic-coupon.md
- Unknown coupon codes are rejected — plans/scenarios/orders/invalid-coupon.md
- Paying with Babel Fish credits gives an extra 5% off — plans/scenarios/orders/babel-fish-credits.md
- Delivery orders without an address are rejected — plans/scenarios/orders/address-required.md

## Guests track their order after placing it (plans/stories/orders/track-delivery.md)

- Delivery screen shows status, method and total — plans/scenarios/orders/delivery-status-shown.md
- Closing the delivery screen clears the order — plans/scenarios/orders/close-delivery-clears-order.md

## Guests review their past orders (plans/stories/account/order-history.md)

- Account page lists past orders and the total spent — plans/scenarios/account/order-history-list.md

