import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../_services/account-service';

export const authGuard: CanActivateFn = (_route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  return accountService.isLoggedIn()
    ? true
    : router.createUrlTree(['account', 'login'], {
        queryParams: { returnUrl: state.url },
      });
};