import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Basket, IBasket, IBasketItem, IBasketTotals } from '../_models/basket';
import { IDeliveryMethod } from '../_models/deliveryMethod';
import { IProduct } from '../_models/product';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private readonly _basket = signal<IBasket | null>(null);
  private readonly _shipping = signal(0);

  readonly basket = this._basket.asReadonly();
  readonly shipping = this._shipping.asReadonly();

  readonly basketTotals = computed<IBasketTotals | null>(() => {
    const basket = this._basket();
    if (!basket) return null;

    const shipping = this._shipping();
    const subtotal = basket.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { shipping, subtotal, total: subtotal + shipping };
  });

  readonly itemCount = computed(
    () => this._basket()?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
  );

  createPaymentIntent(): Observable<IBasket | null> {
    const basket = this._basket();
    if (!basket) return of(null);

    return this.http
      .post<IBasket>(`${this.baseUrl}payments/${basket.id}`, {})
      .pipe(tap(updated => this._basket.set(updated)));
  }

  setShippingPrice(deliveryMethod: IDeliveryMethod) {
    this._shipping.set(deliveryMethod.price);

    const basket = this._basket();
    if (!basket) return;

    this.setBasket({
      ...basket,
      deliveryMethodId: deliveryMethod.id,
      shippingPrice: deliveryMethod.price,
    });
  }

  getBasket(id: string) {
    const params = new HttpParams().set('id', id);

    return this.http.get<IBasket>(`${this.baseUrl}basket`, { params }).pipe(
      tap(basket => {
        this._basket.set(basket);
        this._shipping.set(basket.shippingPrice ?? 0);
      }),
    );
  }

  setBasket(basket: IBasket) {
    this.http.post<IBasket>(`${this.baseUrl}basket`, basket).subscribe({
      next: response => this._basket.set(response),
      error: error => console.error('Failed to save basket', error),
    });
  }

  addItemToBasket(item: IProduct, quantity = 1) {
    const itemToAdd = this.mapProductItemToBasketItem(item, quantity);
    const basket = this._basket() ?? this.createBasket();

    this.setBasket({
      ...basket,
      items: this.addOrUpdateItem(basket.items, itemToAdd, quantity),
    });
  }

  incrementItemQuantity(item: IBasketItem) {
    const basket = this._basket();
    if (!basket) return;

    this.setBasket({
      ...basket,
      items: basket.items.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    });
  }

  decrementItemQuantity(item: IBasketItem) {
    const basket = this._basket();
    if (!basket) return;

    const found = basket.items.find(i => i.id === item.id);
    if (!found) return;

    if (found.quantity > 1) {
      this.setBasket({
        ...basket,
        items: basket.items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i,
        ),
      });
    } else {
      this.removeItemFromBasket(item);
    }
  }

  removeItemFromBasket(item: IBasketItem) {
    const basket = this._basket();
    if (!basket || !basket.items.some(i => i.id === item.id)) return;

    const items = basket.items.filter(i => i.id !== item.id);

    if (items.length > 0) {
      this.setBasket({ ...basket, items });
    } else {
      this.deleteBasket(basket);
    }
  }

  deleteLocalBasket() {
    this._basket.set(null);
    localStorage.removeItem('basket_id');
  }

  deleteBasket(basket: IBasket) {
    const params = new HttpParams().set('id', basket.id);

    this.http.delete(`${this.baseUrl}basket`, { params }).subscribe({
      next: () => this.deleteLocalBasket(),
      error: error => console.error('Failed to delete basket', error),
    });
  }

  mapProductItemToBasketItem(item: IProduct, quantity: number): IBasketItem {
    return {
      id: item.id,
      productName: item.name,
      price: item.price,
      pictureUrl: item.pictureUrl,
      quantity,
      brand: item.productBrand,
      type: item.productType,
    };
  }

  private addOrUpdateItem(
    items: IBasketItem[],
    itemToAdd: IBasketItem,
    quantity: number,
  ): IBasketItem[] {
    const exists = items.some(i => i.id === itemToAdd.id);

    return exists
      ? items.map(i => (i.id === itemToAdd.id ? { ...i, quantity: i.quantity + quantity } : i))
      : [...items, { ...itemToAdd, quantity }];
  }

  private createBasket(): IBasket {
    const basket = new Basket();
    localStorage.setItem('basket_id', basket.id);
    return basket;
  }
}