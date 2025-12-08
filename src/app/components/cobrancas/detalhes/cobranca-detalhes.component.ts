import { CobrancaService } from '../../../services/cobranca.service';
import { PessoaService } from '../../../services/pessoa.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogMessageComponent } from '../../shared/dialog-message.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { PessoaCobrancaHistorico } from '../../../models/api.models';

@Component({
  selector: 'app-cobranca-detalhes',
  templateUrl: './cobranca-detalhes.component.html',
  styleUrls: ['./cobranca-detalhes.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatExpansionModule,
    MatListModule
  ]
})
export class CobrancaDetalhesComponent implements OnInit {
      // Função utilitária para garantir formato yyyy-MM-dd
      private formatDate(dateStr?: string): string {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) return dateStr.split('T')[0];
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      }
    finalizarCobranca(): void {
      if (!this.cobrancaDetalhes || !this.cobrancaDetalhes.codigo) {
        this.dialog.open(DialogMessageComponent, {
          data: {
            title: 'Erro',
            message: 'Dados da cobrança não encontrados.'
          }
        });
        return;
      }
      // Atualiza status para Pago e define dataPagamento
      this.cobrancaDetalhes.status = 2;
      this.cobrancaDetalhes.dataPagamento = new Date().toISOString().split('T')[0];
        this.cobrancaService.updateCobranca(this.cobrancaDetalhes).subscribe({
        next: () => {
          this.dialog.open(DialogMessageComponent, {
            data: {
              title: 'Cobrança Finalizada',
              message: 'Cobrança marcada como paga com sucesso!'
            }
          });
          this.carregarDetalhes();
        },
        error: (error: any) => {
          console.error('Erro ao finalizar cobrança:', error);
          this.dialog.open(DialogMessageComponent, {
            data: {
              title: 'Erro',
              message: 'Não foi possível finalizar a cobrança. Tente novamente.'
            }
          });
        }
      });
    }
  // ...existing code...

  pessoaDetalhes: any = null;
  loading: boolean = true;
  cobrancaId: number = 0;
  
  cobrancaDetalhes: any = null;

  // Histórico de pagamentos
  historicoPagamentos: { valor: number, data: Date }[] = [];
  dataSource = new MatTableDataSource(this.historicoPagamentos);
  displayedColumns: string[] = ['data', 'valor'];
  
  // Campo formatado para exibição
  valorPagamentoFormatado: string = '0,00';

  getStatusClass(status?: string | number): string {
    // Permite status como string ou número para padronizar
    if (typeof status === 'number') {
      switch (status) {
        case 1: return 'badge-warning';
        case 2: return 'badge-success';
        case 3: return 'badge-danger';
        case 4: return 'badge-secondary';
        default: return 'badge-secondary';
      }
    } else {
      switch (status) {
        case 'ativo': return 'badge-success';
        case 'vencido': return 'badge-danger';
        case 'quitado': return 'badge-warning';
        default: return 'badge-secondary';
      }
    }
  }

  getStatusText(status?: string | number): string {
    if (typeof status === 'number') {
      switch (status) {
        case 1: return 'Pendente';
        case 2: return 'Pago';
        case 3: return 'Vencido';
        case 4: return 'Cancelado';
        default: return 'Indefinido';
      }
    } else {
      switch (status) {
        case 'ativo': return 'Ativo';
        case 'vencido': return 'Vencido';
        case 'quitado': return 'Quitado';
        default: return 'Indefinido';
      }
    }
  }
  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private cobrancaService: CobrancaService,
  private pessoaService: PessoaService,
  private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Simular carregamento
    this.route.params.subscribe(params => {
      const novoId = +params['id'] || 1;
      
      // Resetar histórico apenas se mudou de cobrança
      if (this.cobrancaId !== novoId) {
        this.historicoPagamentos = [];
        this.dataSource.data = this.historicoPagamentos;
      }
      
      this.cobrancaId = novoId;
      this.carregarDetalhes();
    });
  }


