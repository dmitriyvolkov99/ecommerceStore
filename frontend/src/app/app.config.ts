import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { jwtInterceptor } from './_interceptors/jwt-interceptor';
import { loadingInterceptor } from './_interceptors/loading-interceptor';
import { AccountService } from './_services/account-service';
import { BasketService } from './_services/basket-service';
import { errorInterceptor } from './_interceptors/error-interceptor';
// import { registerLocaleData } from '@angular/common';
// import localeRu from '@angular/common/locales/ru';
// registerLocaleData(localeRu);

export const appConfig: ApplicationConfig = {
  providers: [
    //{ provide: LOCALE_ID, useValue: 'ru' },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor, loadingInterceptor, errorInterceptor]),
    ),
    provideToastr({
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
      preventDuplicates: true,
    }),
    provideAppInitializer(() =>
      inject(AccountService).loadCurrentUser(localStorage.getItem('token')),
    ),
    provideAppInitializer(() => {
      const basketId = localStorage.getItem('basket_id');
      if (basketId) {
        inject(BasketService)
          .getBasket(basketId)
          .subscribe({ error: err => console.error('Failed to load basket', err) });
      }
    }),
  ],
};