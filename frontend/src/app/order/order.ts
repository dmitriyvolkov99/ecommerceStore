import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { IOrder } from '../_models/order';
import { OrderService } from '../_services/order-service';
import { OrderStatus } from './order-status/order-status';

@Component({
  selector: 'app-order',
  imports: [RouterLink, CurrencyPipe, DatePipe, OrderStatus],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order {
  protected readonly orders = toSignal(
    inject(OrderService)
      .getOrdersForUser()
      .pipe(
        catchError(error => {
          console.error(error);
          return of([] as IOrder[]);
        }),
      ),
    { initialValue: [] as IOrder[] },
  );
}