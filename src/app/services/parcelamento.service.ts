import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { PessoaParcelamento, PessoaParcelamentoDetalhe } from '../models/api.models';
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
  getParcelamentos(): Observable<PessoaParcelamento[]> {
    return this.http.get<PessoaParcelamento[]>(`${this.apiUrl}/PessoaParcelamento`);
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

    return new Observable(observer => {
      this.http.post<PessoaParcelamento>(url, parcelamento).subscribe({
        next: (parcelamentoResult) => {
          const codigoParcelamento = parcelamentoResult.codigo;
          const quantidadeParcelas = parcelamento.quantidadeParcelas;
          const valorTotal = parcelamento.valorTotal;
          const valorParcela = Number((valorTotal / quantidadeParcelas).toFixed(2));

          this.criarDetalhesParceladasSequencial(
            codigoParcelamento,
            parcelamento.codigoPessoa,
            quantidadeParcelas,
            valorParcela,
            dataCadastro
          ).subscribe({
            next: () => {
              observer.next(parcelamentoResult);
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        },
        error: (error) => observer.error(error)
      });
    });
  }

  // Método auxiliar para criar os detalhes das parcelas sequencialmente
  private criarDetalhesParceladasSequencial(
    codigoParcelamento: number,
    codigoPessoa: number,
    quantidadeParcelas: number,
    valorParcela: number,
    dataCadastro: string
  ): Observable<void> {
    return new Observable(observer => {
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

      this.criarDetalhesPorSequencia(parcelas, 0, observer);
    });
  }

  // Método auxiliar para fazer POST um por um
  private criarDetalhesPorSequencia(
    detalhes: PessoaParcelamentoDetalhe[],
    index: number,
    observer: any
  ): void {
    if (index >= detalhes.length) {
      observer.next();
      observer.complete();
      return;
    }

    const detalhe = detalhes[index];
    const url = `${this.apiUrl}/PessoaParcelamento/detalhes`;

    this.http.post<PessoaParcelamentoDetalhe>(url, detalhe).subscribe({
      next: () => this.criarDetalhesPorSequencia(detalhes, index + 1, observer),
      error: (error) => observer.error(error)
    });
  }

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
