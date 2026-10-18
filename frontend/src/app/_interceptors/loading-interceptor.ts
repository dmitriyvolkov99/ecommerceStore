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



// import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { BusyService } from '../_services/busy-service';
// import { finalize, Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class LoadingInterceptor implements HttpInterceptor {
  
//     constructor(private busyService: BusyService) {}
  
//     intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
//       if(request.method === "POST" && request.url.includes("orders")){
//         return next.handle(request);
//       }
  
//       if(request.method === 'DELETE')
//       {
//         return next.handle(request);
//       }
  
//       if(request.url.includes('emailexists')){
//         return next.handle(request);
//       }
      
//       this.busyService.busy();
  
//       return next.handle(request).pipe(
//         finalize(() => {
//           this.busyService.idle();
//         })
//       )
//     }
// }
