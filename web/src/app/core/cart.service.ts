import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { countBucket, emitProductEvent } from './rum';
import { BackendOrder, BackendOrderStatus, CartLine, CheckoutOptions, MenuItem, SpiceLevel } from './models';

const DEFAULT_CHECKOUT: CheckoutOptions = {
  deliveryMethod: 'STANDARD',
  planet: 'EARTH',
  address: '',
  instructions: '',
  paymentMethod: 'CARD',
  tipPercent: 0,
  couponCode: '',
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly lines = signal<CartLine[]>([]);
  readonly checkout = signal<CheckoutOptions>({ ...DEFAULT_CHECKOUT });
  readonly submittedOrder = signal<BackendOrder | null>(null);
  readonly latestOrderStatus = signal<BackendOrderStatus | null>(null);

  readonly totalPrice = computed(() =>
    this.lines().reduce((sum, line) => sum + line.quantity * line.menuItem.price, 0),
  );
  readonly totalQuantity = computed(() =>
    this.lines().reduce((sum, line) => sum + line.quantity, 0),
  );

  addItem(item: MenuItem, quantity: number, spiceLevel?: SpiceLevel): void {
    this.lines.update((lines) => [
      ...lines,
      { id: crypto.randomUUID(), menuItem: item, quantity, spiceLevel },
    ]);
  }

  updateCheckout(patch: Partial<CheckoutOptions>): void {
    this.checkout.update((c) => ({ ...c, ...patch }));
  }

  removeLine(lineId: string): void {
    this.lines.update((lines) => lines.filter((l) => l.id !== lineId));
  }

  clearOrder(): void {
    this.lines.set([]);
    this.checkout.set({ ...DEFAULT_CHECKOUT });
    this.submittedOrder.set(null);
    this.latestOrderStatus.set(null);
  }

  async submitOrder(): Promise<{ ok: true } | { ok: false; error: string }> {
    const token = this.auth.token;
    if (!token) {
      return { ok: false, error: 'Please sign in first' };
    }
    const items = this.lines().map((l) => ({
      menuItemId: l.menuItem.id,
      quantity: l.quantity,
      ...(l.spiceLevel ? { spiceLevel: l.spiceLevel } : {}),
    }));
    const c = this.checkout();
    const request = {
      items,
      delivery: {
        method: c.deliveryMethod,
        planet: c.planet,
        ...(c.address.trim() ? { address: c.address.trim() } : {}),
        ...(c.instructions.trim() ? { instructions: c.instructions.trim() } : {}),
      },
      payment: { method: c.paymentMethod, tipPercent: c.tipPercent },
      ...(c.couponCode.trim() ? { couponCode: c.couponCode.trim() } : {}),
    };
    try {
      const order = await firstValueFrom(this.api.createOrder(request, token));
      emitProductEvent('order-placed', {
        ...this.checkoutSlice(),
        'order.has_coupon': !!request.couponCode,
        'order.tip_percent': c.tipPercent,
        'order.item_count_bucket': countBucket(this.totalQuantity()),
      });
      this.submittedOrder.set(order);
      this.latestOrderStatus.set({
        id: order.id,
        status: order.status,
        deliveryMethod: order.delivery?.method,
        estimatedMinutes: order.delivery?.estimatedMinutes,
        updatedAt: order.createdAt,
      });
      return { ok: true };
    } catch (err) {
      const error = this.messageFrom(err);
      emitProductEvent('order-rejected', { ...this.checkoutSlice(), 'error.kind': rejectionKind(error) });
      return { ok: false, error };
    }
  }

  /** Low-cardinality checkout dimensions shared by order events. */
  private checkoutSlice(): Record<string, string> {
    const c = this.checkout();
    return {
      'delivery.method': c.deliveryMethod.toLowerCase(),
      'delivery.planet': c.planet.toLowerCase(),
      'payment.method': c.paymentMethod.toLowerCase(),
    };
  }

  async refreshSubmittedOrderStatus(): Promise<void> {
    const token = this.auth.token;
    const order = this.submittedOrder();
    if (!token || !order) return;
    try {
      const status = await firstValueFrom(this.api.fetchOrderStatus(order.id, token));
      this.latestOrderStatus.set(status);
    } catch {
      /* keep last status */
    }
  }

  private messageFrom(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: { error?: string } }).error;
      if (body?.error) return body.error;
    }
    return 'Request failed';
  }
}

function rejectionKind(message: string): string {
  if (/address is required/i.test(message)) return 'address_missing';
  if (/not available to Krikkit/i.test(message)) return 'teleport_destination';
  if (/Cash on delivery/i.test(message)) return 'payment_not_allowed';
  if (/Pickup is only available/i.test(message)) return 'pickup_destination';
  if (/Coupon .* (is not valid|is only valid|needs a subtotal)/i.test(message)) return 'coupon';
  return 'other';
}
