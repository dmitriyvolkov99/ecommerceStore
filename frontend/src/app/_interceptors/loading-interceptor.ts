import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { BusyService } from '../_services/busy-service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  const skip =
    (req.method === 'POST' && req.url.includes('orders')) ||
    req.method === 'DELETE' ||
    req.url.includes('emailexists');

  if (skip) {
    return next(req);
  }

  busyService.busy();

  return next(req).pipe(finalize(() => busyService.idle()));
};

