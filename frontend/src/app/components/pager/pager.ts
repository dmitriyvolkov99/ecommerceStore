import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pager {
  readonly totalCount = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly pageNumber = input.required<number>();
  readonly pageChanged = output<number>();

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pageSize())),
  );

  protected readonly pages = computed<(number | null)[]>(() => {
    const total = this.totalPages();
    const current = this.pageNumber();
    const result: (number | null)[] = [];
    for (let p = 1; p <= total; p++) {
      if (p === 1 || p === total || Math.abs(p - current) <= 1) {
        result.push(p);
      } else if (result[result.length - 1] !== null) {
        result.push(null);
      }
    }
    return result;
  });

  protected go(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.pageNumber()) return;
    this.pageChanged.emit(page);
  }
}