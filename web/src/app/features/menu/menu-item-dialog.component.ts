import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { MenuItem, SPICE_LEVELS, SpiceLevel } from '../../core/models';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-menu-item-dialog',
  standalone: true,
  imports: [DecimalPipe, TitleCasePipe],
  template: `
    <div class="overlay" role="dialog" aria-modal="true" (click)="onBackdrop($event)">
      <div class="dialog" (click)="$event.stopPropagation()">
        <h2>{{ item().name }}</h2>
        <p class="desc">{{ item().description }}</p>
        <p class="price">₭{{ item().price | number: '1.2-2' }}</p>

        @if (item().section === 'MAIN DISHES') {
          <label class="spice">
            Spice level
            <select aria-label="Spice level" (change)="spice.set($any($event.target).value)">
              @for (level of spiceLevels; track level) {
                <option [value]="level" [selected]="level === spice()">{{ level | titlecase }}</option>
              }
            </select>
          </label>
        }

        <div class="qty-row">
          <button type="button" aria-label="Decrease quantity" (click)="dec()">−</button>
          <span>{{ quantity() }}</span>
          <button type="button" aria-label="Increase quantity" (click)="inc()">+</button>
        </div>

        <button type="button" class="btn-primary" (click)="add()">Add to Order</button>
        <button type="button" class="btn-text" (click)="closed.emit()">Cancel</button>
      </div>
    </div>
  `,
  styles: `
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    .dialog {
      background: #fff;
      border-radius: 16px 16px 0 0;
      padding: 1.5rem;
      width: 100%;
      max-width: 480px;
    }
    h2 {
      margin: 0 0 0.5rem;
    }
    .desc {
      color: #666;
      margin: 0 0 0.5rem;
    }
    .price {
      font-weight: 700;
      color: #ff8c00;
      margin: 0 0 1rem;
    }
    .spice {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      select { padding: 0.4rem; border-radius: 6px; }
    }
    .qty-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      margin-bottom: 1rem;
      button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid #ddd;
        background: #f5f5f5;
        font-size: 1.25rem;
        cursor: pointer;
      }
      span {
        font-size: 1.25rem;
        font-weight: 600;
        min-width: 2rem;
        text-align: center;
      }
    }
    .btn-text {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
    }
  `,
})
export class MenuItemDialogComponent {
  readonly item = input.required<MenuItem>();
  readonly closed = output<void>();

  private readonly cart = inject(CartService);
  readonly quantity = signal(1);
  readonly spiceLevels = SPICE_LEVELS;
  readonly spice = signal<SpiceLevel>('MILD');

  inc(): void {
    this.quantity.update((q) => q + 1);
  }

  dec(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  add(): void {
    const spiceLevel = this.item().section === 'MAIN DISHES' ? this.spice() : undefined;
    this.cart.addItem(this.item(), this.quantity(), spiceLevel);
    this.closed.emit();
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
