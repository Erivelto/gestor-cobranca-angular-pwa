import { CobrancaService } from '../../../services/cobranca.service';
import { PessoaService } from '../../../services/pessoa.service';
import { NotificationService } from '../../../services/notification.service';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PessoaCobrancaHistorico, Pessoa, PessoaCobranca, Cobranca } from '../../../models/api.models';
import { SpinnerService } from '../../../services/spinner.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { BrlCurrencyPipe, formatBrl } from '../../../pipes/brl-currency.pipe';
import { TitleCasePtPipe } from '../../../pipes/title-case.pipe';

@Component({
  selector: 'app-cobranca-detalhes',
  templateUrl: './cobranca-detalhes.component.html',
  styleUrls: ['./cobranca-detalhes.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    MatListModule,
    MatProgressBarModule,
    NgxMaskDirective,
    BrlCurrencyPipe,
    TitleCasePtPipe
  ],
  providers: [provideNgxMask()]
})
export class CobrancaDetalhesComponent implements OnInit, OnDestroy {
      private destroy$ = new Subject<void>();
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
        this.cobrancaService.updateCobranca(this.cobrancaDetalhes).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.dialog.open(DialogMessageComponent, {
            data: {
              title: 'Cobrança Finalizada',
              message: 'Cobrança marcada como paga com sucesso!'
            }
          });
          this.carregarDetalhes();
        },
        error: () => {
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

  pessoaDetalhes: Pessoa | null = null;
  loading: boolean = true;
  cobrancaId: number = 0;
  
  cobrancaDetalhes: Cobranca & { valorPagamento?: number } = {} as Cobranca & { valorPagamento?: number };

  // Histórico de pagamentos
  historicoPagamentos: { valor: number, data: Date }[] = [];
  dataSource = new MatTableDataSource(this.historicoPagamentos);
  displayedColumns: string[] = ['data', 'valor'];

  getStatusClass(status?: string | number): string {
    if (typeof status === 'number') {
      switch (status) {
        case 1: return 'status-pending';
        case 2: return 'status-completed';
        case 3: return 'status-overdue';
        case 4: return 'status-cancelled';
        default: return 'status-cancelled';
      }
    } else {
      switch (status) {
        case 'ativo': return 'status-active';
        case 'vencido': return 'status-overdue';
        case 'quitado': return 'status-completed';
        default: return 'status-cancelled';
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
  private notificationService: NotificationService,
  private dialog: MatDialog,
  private spinnerService: SpinnerService,
  private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
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
  this.cobrancaService.getCobrancaById(this.cobrancaId).pipe(takeUntil(this.destroy$)).subscribe({
    next: (cobranca) => {
      this.cobrancaDetalhes = cobranca;
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
        this.pessoaService.getPessoaById(cobranca.codigoPessoa).pipe(takeUntil(this.destroy$)).subscribe({
          next: (pessoa) => {
            this.pessoaDetalhes = pessoa;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      } else {
        this.loading = false;
        this.cdr.markForCheck();
      }
    },
    error: () => {
      this.loading = false;
      this.cdr.markForCheck();
    }
  });
}


  voltarLista(): void {
    this.router.navigate(['/cobrancas']);
  }

  deleteCobranca(): void {
    if (!this.cobrancaDetalhes || !this.cobrancaDetalhes.codigo) {
      this.notificationService.error('Erro', 'Dados da cobrança não encontrados.');
      return;
    }

    this.notificationService.confirmDelete('Excluir Cobrança', 'Tem certeza que deseja excluir esta cobrança? Esta ação não poderá ser desfeita.')
      .then((confirmed) => {
        if (confirmed) {
          this.cobrancaService.deleteCobranca(this.cobrancaDetalhes.codigo).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
              this.notificationService.success('Cobrança excluída!', 'Cobrança removida com sucesso.');
              setTimeout(() => {
                this.router.navigate(['/cobrancas']);
              }, 1000);
            },
            error: () => {
              this.notificationService.error('Erro', 'Não foi possível excluir a cobrança. Tente novamente.');
            }
          });
        }
      })
      .catch(() => {
      });
  }

  getStatusColor(): string {
    switch (this.cobrancaDetalhes.status) {
      case 1: return 'primary';  // ativo
      case 3: return 'warn';     // vencido/atrasado
      case 2: return 'accent';   // quitado
      default: return '';
    }
  }


  abaterPagamento(): void {
    if ((this.cobrancaDetalhes.valorPagamento ?? 0) <= 0) {
      this.dialog.open(DialogMessageComponent, {
        data: {
          title: 'Valor Inválido',
          message: 'Informe um valor válido para o pagamento.'
        }
      });
      return;
    }

    if ((this.cobrancaDetalhes.valorPagamento ?? 0) > (this.cobrancaDetalhes.valorTotal ?? 0)) {
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
        message: `Deseja abater ${formatBrl(this.cobrancaDetalhes.valorPagamento)} do empréstimo?`
      }
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      // Se o usuário clicar em OK, processa o pagamento
      if (result) {
        this.processarPagamento();
      }
    });
  }

  private async processarPagamento(): Promise<void> {
    // Armazenar o valor do pagamento antes de resetar
    const valorPago = this.cobrancaDetalhes.valorPagamento ?? 0;
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
    this.cobrancaDetalhes.valorTotal = (this.cobrancaDetalhes.valorTotal ?? 0) - valorPago;
    this.cobrancaDetalhes.valorPagamento = 0;

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
    try {
      await this.spinnerService.withSpinner(
        () => this.cobrancaService.updateCobranca(cobrancaPayload).toPromise(),
        { message: 'Abatendo pagamento...', fullScreen: true }
      );

      if ((this.cobrancaDetalhes.valorTotal ?? 0) <= 0) {
        this.cobrancaDetalhes.status = 2; // quitado
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
            message: `Pagamento de ${formatBrl(valorPago)} abatido com sucesso!`
          }
        });
      }
      this.carregarDetalhes();
    } catch (error: unknown) {
      const httpError = error as { error?: { message?: string }; status?: number };
      let mensagem = 'Não foi possível gravar o pagamento.';
      if (httpError?.error?.message) {
        mensagem = httpError.error.message;
      } else if (httpError?.status) {
        mensagem += ` (Código: ${httpError.status})`;
      }
      this.dialog.open(DialogMessageComponent, {
        data: {
          title: 'Erro',
          message: mensagem
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}