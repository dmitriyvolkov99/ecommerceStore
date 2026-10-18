import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { IProduct } from '../../_models/product';
import { BasketService } from '../../_services/basket-service';
import { ShopService } from '../../_services/shop-service';

@Component({
  selector: 'app-product-details',
  imports: [CurrencyPipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  private readonly basketService = inject(BasketService);
  private readonly shopService = inject(ShopService);

  protected readonly quantity = signal(1);

  // undefined — идёт загрузка, null — товар не найден или произошла ошибка
  protected readonly product = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(id =>
        this.shopService.getProduct(id).pipe(
          catchError(error => {
            console.error(error);
            return of(null);
          }),
        ),
      ),
    ),
  );

  protected addItemToBasket(product: IProduct) {
    this.basketService.addItemToBasket(product, this.quantity());
  }

  protected incrementQuantity() {
    this.quantity.update(q => q + 1);
  }

  protected decrementQuantity() {
    this.quantity.update(q => Math.max(1, q - 1));
  }
}