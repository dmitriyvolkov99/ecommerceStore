import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const isPublicCatalogRequest =
    req.method === 'GET' && req.url.startsWith(`${environment.apiUrl}products`);

  const token = localStorage.getItem('token');
  if (token && !isPublicCatalogRequest) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};