carregarDetalhes(): void {
  this.loading = true;
  this.cobrancaService.getCobrancaById(this.cobrancaId).subscribe({
    next: (cobranca) => {
      this.cobrancaDetalhes = cobranca;
      console.log('[COBRANCA] Detalhes recebidos:', cobranca);
      // Preencher histórico de pagamentos se existir
         let historicoArray: { valor: number, data: Date }[] = [];
         if (cobranca.historicos && Array.isArray(cobranca.historicos)) {
           // Filtra apenas históricos com valorPagamento e dataPagamento preenchidos
           const historicosPagos = cobranca.historicos.filter(
             (h: PessoaCobrancaHistorico) => h.valorPagamento != null && h.dataPagamento != null
           );
           historicoArray = historicosPagos.map((h: PessoaCobrancaHistorico) => ({
             valor: h.valorPagamento,
             // Ajusta para fuso local do usuário
             data: h.dataPagamento ? new Date(h.dataPagamento + 'Z') : new Date()
           }));
      }
      // Incluir pessoaCobrancaHistorico se existir e tiver valorPagamento
      if (cobranca.pessoaCobrancaHistorico && cobranca.pessoaCobrancaHistorico.valorPagamento) {
        historicoArray.push({
          valor: cobranca.pessoaCobrancaHistorico.valorPagamento,
          data: cobranca.pessoaCobrancaHistorico.dataPagamento ? new Date(cobranca.pessoaCobrancaHistorico.dataPagamento) : new Date()
        });
      }
      // Filtrar apenas pagamentos com valor > 0
      const historicoPagamentosFiltrados = historicoArray.filter(h => h.valor > 0);
      this.historicoPagamentos = historicoPagamentosFiltrados;
      this.dataSource.data = historicoPagamentosFiltrados;
      if (cobranca && cobranca.codigoPessoa) {
        console.log('[COBRANCA] codigoPessoa:', cobranca.codigoPessoa);
        this.pessoaService.getPessoaById(cobranca.codigoPessoa).subscribe({
          next: (pessoa) => {
            console.log('[PESSOA] Detalhes recebidos:', pessoa);
            this.pessoaDetalhes = pessoa;
            this.loading = false;
          },
          error: (error) => {
            console.error('[PESSOA] Erro ao buscar detalhes da pessoa:', error);
            this.loading = false;
          }
        });
      } else {
        console.warn('[COBRANCA] codigoPessoa não encontrado ou nulo:', cobranca);
        this.loading = false;
      }
    },
    error: (error) => {
      console.error('[COBRANCA] Erro ao buscar detalhes da cobrança:', error);
      this.loading = false;
    }
  });
}


  voltarLista(): void {
    this.router.navigate(['/cobrancas']);
  }

  getStatusColor(): string {
    switch (this.cobrancaDetalhes.status) {
      case 'ativo': return 'primary';
      case 'vencido': return 'warn';
      case 'quitado': return 'accent';
      default: return '';
    }
  }


  // Métodos para máscara de moeda
  onValorPagamentoInput(event: any): void {
    const input = event.target;
    let valor = input.value;
    
    // Remove tudo que não for número
    valor = valor.replace(/\D/g, '');
    
    // Converte para número e divide por 100 para ter os centavos
    const numeroValor = parseInt(valor || '0') / 100;
    
    // Atualiza o valor numérico no modelo
    this.cobrancaDetalhes.valorPagamento = numeroValor;
    
    // Formata para exibição
    this.valorPagamentoFormatado = this.formatarMoeda(numeroValor);
    
    // Atualiza o input
    input.value = this.valorPagamentoFormatado;
  }

  onValorPagamentoFocus(event: any): void {
    const input = event.target;
    if (this.cobrancaDetalhes.valorPagamento === 0) {
      input.value = '';
    }
  }

  onValorPagamentoBlur(event: any): void {
    const input = event.target;
    if (input.value === '') {
      this.cobrancaDetalhes.valorPagamento = 0;
      this.valorPagamentoFormatado = '0,00';
      input.value = this.valorPagamentoFormatado;
    }
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  abaterPagamento(): void {
    if (this.cobrancaDetalhes.valorPagamento <= 0) {
      this.dialog.open(DialogMessageComponent, {
        data: {
          title: 'Valor Inválido',
          message: 'Informe um valor válido para o pagamento.'
        }
      });
      return;
    }

    if (this.cobrancaDetalhes.valorPagamento > this.cobrancaDetalhes.valorTotal) {
      this.dialog.open(DialogMessageComponent, {
        data: {
          title: 'Valor Excedente',
          message: 'O valor do pagamento não pode ser maior que o valor total.'
        }
      });
      return;
    }

    // Confirmar o pagamento
    const dialogRef = this.dialog.open(DialogMessageComponent, {
      data: {
        title: 'Confirmar Pagamento',
        message: `Deseja abater R$ ${this.formatarMoeda(this.cobrancaDetalhes.valorPagamento)} do empréstimo?`
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Se o usuário clicar em OK, processa o pagamento
      if (result) {
        this.processarPagamento();
      }
    });
  }

  private processarPagamento(): void {
    // Armazenar o valor do pagamento antes de resetar
    const valorPago = this.cobrancaDetalhes.valorPagamento;
    const dataPagamento = new Date().toISOString();

    // Adicionar ao histórico de pagamentos (visual)
    this.historicoPagamentos.push({
      valor: valorPago,
      data: new Date()
    });
    this.dataSource.data = [...this.historicoPagamentos];

     // Atualizar valorPagamento do histórico correto
     // Atualizar histórico existente se dataVencimento igual e valorPagamento/dataPagamento nulos, senão criar novo
     if (!this.cobrancaDetalhes.historicos) {
       this.cobrancaDetalhes.historicos = [];
     }
     const historicoExistente = this.cobrancaDetalhes.historicos.find(
       (h: PessoaCobrancaHistorico) => h.dataVencimento === this.cobrancaDetalhes.dataVencimento && h.valorPagamento == null && h.dataPagamento == null
     );
     if (historicoExistente) {
       historicoExistente.valorPagamento = valorPago;
       historicoExistente.dataPagamento = dataPagamento;
     } else {
       this.cobrancaDetalhes.historicos.push({
         codigo: 0,
         codigoCobranca: this.cobrancaDetalhes.codigo,
         dataVencimento: this.cobrancaDetalhes.dataVencimento || dataPagamento,
         dataPagamento: dataPagamento,
         valorPagamento: valorPago
       });
     }

     // Tipagem explícita para busca de histórico (caso precise atualizar algum existente)
     // Exemplo:
     // const historicoParaAtualizar = this.cobrancaDetalhes.historicos.find(
     //   (h: PessoaCobrancaHistorico) => h.dataVencimento === this.cobrancaDetalhes.dataVencimento && h.valorPagamento == null
     // );

    // Atualizar pessoaCobrancaHistorico para novo vencimento/pagamento (objeto único)
    this.cobrancaDetalhes.pessoaCobrancaHistorico = {
      codigo: 0,
      codigoCobranca: this.cobrancaDetalhes.codigo,
      dataVencimento: this.cobrancaDetalhes.dataVencimento || dataPagamento,
      dataPagamento: dataPagamento,
      valorPagamento: valorPago
    };

    // Lógica para abater o pagamento
    this.cobrancaDetalhes.valorTotal -= valorPago;
    this.cobrancaDetalhes.valorPagamento = 0;
    this.valorPagamentoFormatado = '0,00';

    // Chamar updateCobranca para gravar os dados no backend
    // Montar todos os campos obrigatórios esperados pela API
    const pessoaCobrancaHistorico = {
      codigo: typeof this.cobrancaDetalhes.pessoaCobrancaHistorico?.codigo === 'number' ? this.cobrancaDetalhes.pessoaCobrancaHistorico.codigo : 0,
      codigoCobranca: typeof this.cobrancaDetalhes.codigo === 'number' ? this.cobrancaDetalhes.codigo : 0,
      dataVencimento: this.cobrancaDetalhes.pessoaCobrancaHistorico?.dataVencimento ?? new Date().toISOString(),
      dataPagamento: this.cobrancaDetalhes.pessoaCobrancaHistorico?.dataPagamento ?? new Date().toISOString(),
      valorPagamento: typeof this.cobrancaDetalhes.pessoaCobrancaHistorico?.valorPagamento === 'number' ? this.cobrancaDetalhes.pessoaCobrancaHistorico.valorPagamento : 0
    };

    // Montar historicos
    const historicos = Array.isArray(this.cobrancaDetalhes.historicos) && this.cobrancaDetalhes.historicos.length > 0
      ? this.cobrancaDetalhes.historicos
          .filter((h: PessoaCobrancaHistorico) => h.valorPagamento != null && h.dataPagamento != null)
          .map((h: PessoaCobrancaHistorico) => ({
            codigo: typeof h.codigo === 'number' ? h.codigo : 0,
            codigoCobranca: typeof h.codigoCobranca === 'number' ? h.codigoCobranca : 0,
            dataVencimento: h.dataVencimento ?? new Date().toISOString(),
            dataPagamento: h.dataPagamento ?? new Date().toISOString(),
            valorPagamento: typeof h.valorPagamento === 'number' ? h.valorPagamento : 0
          }))
      : [pessoaCobrancaHistorico];

    // Payload completo
    const cobrancaPayload = {
      codigo: typeof this.cobrancaDetalhes.codigo === 'number' ? this.cobrancaDetalhes.codigo : 0,
      codigoPessoa: typeof this.cobrancaDetalhes.codigoPessoa === 'number' ? this.cobrancaDetalhes.codigoPessoa : 0,
      tipoCobranca: this.cobrancaDetalhes.tipoCobranca ?? '',
      valor: typeof this.cobrancaDetalhes.valor === 'number' ? this.cobrancaDetalhes.valor : 0,
      juros: typeof this.cobrancaDetalhes.juros === 'number' ? this.cobrancaDetalhes.juros : 0,
      multa: typeof this.cobrancaDetalhes.multa === 'number' ? this.cobrancaDetalhes.multa : 0,
      valorTotal: typeof this.cobrancaDetalhes.valorTotal === 'number' ? this.cobrancaDetalhes.valorTotal : 0,
      dataInicio: this.cobrancaDetalhes.dataInicio ?? new Date().toISOString(),
      diaVencimento: typeof this.cobrancaDetalhes.diaVencimento === 'number' ? this.cobrancaDetalhes.diaVencimento : 0,
      dataQuitacao: this.cobrancaDetalhes.dataQuitacao ?? new Date().toISOString(),
      status: typeof this.cobrancaDetalhes.status === 'number' ? this.cobrancaDetalhes.status : 0,
      excluido: typeof this.cobrancaDetalhes.excluido === 'boolean' ? this.cobrancaDetalhes.excluido : false,
      // historicos removido do payload conforme solicitado
      pessoaCobrancaHistorico: pessoaCobrancaHistorico
      // Adiciona pessoaCobrancaDetalhe se existir
      , ...(this.cobrancaDetalhes.pessoaCobrancaDetalhe ? { pessoaCobrancaDetalhe: this.cobrancaDetalhes.pessoaCobrancaDetalhe } : {})
    };
    this.cobrancaService.updateCobranca(cobrancaPayload).subscribe({
      next: () => {
        // Verificar se foi quitado
        if (this.cobrancaDetalhes.valorTotal <= 0) {
          this.cobrancaDetalhes.status = 'quitado';
          this.dialog.open(DialogMessageComponent, {
            data: {
              title: 'Empréstimo Quitado!',
              message: 'Parabéns! O empréstimo foi quitado com sucesso.'
            }
          });
        } else {
          this.dialog.open(DialogMessageComponent, {
            data: {
              title: 'Pagamento Realizado!',
              message: `Pagamento de R$ ${this.formatarMoeda(valorPago)} abatido com sucesso!`
            }
          });
        }
        this.carregarDetalhes();
      },
      error: (error: any) => {
        let mensagem = 'Não foi possível gravar o pagamento.';
        if (error?.error?.message) {
          mensagem = error.error.message;
        } else if (error?.status) {
          mensagem += ` (Código: ${error.status})`;
        }
        this.dialog.open(DialogMessageComponent, {
          data: {
            title: 'Erro',
            message: mensagem
          }
        });
      }
    });
  }
}