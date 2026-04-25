import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TitleCasePtPipe } from '../../../pipes/title-case.pipe';
import { PessoaParcelamento, PessoaParcelamentoDetalhe, Pessoa } from '../../../models/api.models';
import { ParcelamentoService } from '../../../services/parcelamento.service';
import { PessoaService } from '../../../services/pessoa.service';
import { SpinnerService } from '../../../services/spinner.service';
import { DialogMessageComponent } from '../../shared/dialog-message.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-parcelamento-detalhes',
  templateUrl: './parcelamento-detalhes.component.html',
  styleUrls: ['./parcelamento-detalhes.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTableModule,
    MatDividerModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    TitleCasePtPipe
  ]
})
export class ParcelamentoDetalhesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private parcelamentoService = inject(ParcelamentoService);
  private pessoaService = inject(PessoaService);
  private spinner = inject(SpinnerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  parcelamento?: PessoaParcelamento;
  detalhes: PessoaParcelamentoDetalhe[] = [];
  pessoa?: Pessoa;
  loading = false;
  dataSource = new MatTableDataSource<PessoaParcelamentoDetalhe>([]);
  displayedColumns = ['numeroParcela', 'valorParcela', 'dataVencimento', 'dataPagamento', 'status', 'acoes'];

  // Métricas de resumo
  totalParcelas = 0;
  parcelasAbertas = 0;
  parcelasPagas = 0;
  valorTotalPago = 0;
  valorTotalAberto = 0;

  ngOnInit(): void {
    this.carregarDetalhes();
  }

  carregarDetalhes(): void {
    this.loading = true;
    this.spinner.show();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.parcelamentoService.getParcelamentoById(Number(id)).pipe(takeUntil(this.destroy$)).subscribe({
          next: (parcelamento) => {
            this.parcelamento = parcelamento;
            this.carregarPessoa(parcelamento.codigoPessoa);
            this.carregarDetalhesParcelamento(parcelamento.codigo);
          },
          error: () => {
            this.spinner.hide();
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  carregarPessoa(codigoPessoa: number): void {
    this.pessoaService.getPessoaById(codigoPessoa).pipe(takeUntil(this.destroy$)).subscribe({
      next: (pessoa) => {
        this.pessoa = pessoa;
      },
      error: () => {
      }
    });
  }

  carregarDetalhesParcelamento(codigoParcelamento: number): void {
    this.parcelamentoService.getDetalhesParcelamento(codigoParcelamento).pipe(takeUntil(this.destroy$)).subscribe({
      next: (detalhes) => {
        this.detalhes = detalhes;
        this.dataSource.data = detalhes;
        this.calcularMetricasResumo();
        this.loading = false;
        this.cdr.markForCheck();
        this.spinner.hide();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.spinner.hide();
      }
    });
  }

  private calcularMetricasResumo(): void {
    this.totalParcelas = this.detalhes.length;
    // Status Aberto: dataPagamento é null
    this.parcelasAbertas = this.detalhes.filter(d => !d.dataPagamento).length;
    // Status Pago: dataPagamento não é null
    this.parcelasPagas = this.detalhes.filter(d => d.dataPagamento).length;
    
    this.valorTotalPago = this.detalhes
      .filter(d => d.dataPagamento)
      .reduce((sum, d) => sum + (d.valorParcela || 0), 0);
    
    this.valorTotalAberto = this.detalhes
      .filter(d => !d.dataPagamento)
      .reduce((sum, d) => sum + (d.valorParcela || 0), 0);
  }

  getStatusLabel(detalhe: PessoaParcelamentoDetalhe): string {
    // Se dataPagamento é null, está aberto. Senão, está pago
    if (!detalhe.dataPagamento) {
      return 'Aberto';
    }
    return 'Pago';
  }

  getStatusClass(detalhe: PessoaParcelamentoDetalhe): string {
    // Se dataPagamento é null, está pendente. Senão, está pago
    if (!detalhe.dataPagamento) {
      return 'status-pending';
    }
    return 'status-paid';
  }

  // Método para status do parcelamento principal
  getParcelamentoStatusLabel(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'Pendente',
      1: 'Ativo',
      2: 'Finalizado',
      3: 'Cancelado'
    };
    return statusMap[status] || 'Desconhecido';
  }

  registrarPagamento(detalhe: PessoaParcelamentoDetalhe): void {
    const dialogRef = this.dialog.open(DialogMessageComponent, {
      data: {
        title: 'Registrar Pagamento',
        message: `Deseja registrar o pagamento da parcela ${detalhe.numeroParcela}?`,
        type: 'confirm'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        const today = new Date().toISOString().split('T')[0];
        const detalhePago = {
          ...detalhe,
          dataPagamento: today,
          status: 2  // 1 = Pendente, 2 = Pago
        };

        this.spinner.show();
        this.parcelamentoService.atualizarDetalheParcelamento(detalhe.codigo, detalhePago).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.spinner.hide();
            this.snackBar.open('Pagamento registrado com sucesso', 'Fechar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            this.carregarDetalhesParcelamento(this.parcelamento!.codigo);
          },
          error: () => {
            this.spinner.hide();
            this.snackBar.open('Falha ao registrar pagamento', 'Fechar', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  editarParcelamento(): void {
    if (this.parcelamento) {
      this.router.navigate(['/parcelamento/editar', this.parcelamento.codigo]);
    }
  }

  voltar(): void {
    this.router.navigate(['/parcelamento']);
  }

  formatarMoeda(valor: number | null | undefined): string {
    if (valor == null || isNaN(valor)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }

  formatarData(data: string | null | undefined): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  get valorParcelaMensal(): number {
    if (!this.parcelamento) return 0;
    return this.parcelamento.valorTotal / this.parcelamento.quantidadeParcelas;
  }

  get percentualConclusao(): number {
    if (this.totalParcelas === 0) return 0;
    return Math.round((this.parcelasPagas / this.totalParcelas) * 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
