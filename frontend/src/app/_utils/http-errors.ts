import { HttpErrorResponse } from '@angular/common/http';

/** Список понятных сообщений из ответа сервера (ProblemDetails). */
export function extractErrors(error: unknown): string[] {
  if (!(error instanceof HttpErrorResponse)) return ['Неизвестная ошибка'];

  const body = error.error;
  if (body?.errors && typeof body.errors === 'object') {
    const messages = (Array.isArray(body.errors) ? body.errors : Object.values(body.errors).flat()) as string[];
    const unique = [...new Set(messages)];
    if (unique.length > 0) return unique;
  }

  return [body?.detail ?? body?.title ?? 'Не удалось выполнить запрос'];
}