import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { AccountService } from '../_services/account-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  const router = inject(Router);
  const accountService = inject(AccountService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        toastr.error('Не удалось связаться с сервером');
      } else if (error.status >= 500) {
        toastr.error('Ошибка сервера. Попробуйте позже.');
      } else if (error.status === 401 && accountService.isLoggedIn()) {
        // Токен истёк или недействителен.
        const returnUrl = router.url;
        accountService.logout();
        toastr.info('Сессия истекла. Войдите снова.');
        router.navigate(['/account/login'], { queryParams: { returnUrl } });
      }

      return throwError(() => error);
    }),
  );
};