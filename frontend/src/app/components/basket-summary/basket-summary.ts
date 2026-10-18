import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { IBasketItem } from '../../_models/basket';
import { BasketService } from '../../_services/basket-service';

@Component({
  selector: 'app-basket-summary',
  imports: [CurrencyPipe, RouterLink, FontAwesomeModule],
  templateUrl: './basket-summary.html',
  styleUrl: './basket-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasketSummary {
  protected readonly basket = inject(BasketService).basket;
  protected readonly faTrash = faTrash;

  readonly isBasket = input(true);

  readonly decrement = output<IBasketItem>();
  readonly increment = output<IBasketItem>();
  readonly remove = output<IBasketItem>();
}