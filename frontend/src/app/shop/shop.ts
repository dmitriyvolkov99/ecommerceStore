import { Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { IProduct } from '../_models/product';
import { IBrand } from '../_models/brand';
import { IType } from '../_models/productType';
import { ShopParams } from '../_models/shopParams';
import { ShopService } from '../_services/shop-service';
import { Pager } from '../components/pager/pager';
import { PagingHeader } from '../components/paging-header/paging-header';
import { ProductItem } from './product-item/product-item';

@Component({
  selector: 'app-shop',
  imports: [Pager, PagingHeader, ProductItem],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit {
  private readonly shopService = inject(ShopService);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('search');

  protected readonly products = signal<IProduct[]>([]);
  protected readonly brands = signal<IBrand[]>([]);
  protected readonly types = signal<IType[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly filtersLoading = signal(false);
  protected readonly productsLoading = signal(false);

  protected readonly sortOptions = [
    { name: 'По алфавиту', value: 'name' },
    { name: 'Цена: по возрастанию', value: 'priceAsc' },
    { name: 'Цена: по убыванию', value: 'priceDesc' },
  ];

  protected get shopParams(): ShopParams {
    return this.shopService.getShopParams();
  }

  ngOnInit(): void {
    this.loadFilters();
    this.loadProducts(true);
  }

  private loadFilters() {
    this.filtersLoading.set(true);

    forkJoin({
      brands: this.shopService.getBrands(),
      types: this.shopService.getTypes(),
    }).subscribe({
      next: ({ brands, types }) => {
        this.brands.set([{ id: 0, name: 'Все' }, ...brands]);
        this.types.set([{ id: 0, name: 'Все' }, ...types]);
        this.filtersLoading.set(false);
      },
      error: error => {
        console.error(error);
        this.filtersLoading.set(false);
      },
    });
  }

  private loadProducts(useCache = false) {
    this.productsLoading.set(true);

    this.shopService.getProducts(useCache).subscribe({
      next: response => {
        this.products.set(response.data);
        this.totalCount.set(response.count);
        this.productsLoading.set(false);
      },
      error: error => {
        console.error(error);
        this.productsLoading.set(false);
      },
    });
  }

  private updateParams(change: (params: ShopParams) => void) {
    const params = this.shopService.getShopParams();
    change(params);
    this.shopService.setShopParams(params);
    this.loadProducts();
  }

  onBrandSelected(brandId: number) {
    this.updateParams(params => {
      params.brandId = brandId;
      params.pageNumber = 1;
    });
  }

  onTypeSelected(typeId: number) {
    this.updateParams(params => {
      params.typeId = typeId;
      params.pageNumber = 1;
    });
  }

  onSortSelected(sort: string) {
    this.updateParams(params => {
      params.sort = sort;
    });
  }

  onPageChanged(page: number) {
    if (this.shopParams.pageNumber === page) return;

    this.updateParams(params => {
      params.pageNumber = page;
    });
  }

  onSearch() {
    const search = this.searchInput()?.nativeElement.value ?? '';

    this.updateParams(params => {
      params.search = search;
      params.pageNumber = 1;
    });
  }

  onReset() {
    const input = this.searchInput();
    if (input) {
      input.nativeElement.value = '';
    }

    this.shopService.setShopParams(new ShopParams());
    this.loadProducts();
  }
}