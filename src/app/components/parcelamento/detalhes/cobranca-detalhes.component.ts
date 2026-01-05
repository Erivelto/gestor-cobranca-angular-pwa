import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PessoaParcelamento, PessoaParcelamentoDetalhe, Pessoa } from '../../../models/api.models';
import { ParcelamentoService } from '../../../services/parcelamento.service';
import { PessoaService } from '../../../services/pessoa.service';
import { SpinnerService } from '../../../services/spinner.service';
import Swal from 'sweetalert2';

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
    MatTableModule,
    MatDividerModule,
    MatTabsModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule
  ]
})
export class CobrancaDetalhesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private parcelamentoService = inject(ParcelamentoService);
  private pessoaService = inject(PessoaService);
  private spinner = inject(SpinnerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  parcelamento?: PessoaParcelamento;
  detalhes: PessoaParcelamentoDetalhe[] = [];
  pessoa?: Pessoa;
  loading = false;
  dataSource = new MatTableDataSource<PessoaParcelamentoDetalhe>([]);
  displayedColumns = ['numeroParcela', 'valorParcela', 'dataVencimento', 'dataPagamento', 'status', 'acoes'];

  ngOnInit(): void {
    this.carregarDetalhes();
  }

  carregarDetalhes(): void {
    this.loading = true;
    this.spinner.show();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.parcelamentoService.getParcelamentoById(Number(id)).subscribe({
          next: (parcelamento) => {
            this.parcelamento = parcelamento;
            this.carregarPessoa(parcelamento.codigoPessoa);
            this.carregarDetalhesParcelamento(parcelamento.codigo);
          },
          error: (error) => {
            console.error('Erro ao carregar parcelamento:', error);
            this.spinner.hide();
            this.loading = false;
          }
        });
      }
    });
  }

  carregarPessoa(codigoPessoa: number): void {
    this.pessoaService.getPessoaById(codigoPessoa).subscribe({
      next: (pessoa) => {
        this.pessoa = pessoa;
      },
      error: (error) => {
        console.error('Erro ao carregar pessoa:', error);
      }
    });
  }

  carregarDetalhesParcelamento(codigoParcelamento: number): void {
    this.parcelamentoService.getDetalhesParcelamento(codigoParcelamento).subscribe({
      next: (detalhes) => {
        this.detalhes = detalhes;
        this.dataSource.data = detalhes;
        this.dataSource.paginator = this.paginator;
        this.loading = false;
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes:', error);
        this.loading = false;
        this.spinner.hide();
      }
    });
  }

  getStatusLabel(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'Pendente',
      1: 'Pago',
      2: 'Cancelado',
      3: 'Atrasado'
    };
    return statusMap[status] || 'Desconhecido';
  }

  getStatusClass(status: number): string {
    const statusClasses: { [key: number]: string } = {
      0: 'status-pending',
      1: 'status-paid',
      2: 'status-cancelled',
      3: 'status-overdue'
    };
    return statusClasses[status] || '';
  }

  registrarPagamento(detalhe: PessoaParcelamentoDetalhe): void {
    Swal.fire({
      title: 'Registrar Pagamento',
      text: `Registrar pagamento da parcela ${detalhe.numeroParcela}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const detalhePago = {
          ...detalhe,
          dataPagamento: new Date().toISOString(),
          status: 1
        };

        this.spinner.show();
        this.parcelamentoService.atualizarDetalheParcelamento(detalhe.codigo, detalhePago).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Sucesso!', 'Pagamento registrado com sucesso', 'success');
            this.carregarDetalhesParcelamento(this.parcelamento!.codigo);
          },
          error: (error) => {
            console.error('Erro ao registrar pagamento:', error);
            this.spinner.hide();
            Swal.fire('Erro!', 'Falha ao registrar pagamento', 'error');
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
}
