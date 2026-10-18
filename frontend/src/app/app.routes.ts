import { Routes } from '@angular/router';
import { Home } from './home/home';
import { authGuard } from './_guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'shop',
    loadChildren: () => import('./shop/shop.routes').then(m => m.shopRoutes),
  },
  {
    path: 'basket',
    loadChildren: () => import('./basket/basket.routes').then(m => m.basketRoutes),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadChildren: () => import('./checkout/checkout.routes').then(m => m.checkoutRoutes),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadChildren: () => import('./order/order.routes').then(m => m.orderRoutes),
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.routes').then(m => m.accountRoutes),
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];