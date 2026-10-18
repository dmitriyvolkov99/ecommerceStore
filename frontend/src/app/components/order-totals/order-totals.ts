import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BasketService } from '../../_services/basket-service';

@Component({
  selector: 'app-order-totals',
  imports: [CurrencyPipe],
  templateUrl: './order-totals.html',
  styleUrl: './order-totals.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTotals {
  protected readonly totals = inject(BasketService).basketTotals;
}