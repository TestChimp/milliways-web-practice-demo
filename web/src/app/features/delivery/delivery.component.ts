import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { emitProductEvent } from '../../core/rum';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [DecimalPipe, TitleCasePipe],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.scss',
})
export class DeliveryComponent implements OnInit, OnDestroy {
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  readonly minutesRemaining = signal(this.randomMinutes());
  readonly statusText = signal('Checking status...');
  readonly order = this.cart.submittedOrder;

  methodLabel(): string {
    const method = this.order()?.delivery?.method ?? 'STANDARD';
    return method === 'PICKUP' ? 'Ready for pickup' : `${method.charAt(0)}${method.slice(1).toLowerCase()} delivery`;
  }

  private pollTimer?: ReturnType<typeof setInterval>;
  private countdownTimer?: ReturnType<typeof setInterval>;

  headlineItem = 'order';

  ngOnInit(): void {
    const first = this.cart.lines()[0]?.menuItem.name;
    if (first) {
      this.headlineItem = first;
    }
    emitProductEvent('delivery-tracked', {
      'delivery.method': (this.cart.submittedOrder()?.delivery?.method ?? 'STANDARD').toLowerCase(),
    });
    void this.cart.refreshSubmittedOrderStatus();
    this.pollTimer = setInterval(() => void this.cart.refreshSubmittedOrderStatus(), 3000);
    this.countdownTimer = setInterval(() => {
      const status = this.cart.latestOrderStatus();
      if (status) {
        this.statusText.set(status.status);
      }
      this.minutesRemaining.update((m) => Math.max(0, m - Math.random() * 0.001));
    }, 1000 / 30);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollTimer);
    clearInterval(this.countdownTimer);
  }

  close(): void {
    emitProductEvent('delivery-closed');
    this.cart.clearOrder();
    void this.router.navigate(['/welcome']);
  }

  private randomMinutes(): number {
    return 2_000_000 + Math.random() * 1_000_000;
  }
}
