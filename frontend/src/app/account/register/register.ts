import { Component, inject, signal } from '@angular/core';
import { AsyncValidatorFn, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { map, of, switchMap, timer } from 'rxjs';
import { AccountService } from '../../_services/account-service';
import { TextInput } from '../../components/text-input/text-input';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TextInput, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  protected readonly errors = signal<string[]>([]);

  protected readonly registerForm = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    email: [
      '',
      [Validators.required, Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')],
      [this.validateEmailNotTaken()],
    ],
    password: ['', Validators.required],
  });

  protected onSubmit() {
    this.accountService.register(this.registerForm.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/shop'),
      error: error => {
        console.error(error);
        this.errors.set(error?.error?.errors ?? ['Не удалось зарегистрироваться']);
      },
    });
  }

  private validateEmailNotTaken(): AsyncValidatorFn {
    return control =>
      timer(500).pipe(
        switchMap(() => {
          if (!control.value) {
            return of(null);
          }

          return this.accountService
            .checkEmailExists(control.value)
            .pipe(map(exists => (exists ? { emailExists: true } : null)));
        }),
      );
  }
}