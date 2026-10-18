import { Component, effect, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../_services/account-service';
import { BasketService } from '../_services/basket-service';
import { OrderTotals } from '../components/order-totals/order-totals';
import { CheckoutAddress } from './checkout-address/checkout-address';
import { CheckoutDelivery } from './checkout-delivery/checkout-delivery';
import { CheckoutReview } from './checkout-review/checkout-review';
import { CheckoutPayment } from './checkout-payment/checkout-payment';

@Component({
  selector: 'app-checkout',
  imports: [OrderTotals, CheckoutAddress, CheckoutDelivery, CheckoutReview, CheckoutPayment],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly basketService = inject(BasketService);

  protected readonly checkoutForm = this.fb.nonNullable.group({
    addressForm: this.fb.nonNullable.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
    }),
    deliveryForm: this.fb.nonNullable.group({
      deliveryMethod: ['', Validators.required],
    }),
    paymentForm: this.fb.nonNullable.group({
      nameOnCard: ['', Validators.required],
    }),
  });

  constructor() {
    this.loadAddress();

    // Корзина может догрузиться уже после открытия страницы, поэтому следим за сигналом
    effect(() => {
      const deliveryMethodId = this.basketService.basket()?.deliveryMethodId;
      if (deliveryMethodId) {
        this.checkoutForm.controls.deliveryForm.controls.deliveryMethod.patchValue(
          deliveryMethodId.toString(),
        );
      }
    });
  }

  private loadAddress() {
    this.accountService.getUserAddress().subscribe({
      next: address => {
        if (address) {
          this.checkoutForm.controls.addressForm.patchValue(address);
        }
      },
      error: error => console.error(error),
    });
  }
}