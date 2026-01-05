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

  constructor(private http: HttpClient) {}

  // Obter todos os parcelamentos
  getParcelamentos(): Observable<PessoaParcelamento[]> {
    const url = `${this.apiUrl}/PessoaParcelamento`;
    console.log('📋 ParcelamentoService.getParcelamentos() - URL:', url);
    return this.http.get<PessoaParcelamento[]>(url);
  }

  // Obter parcelamento por ID
  getParcelamentoById(codigo: number): Observable<PessoaParcelamento> {
    const url = `${this.apiUrl}/PessoaParcelamento/${codigo}`;
    console.log('📋 ParcelamentoService.getParcelamentoById() - URL:', url);
    return this.http.get<PessoaParcelamento>(url);
  }

  // Obter parcelamentos por pessoa
  getParcelamentosPorPessoa(codigoPessoa: number): Observable<PessoaParcelamento[]> {
    const url = `${this.apiUrl}/PessoaParcelamento/pessoa/${codigoPessoa}`;
    console.log('📋 ParcelamentoService.getParcelamentosPorPessoa() - URL:', url);
    return this.http.get<PessoaParcelamento[]>(url);
  }

  // Criar novo parcelamento
  criarParcelamento(parcelamento: PessoaParcelamento): Observable<PessoaParcelamento> {
    const url = `${this.apiUrl}/PessoaParcelamento`;
    console.log('✏️ ParcelamentoService.criarParcelamento() - URL:', url);
    console.log('📦 Dados:', parcelamento);
    return this.http.post<PessoaParcelamento>(url, parcelamento);
  }

  // Atualizar parcelamento
  atualizarParcelamento(codigo: number, parcelamento: PessoaParcelamento): Observable<PessoaParcelamento> {
    const url = `${this.apiUrl}/PessoaParcelamento/${codigo}`;
    console.log('✏️ ParcelamentoService.atualizarParcelamento() - URL:', url);
    console.log('📦 Dados:', parcelamento);
    return this.http.put<PessoaParcelamento>(url, parcelamento);
  }

  // Excluir parcelamento
  excluirParcelamento(codigo: number): Observable<void> {
    const url = `${this.apiUrl}/PessoaParcelamento/${codigo}`;
    console.log('🗑️ ParcelamentoService.excluirParcelamento() - URL:', url);
    return this.http.delete<void>(url);
  }

  // Obter detalhes do parcelamento
  getDetalhesParcelamento(codigoParcelamento: number): Observable<PessoaParcelamentoDetalhe[]> {
    const url = `${this.apiUrl}/PessoaParcelamento/${codigoParcelamento}/detalhes`;
    console.log('📋 ParcelamentoService.getDetalhesParcelamento() - URL:', url);
    return this.http.get<PessoaParcelamentoDetalhe[]>(url).pipe(
      catchError((error) => {
        console.warn('⚠️ Erro ao buscar detalhes com /detalhes, tentando /detalhe...');
        // Tentar endpoint alternativo se o primeiro falhar
        const urlAlternativa = `${this.apiUrl}/PessoaParcelamento/detalhe/${codigoParcelamento}`;
        return this.http.get<PessoaParcelamentoDetalhe[]>(urlAlternativa);
      })
    );
  }

  // Criar detalhe de parcelamento
  criarDetalheParcelamento(detalhe: PessoaParcelamentoDetalhe): Observable<PessoaParcelamentoDetalhe> {
    const url = `${this.apiUrl}/PessoaParcelamento/detalhes`;
    console.log('✏️ ParcelamentoService.criarDetalheParcelamento() - URL:', url);
    console.log('📦 Dados:', detalhe);
    return this.http.post<PessoaParcelamentoDetalhe>(url, detalhe);
  }

  // Atualizar detalhe de parcelamento
  atualizarDetalheParcelamento(codigo: number, detalhe: PessoaParcelamentoDetalhe): Observable<PessoaParcelamentoDetalhe> {
    const url = `${this.apiUrl}/PessoaParcelamento/detalhes`;
    console.log('✏️ ParcelamentoService.atualizarDetalheParcelamento() - URL:', url);
    console.log('📦 Dados:', detalhe);
    return this.http.put<PessoaParcelamentoDetalhe>(url, detalhe);
  }

  // Criar parcelamento com detalhes (duas etapas)
  // 1. Cria o parcelamento principal
  // 2. Cria os detalhes das parcelas (divisão de 30 em 30 dias a partir da data de cadastro)
  criarParcelamentoComDetalhes(
    parcelamento: PessoaParcelamento, 
    dataCadastro: string
  ): Observable<PessoaParcelamento> {
    const url = `${this.apiUrl}/PessoaParcelamento`;
    
    console.log('💰 ParcelamentoService.criarParcelamentoComDetalhes()');
    console.log('📦 Parcelamento:', parcelamento);
    console.log('📅 Data Cadastro:', dataCadastro);

    // Primeiro: Criar o parcelamento principal
    return new Observable(observer => {
      this.http.post<PessoaParcelamento>(url, parcelamento).subscribe({
        next: (parcelamentoResult) => {
          console.log('✅ Parcelamento criado com sucesso!');
          console.log('📝 ID do Parcelamento:', parcelamentoResult.codigo);

          const codigoParcelamento = parcelamentoResult.codigo;
          const quantidadeParcelas = parcelamento.quantidadeParcelas;
          const valorTotal = parcelamento.valorTotal;

          // Calcular valor de cada parcela
          const valorParcela = Number((valorTotal / quantidadeParcelas).toFixed(2));

          console.log('📊 Divisão de parcelas:');
          console.log('  - Quantidade:', quantidadeParcelas);
          console.log('  - Valor total:', valorTotal);
          console.log('  - Valor por parcela:', valorParcela);

          // Segundo: Criar os detalhes das parcelas
          this.criarDetalhesParceladasSequencial(
            codigoParcelamento,
            parcelamento.codigoPessoa,
            quantidadeParcelas,
            valorParcela,
            dataCadastro
          ).subscribe({
            next: () => {
              console.log('✅ Todos os detalhes das parcelas foram criados com sucesso!');
              observer.next(parcelamentoResult);
              observer.complete();
            },
            error: (error) => {
              console.error('❌ Erro ao criar detalhes das parcelas:', error);
              observer.error(error);
            }
          });
        },
        error: (error) => {
          console.error('❌ Erro ao criar parcelamento:', error);
          observer.error(error);
        }
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
      let parcelajasArmaz: PessoaParcelamentoDetalhe[] = [];

      // Montar lista de detalhes
      for (let i = 1; i <= quantidadeParcelas; i++) {
        // Calcular data de vencimento: data de cadastro + (30 dias * número da parcela)
        const dataVencimento = new Date(dataCadastroObj);
        dataVencimento.setDate(dataVencimento.getDate() + (30 * i));

        const detalhe: PessoaParcelamentoDetalhe = {
          codigo: 0,
          codigoParcelamento: codigoParcelamento,
          numeroParcela: i,
          valorParcela: valorParcela,
          dataVencimento: this.formatDateToString(dataVencimento),
          dataPagamento: null,
          status: 1, // Ativo/Pendente
          excluido: false
        };

        parcelajasArmaz.push(detalhe);

        console.log(`  📌 Parcela ${i}:`);
        console.log(`     - Vencimento: ${detalhe.dataVencimento}`);
        console.log(`     - Valor: ${detalhe.valorParcela}`);
      }

      // Criar todas as parcelas sequencialmente
      this.criarDetalhesPorSequencia(parcelajasArmaz, 0, observer);
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

    console.log(`🔄 Criando parcela ${detalhe.numeroParcela}/${detalhes.length}...`);

    this.http.post<PessoaParcelamentoDetalhe>(url, detalhe).subscribe({
      next: (result) => {
        console.log(`  ✅ Parcela ${detalhe.numeroParcela} criada com sucesso!`);
        // Continuar com a próxima
        this.criarDetalhesPorSequencia(detalhes, index + 1, observer);
      },
      error: (error) => {
        console.error(`  ❌ Erro ao criar parcela ${detalhe.numeroParcela}:`, error);
        observer.error(error);
      }
    });
  }

  // Função auxiliar para formatar data como string (YYYY-MM-DD)
  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
