import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BasketService } from '../../_services/basket-service';
import { AccountService } from '../../_services/account-service';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive, BsDropdownModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBar {
  private readonly accountService = inject(AccountService);

  protected readonly basket = inject(BasketService).basket;
  protected readonly currentUser = this.accountService.currentUser;

  logout() {
    this.accountService.logout();
  }
}