import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para padronização de texto em Title Case:
 * primeira letra de cada palavra maiúscula, restante minúscula.
 *
 * Uso: {{ texto | titleCasePt }}
 *
 * Exemplos:
 *   "JOÃO DA SILVA"   → "João Da Silva"
 *   "maria jose"      → "Maria Jose"
 *   "GESTOR cobrança" → "Gestor Cobrança"
 *   null / undefined  → ""
 */
@Pipe({
  name: 'titleCasePt',
  standalone: true
})
export class TitleCasePtPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .replace(/\p{L}\S*/gu, word => word.charAt(0).toUpperCase() + word.slice(1));
  }
}
