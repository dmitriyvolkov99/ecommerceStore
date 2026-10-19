import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AccountService } from '../../_services/account-service';
import { BasketService } from '../../_services/basket-service';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBar {
  protected readonly accountService = inject(AccountService);
  protected readonly basketService = inject(BasketService);

  protected readonly menuOpen = signal(false);

  protected readonly initial = computed(
    () => this.accountService.currentUser()?.displayName?.charAt(0).toUpperCase() ?? '',
  );

  protected toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  protected closeMenu() {
    this.menuOpen.set(false);
  }

  protected logout() {
    this.closeMenu();
    this.accountService.logout();
  }
}