import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { jwtInterceptor } from './_interceptors/jwt-interceptor';
import { loadingInterceptor } from './_interceptors/loading-interceptor';
import { AccountService } from './_services/account-service';
import { BasketService } from './_services/basket-service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular 21: zoneless по умолчанию, provideZonelessChangeDetection() не нужен
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor, loadingInterceptor]),
    ),
    // Нужен только пока ngx-toastr использует @angular/animations
    provideAnimations(),
    provideToastr(),
    // Загружаем текущего пользователя до первой навигации, чтобы guard видел актуальное состояние
    provideAppInitializer(() =>
      inject(AccountService).loadCurrentUser(localStorage.getItem('token')),
    ),
    // Корзину грузим в фоне: запуск приложения она не блокирует
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