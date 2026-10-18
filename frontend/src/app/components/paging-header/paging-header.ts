import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-paging-header',
  templateUrl: './paging-header.html',
  styleUrl: './paging-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagingHeader {
  readonly pageNumber = input(0);
  readonly pageSize = input(0);
  readonly totalCount = input(0);

  protected readonly from = computed(() => (this.pageNumber() - 1) * this.pageSize() + 1);
  protected readonly to = computed(() =>
    Math.min(this.pageNumber() * this.pageSize(), this.totalCount()),
  );
}