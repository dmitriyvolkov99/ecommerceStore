import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { IProduct } from '../_models/product';
import { IBrand } from '../_models/brand';
import { IType } from '../_models/productType';
import { IPagination, Pagination } from '../_models/pagination';
import { ShopParams } from '../_models/shopParams';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  products: IProduct[] = [];
  brands: IBrand[] = [];
  types: IType[] = [];
  pagination = new Pagination();
  shopParams = new ShopParams();
  productCache = new Map<string, IProduct[]>();

  getProducts(useCache: boolean): Observable<IPagination> {
    if (!useCache) {
      this.productCache.clear();
    }

    const key = this.cacheKey();
    const cached = this.productCache.get(key);

    if (useCache && cached) {
      this.pagination.data = cached;
      return of(this.pagination);
    }

    let params = new HttpParams()
      .set('sort', this.shopParams.sort)
      .set('pageIndex', this.shopParams.pageNumber.toString())
      .set('pageSize', this.shopParams.pageSize.toString());

    if (this.shopParams.brandId !== 0) {
      params = params.set('brandId', this.shopParams.brandId.toString());
    }

    if (this.shopParams.typeId !== 0) {
      params = params.set('typeId', this.shopParams.typeId.toString());
    }

    if (this.shopParams.search) {
      params = params.set('search', this.shopParams.search);
    }

    return this.http.get<IPagination>(`${this.baseUrl}products`, { params }).pipe(
      tap(response => {
        this.productCache.set(key, response.data);
        this.pagination = response;
      }),
    );
  }

  setShopParams(params: ShopParams) {
    this.shopParams = params;
  }

  getShopParams() {
    return this.shopParams;
  }

  getProduct(id: number) {
    for (const products of this.productCache.values()) {
      const product = products.find(p => p.id === id);
      if (product) {
        return of(product);
      }
    }

    return this.http.get<IProduct>(`${this.baseUrl}products/${id}`);
  }

  getBrands() {
    if (this.brands.length > 0) {
      return of(this.brands);
    }

    return this.http
      .get<IBrand[]>(`${this.baseUrl}products/brands`)
      .pipe(tap(brands => (this.brands = brands)));
  }

  getTypes() {
    if (this.types.length > 0) {
      return of(this.types);
    }

    return this.http
      .get<IType[]>(`${this.baseUrl}products/types`)
      .pipe(tap(types => (this.types = types)));
  }

  private cacheKey() {
    return Object.values(this.shopParams).join('-');
  }
}