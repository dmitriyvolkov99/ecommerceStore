import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { IBasket } from '../../_models/basket';
import { BasketService } from '../../_services/basket-service';
import { CheckoutService } from '../../_services/checkout-service';
import { TextInput } from '../../components/text-input/text-input';
import { environment } from '../../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { extractErrors } from '../../_utils/http-errors';

declare const Stripe: any;

@Component({
  selector: 'app-checkout-payment',
  imports: [ReactiveFormsModule, TextInput],
  templateUrl: './checkout-payment.html',
  styleUrl: './checkout-payment.css',
})
export class CheckoutPayment implements AfterViewInit, OnDestroy {
  private readonly basketService = inject(BasketService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  readonly checkoutForm = input.required<FormGroup>();

  private readonly cardNumberElement = viewChild.required<ElementRef<HTMLElement>>('cardNumber');
  private readonly cardExpiryElement = viewChild.required<ElementRef<HTMLElement>>('cardExpiry');
  private readonly cardCvcElement = viewChild.required<ElementRef<HTMLElement>>('cardCvc');

  protected readonly cardErrors = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly cardNumberValid = signal(false);
  protected readonly cardExpiryValid = signal(false);
  protected readonly cardCvcValid = signal(false);

  private stripe: any;
  private cardNumber: any;
  private cardExpiry: any;
  private cardCvc: any;

  private readonly cardHandler = (event: any) => this.onChange(event);

  ngAfterViewInit(): void {
    this.stripe = Stripe(environment.stripePublishableKey);
    const elements = this.stripe.elements();

    this.cardNumber = this.mountElement(elements, 'cardNumber', this.cardNumberElement());
    this.cardExpiry = this.mountElement(elements, 'cardExpiry', this.cardExpiryElement());
    this.cardCvc = this.mountElement(elements, 'cardCvc', this.cardCvcElement());
  }

  ngOnDestroy(): void {
    this.cardNumber?.destroy();
    this.cardExpiry?.destroy();
    this.cardCvc?.destroy();
  }

  private mountElement(elements: any, type: string, host: ElementRef<HTMLElement>) {
    const element = elements.create(type);
    element.mount(host.nativeElement);
    element.addEventListener('change', this.cardHandler);
    return element;
  }

  private onChange(event: any) {
    this.cardErrors.set(event.error?.message ?? null);

    switch (event.elementType) {
      case 'cardNumber':
        this.cardNumberValid.set(event.complete);
        break;
      case 'cardExpiry':
        this.cardExpiryValid.set(event.complete);
        break;
      case 'cardCvc':
        this.cardCvcValid.set(event.complete);
        break;
    }
  }

  // 4242 4242 4242 4242 — тестовая карта
// 4242 4242 4242 4242 — тестовая карта
async submitOrder() {
  if (!this.basketService.basket()) return;

  this.loading.set(true);

  try {
    // 1. Платёжное намерение: сервер пересчитает сумму по ценам из базы.
    const basket = await firstValueFrom(this.basketService.createPaymentIntent());
    if (!basket?.clientSecret) {
      this.toastr.error('Не удалось подготовить оплату. Проверьте корзину.');
      return;
    }

    // 2. Заказ со статусом «ожидает оплаты».
    const createdOrder = await this.createOrder(basket);

    // 3. Подтверждение карты в Stripe.
    const paymentResult = await this.confirmPaymentWithStripe(basket);

    if (paymentResult.paymentIntent) {
      this.basketService.deleteBasket(basket);
      const navigationExtras: NavigationExtras = { state: createdOrder };
      this.router.navigate(['checkout', 'success'], navigationExtras);
    } else {
      this.toastr.error(paymentResult.error.message);
    }
  } catch (error) {
    console.error(error);
    this.toastr.error(
      error instanceof HttpErrorResponse ? extractErrors(error)[0] : 'Не удалось оформить заказ',
    );
  }finally {
    this.loading.set(false);
  }
}

  private confirmPaymentWithStripe(basket: IBasket) {
    return this.stripe.confirmCardPayment(basket.clientSecret, {
      payment_method: {
        card: this.cardNumber,
        billing_details: {
          name: this.checkoutForm().get('paymentForm')?.get('nameOnCard')?.value,
        },
      },
    });
  }

  private createOrder(basket: IBasket) {
    return firstValueFrom(this.checkoutService.createOrder(this.getOrderToCreate(basket)));
  }

  private getOrderToCreate(basket: IBasket) {
    return {
      basketId: basket.id,
      deliveryMethodId: +this.checkoutForm().get('deliveryForm')?.get('deliveryMethod')?.value,
      shipToAddress: this.checkoutForm().get('addressForm')?.value,
    };
  }
}