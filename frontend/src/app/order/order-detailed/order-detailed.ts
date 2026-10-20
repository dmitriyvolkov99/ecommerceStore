import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { OrderService } from '../../_services/order-service';
import { OrderStatus } from '../order-status/order-status';

@Component({
  selector: 'app-order-detailed',
  imports: [CurrencyPipe, DatePipe, RouterLink, OrderStatus],
  templateUrl: './order-detailed.html',
  styleUrl: './order-detailed.css',
})
export class OrderDetailed {
  private readonly ordersService = inject(OrderService);

  protected readonly order = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(id =>
        this.ordersService.getOrderDetailed(id).pipe(
          catchError(error => {
            console.error(error);
            return of(null);
          }),
        ),
      ),
    ),
  );
}