import { Component } from '@angular/core';
import { BasketSummary } from '../../components/basket-summary/basket-summary';

@Component({
  selector: 'app-checkout-review',
  imports: [BasketSummary],
  templateUrl: './checkout-review.html',
})
export class CheckoutReview {}