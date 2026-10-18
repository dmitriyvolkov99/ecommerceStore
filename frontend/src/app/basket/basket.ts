import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IBasketItem } from '../_models/basket';
import { BasketService } from '../_services/basket-service';
import { OrderTotals } from '../components/order-totals/order-totals';
import { BasketSummary } from '../components/basket-summary/basket-summary';

@Component({
  selector: 'app-basket',
  imports: [RouterLink, OrderTotals, BasketSummary],
  templateUrl: './basket.html',
  styleUrl: './basket.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Basket {
  private readonly basketService = inject(BasketService);

  protected readonly basket = this.basketService.basket;

  removeBasketItem(item: IBasketItem) {
    this.basketService.removeItemFromBasket(item);
  }

  incrementItemQuantity(item: IBasketItem) {
    this.basketService.incrementItemQuantity(item);
  }

  decrementItemQuantity(item: IBasketItem) {
    this.basketService.decrementItemQuantity(item);
  }
}