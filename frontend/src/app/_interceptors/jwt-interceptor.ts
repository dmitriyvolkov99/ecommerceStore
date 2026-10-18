import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Токен отправляем только на наш API, чтобы не светить его сторонним сервисам
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};


// export function jwtInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
//     const token = localStorage.getItem('token');
//     console.log('INLINE INTERCEPTOR RUNNING, token=', token);
//     if (token) {
//         req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` }});
//     }
//     return next(req);
// }


// @Injectable({
//   providedIn: 'root',
// })
// export class JwtInterceptor implements HttpInterceptor {
//       intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         const token = localStorage.getItem("token");

//         if(token){
//             console.log('JWT INTERCEPTOR RUNNING, TOKEN = ', token);

//             req = req.clone({
//                 setHeaders: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });
//         }

//         return next.handle(req);
//     }

// }
