import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, switchMap, concatMap, from, toArray, map } from 'rxjs';
import { PessoaParcelamento, PessoaParcelamentoDetalhe, PaginatedRequest } from '../models/api.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParcelamentoService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  // Obter todos os parcelamentos
  getParcelamentos(params?: PaginatedRequest): Observable<PessoaParcelamento[]> {
    let url = `${this.apiUrl}/PessoaParcelamento`;
    if (params) {
      url += `?pageIndex=${params.pageIndex}&pageSize=${params.pageSize}`;
      if (params.sortField) url += `&sortField=${params.sortField}`;
      if (params.sortDirection) url += `&sortDirection=${params.sortDirection}`;
    }
    return this.http.get<PessoaParcelamento[]>(url);
  }

  // Obter parcelamento por ID
  getParcelamentoById(codigo: number): Observable<PessoaParcelamento> {
    return this.http.get<PessoaParcelamento>(`${this.apiUrl}/PessoaParcelamento/${codigo}`);
  }

  // Obter parcelamentos por pessoa
  getParcelamentosPorPessoa(codigoPessoa: number): Observable<PessoaParcelamento[]> {
    return this.http.get<PessoaParcelamento[]>(`${this.apiUrl}/PessoaParcelamento/pessoa/${codigoPessoa}`);
  }

  // Criar novo parcelamento
  criarParcelamento(parcelamento: PessoaParcelamento): Observable<PessoaParcelamento> {
    return this.http.post<PessoaParcelamento>(`${this.apiUrl}/PessoaParcelamento`, parcelamento);
  }

  // Atualizar parcelamento
  atualizarParcelamento(codigo: number, parcelamento: PessoaParcelamento): Observable<PessoaParcelamento> {
    return this.http.put<PessoaParcelamento>(`${this.apiUrl}/PessoaParcelamento/${codigo}`, parcelamento);
  }

  // Excluir parcelamento
  excluirParcelamento(codigo: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/PessoaParcelamento/${codigo}`);
  }

  // Obter detalhes do parcelamento
  getDetalhesParcelamento(codigoParcelamento: number): Observable<PessoaParcelamentoDetalhe[]> {
    const url = `${this.apiUrl}/PessoaParcelamento/${codigoParcelamento}/detalhes`;
    return this.http.get<PessoaParcelamentoDetalhe[]>(url).pipe(
      catchError(() => {
        const urlAlternativa = `${this.apiUrl}/PessoaParcelamento/detalhe/${codigoParcelamento}`;
        return this.http.get<PessoaParcelamentoDetalhe[]>(urlAlternativa);
      })
    );
  }

  // Criar detalhe de parcelamento
  criarDetalheParcelamento(detalhe: PessoaParcelamentoDetalhe): Observable<PessoaParcelamentoDetalhe> {
    return this.http.post<PessoaParcelamentoDetalhe>(`${this.apiUrl}/PessoaParcelamento/detalhes`, detalhe);
  }

  // Atualizar detalhe de parcelamento
  atualizarDetalheParcelamento(codigo: number, detalhe: PessoaParcelamentoDetalhe): Observable<PessoaParcelamentoDetalhe> {
    return this.http.put<PessoaParcelamentoDetalhe>(`${this.apiUrl}/PessoaParcelamento/detalhes`, detalhe);
  }

  // Criar parcelamento com detalhes (duas etapas)
  criarParcelamentoComDetalhes(
    parcelamento: PessoaParcelamento, 
    dataCadastro: string
  ): Observable<PessoaParcelamento> {
    const url = `${this.apiUrl}/PessoaParcelamento`;

    return this.http.post<PessoaParcelamento>(url, parcelamento).pipe(
      switchMap(parcelamentoResult => {
        const codigoParcelamento = parcelamentoResult.codigo;
        const quantidadeParcelas = parcelamento.quantidadeParcelas;
        const valorTotal = parcelamento.valorTotal;
        const valorParcela = Number((valorTotal / quantidadeParcelas).toFixed(2));

        return this.criarDetalhesParceladasSequencial(
          codigoParcelamento,
          parcelamento.codigoPessoa,
          quantidadeParcelas,
          valorParcela,
          dataCadastro
        ).pipe(map(() => parcelamentoResult));
      })
    );
  }

  // Método auxiliar para criar os detalhes das parcelas sequencialmente
  private criarDetalhesParceladasSequencial(
    codigoParcelamento: number,
    codigoPessoa: number,
    quantidadeParcelas: number,
    valorParcela: number,
    dataCadastro: string
  ): Observable<PessoaParcelamentoDetalhe[]> {
    const dataCadastroObj = new Date(dataCadastro);
    const parcelas: PessoaParcelamentoDetalhe[] = [];

    for (let i = 1; i <= quantidadeParcelas; i++) {
      const dataVencimento = new Date(dataCadastroObj);
      dataVencimento.setDate(dataVencimento.getDate() + (30 * i));

      parcelas.push({
        codigo: 0,
        codigoParcelamento,
        numeroParcela: i,
        valorParcela,
        dataVencimento: this.formatDateToString(dataVencimento),
        dataPagamento: null,
        status: 1,
        excluido: false
      });
    }

    // POST sequencial usando concatMap (respeita a ordem)
    return from(parcelas).pipe(
      concatMap(detalhe =>
        this.http.post<PessoaParcelamentoDetalhe>(
          `${this.apiUrl}/PessoaParcelamento/detalhes`, detalhe
        )
      ),
      toArray()
    );
  }

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
