import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { IDeliveryMethod } from '../../_models/deliveryMethod';
import { CheckoutService } from '../../_services/checkout-service';
import { BasketService } from '../../_services/basket-service';

@Component({
  selector: 'app-checkout-delivery',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './checkout-delivery.html',
  styleUrl: './checkout-delivery.css',
})
export class CheckoutDelivery {
  private readonly basketService = inject(BasketService);

  readonly checkoutForm = input.required<FormGroup>();

  protected readonly deliveryMethods = toSignal(
    inject(CheckoutService)
      .getDeliveryMethods()
      .pipe(
        catchError(error => {
          console.error(error);
          return of([] as IDeliveryMethod[]);
        }),
      ),
    { initialValue: [] as IDeliveryMethod[] },
  );

  protected setShippingPrice(deliveryMethod: IDeliveryMethod) {
    this.basketService.setShippingPrice(deliveryMethod);
  }
}