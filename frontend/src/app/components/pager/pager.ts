import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-pager',
  imports: [FormsModule, PaginationModule],
  templateUrl: './pager.html',
  styleUrl: './pager.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pager {
  readonly totalCount = input(0);
  readonly pageSize = input(0);
  readonly pageNumber = input(0);
  readonly pageChanged = output<number>();

  onPagerChange(event: PageChangedEvent) {
    this.pageChanged.emit(event.page);
  }
}