import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { IUser } from '../_models/user';
import { IAddress } from '../_models/address';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly baseUrl = environment.apiUrl;

  private readonly _currentUser = signal<IUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  loadCurrentUser(token: string | null) {
    if (!token) {
      this._currentUser.set(null);
      return of(null);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<IUser | null>(`${this.baseUrl}account`, { headers }).pipe(
      tap(user => {
        this._currentUser.set(user ?? null);
        if (user) {
          localStorage.setItem('token', user.token);
        }
      }),
      catchError(() => {
        this._currentUser.set(null);
        return of(null);
      }),
    );
  }

  login(values: { email: string; password: string }) {
    return this.http.post<IUser>(`${this.baseUrl}account/login`, values).pipe(
      tap(user => this.setUser(user)),
    );
  }

  register(values: unknown) {
    return this.http.post<IUser>(`${this.baseUrl}account/register`, values).pipe(
      tap(user => this.setUser(user)),
    );
  }

  logout() {
    localStorage.removeItem('token');
    this._currentUser.set(null);
    this.router.navigateByUrl('/');
  }

  checkEmailExists(email: string) {
    const params = new HttpParams().set('email', email);
    return this.http.get<boolean>(`${this.baseUrl}account/emailexists`, { params });
  }

  getUserAddress() {
    return this.http.get<IAddress>(`${this.baseUrl}account/address`);
  }

  updateUserAddress(address: IAddress) {
    return this.http.put<IAddress>(`${this.baseUrl}account/address`, address);
  }

  private setUser(user: IUser | null) {
    if (!user) return;
    localStorage.setItem('token', user.token);
    this._currentUser.set(user);
  }
}