import { Component, computed, inject, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../_services/account-service';
import { TextInput } from '../../components/text-input/text-input';

@Component({
  selector: 'app-checkout-address',
  imports: [ReactiveFormsModule, TextInput],
  templateUrl: './checkout-address.html',
  styleUrl: './checkout-address.css',
})
export class CheckoutAddress {
  private readonly accountService = inject(AccountService);
  private readonly toastr = inject(ToastrService);

  readonly checkoutForm = input.required<FormGroup>();

  protected readonly addressForm = computed(
    () => this.checkoutForm().get('addressForm') as FormGroup,
  );

  saveUserAddress() {
    this.accountService.updateUserAddress(this.addressForm().value).subscribe({
      next: address => {
        this.toastr.success('Адрес сохранён');
        this.addressForm().reset(address);
      },
      error: error => {
        this.toastr.error(error.message);
        console.error(error);
      },
    });
  }
}