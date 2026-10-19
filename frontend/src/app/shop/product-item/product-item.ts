import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IProduct } from '../../_models/product';
import { BasketService } from '../../_services/basket-service';

@Component({
  selector: 'app-product-item',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-item.html',
  styleUrl: './product-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductItem {
  private readonly basketService = inject(BasketService);

  readonly product = input.required<IProduct>();

  addItemToBasket() {
    this.basketService.addItemToBasket(this.product());
  }
}