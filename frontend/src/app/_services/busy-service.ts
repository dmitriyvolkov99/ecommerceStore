import { inject, Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  private readonly spinnerService = inject(NgxSpinnerService);
  private busyRequestCount = 0;

  busy() {
    this.busyRequestCount++;
    this.spinnerService.show(undefined, {
      type: 'pacman',
      bdColor: 'rgba(255, 255, 255, 0.7)',
      color: '#333333',
    });
  }

  idle() {
    this.busyRequestCount = Math.max(0, this.busyRequestCount - 1);

    if (this.busyRequestCount === 0) {
      this.spinnerService.hide();
    }
  }
}