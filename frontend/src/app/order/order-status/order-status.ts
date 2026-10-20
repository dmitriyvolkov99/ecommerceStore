import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const STATUSES: Record<string, { label: string; classes: string }> = {
  Pending: { label: 'Ожидает оплаты', classes: 'bg-amber-100 text-amber-800' },
  PaymentReceived: { label: 'Оплачен', classes: 'bg-emerald-100 text-emerald-800' },
  PaymentFailed: { label: 'Ошибка оплаты', classes: 'bg-red-100 text-red-800' },
};

@Component({
  selector: 'app-order-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-block rounded-full px-3 py-1 text-xs font-bold md:text-sm" [class]="view().classes">
      {{ view().label }}
    </span>
  `,
})
export class OrderStatus {
  readonly status = input.required<string>();

  protected readonly view = computed(
    () => STATUSES[this.status()] ?? { label: this.status(), classes: 'bg-ground text-ink' },
  );
}