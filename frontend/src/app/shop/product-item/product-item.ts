import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { IProduct } from '../../_models/product';
import { BasketService } from '../../_services/basket-service';

@Component({
  selector: 'app-product-item',
  imports: [CurrencyPipe, RouterLink, FontAwesomeModule],
  templateUrl: './product-item.html',
  styleUrl: './product-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductItem {
  private readonly basketService = inject(BasketService);

  readonly product = input.required<IProduct>();
  protected readonly faCartPlus = faCartPlus;

  addItemToBasket() {
    this.basketService.addItemToBasket(this.product());
  }
}