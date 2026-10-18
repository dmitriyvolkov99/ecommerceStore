import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { IOrder, IOrderToCreate } from '../_models/order';
import { IDeliveryMethod } from '../_models/deliveryMethod';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createOrder(order: IOrderToCreate) {
    return this.http.post<IOrder>(`${this.baseUrl}orders`, order);
  }

  getDeliveryMethods() {
    return this.http
      .get<IDeliveryMethod[]>(`${this.baseUrl}orders/deliveryMethods`)
      .pipe(map(methods => [...methods].sort((a, b) => b.price - a.price)));
  }
}