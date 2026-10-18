import { Component, inject } from '@angular/core';
import { BasketService } from '../../_services/basket-service';
import { BasketSummary } from '../../components/basket-summary/basket-summary';

@Component({
  selector: 'app-checkout-review',
  imports: [BasketSummary],
  templateUrl: './checkout-review.html',
  styleUrl: './checkout-review.css',
})
export class CheckoutReview {
  private readonly basketService = inject(BasketService);

  createPaymentIntent() {
    this.basketService.createPaymentIntent().subscribe({
      error: error => console.error(error),
    });
  }
}