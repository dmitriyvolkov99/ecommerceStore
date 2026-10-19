import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IOrder } from '../../_models/order';

@Component({
  selector: 'app-checkout-success',
  imports: [RouterLink],
  templateUrl: './checkout-success.html',
  styleUrl: './checkout-success.css',
})
export class CheckoutSuccess {
  protected readonly order = inject(Router).currentNavigation()?.extras.state as
    | IOrder
    | undefined;
}