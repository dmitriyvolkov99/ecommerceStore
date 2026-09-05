import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { LoadingInterceptor } from './_interceptors/loading-interceptor';
import { jwtInterceptor } from './_interceptors/jwt-interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { MatStepperModule } from '@angular/material/stepper';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(
      BrowserAnimationsModule,
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      NgxSpinnerModule,
      CdkStepperModule,
      MatStepperModule,
    ),
    provideHttpClient(withInterceptors([
      jwtInterceptor,
      // (req, next) => {
      //   const token = localStorage.getItem('token');
      //   console.log('INLINE INTERCEPTOR RUNNING, token=', token);
      //   if (token) {
      //     req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` }});
      //   }
      //   return next(req);
      // }
    ])),
    provideToastr(),
  ]
};
