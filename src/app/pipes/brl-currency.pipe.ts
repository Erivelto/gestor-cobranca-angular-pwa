import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe centralizado para exibição de valores monetários em BRL.
 *
 * Uso: {{ valor | brl }}
 *
 * - null/undefined/NaN → "—"
 * - 0 → "R$ 0,00"
 * - negativo → formata normalmente (cor semântica via CSS)
 * - positivo → "R$ 1.234,56"
 */
@Pipe({
  name: 'brl',
  standalone: true
})
export class BrlCurrencyPipe implements PipeTransform {
  private static formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  transform(value: number | string | null | undefined): string {
    if (value == null) return '—';

    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';

    return BrlCurrencyPipe.formatter.format(num);
  }
}

/**
 * Funções utilitárias para manipulação de valores monetários.
 * Usar nos .ts quando não for possível usar o pipe no template.
 */
export function formatBrl(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Converte string monetária "1.234,56" ou "R$ 1.234,56" para number.
 * Retorna 0 se inválido.
 */
export function parseBrl(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
