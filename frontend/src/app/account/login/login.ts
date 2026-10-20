import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountService } from '../../_services/account-service';
import { TextInput } from '../../components/text-input/text-input';
import { extractErrors } from '../../_utils/http-errors';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TextInput, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  private readonly returnUrl =
    inject(ActivatedRoute).snapshot.queryParamMap.get('returnUrl') || '/shop';

  protected readonly error = signal<string | null>(null);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: [
      '',
      [Validators.required, Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')],
    ],
    password: ['', Validators.required],
  });

  protected onSubmit() {
    this.error.set(null);

    this.accountService.login(this.loginForm.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl),
      error: err => {
        this.error.set(
          err.status === 429
            ? extractErrors(err)[0]
            : 'Не удалось войти. Проверьте адрес почты и пароль.',
        );
      },
    });
  }
}