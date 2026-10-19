import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IBasketItem } from '../../_models/basket';
import { BasketService } from '../../_services/basket-service';

@Component({
  selector: 'app-basket-summary',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './basket-summary.html',
  styleUrl: './basket-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasketSummary {
  protected readonly basket = inject(BasketService).basket;

  readonly isBasket = input(true);

  readonly decrement = output<IBasketItem>();
  readonly increment = output<IBasketItem>();
  readonly remove = output<IBasketItem>();
}