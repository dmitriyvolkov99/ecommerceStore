import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IOrder } from '../_models/order';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getOrdersForUser() {
    return this.http.get<IOrder[]>(`${this.baseUrl}orders`);
  }

  getOrderDetailed(id: number) {
    return this.http.get<IOrder>(`${this.baseUrl}orders/${id}`);
  }
}