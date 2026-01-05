import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ViewChild } from '@angular/core';
import { PessoaParcelamento } from '../../../models/api.models';
import { ParcelamentoService } from '../../../services/parcelamento.service';
import { PessoaService } from '../../../services/pessoa.service';
import { SpinnerService } from '../../../services/spinner.service';
import { NotificationService } from '../../../services/notification.service';
import { DialogMessageComponent } from '../../shared/dialog-message.component';

@Component({
  selector: 'app-parcelamento-lista',
  templateUrl: './parcelamento-lista.component.html',
  styleUrls: ['./parcelamento-lista.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatMenuModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatTabsModule,
    MatDialogModule
  ]
})
export class ParcelamentoListaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private parcelamentoService = inject(ParcelamentoService);
  private pessoaService = inject(PessoaService);
  private spinner = inject(SpinnerService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  parcelamentos: PessoaParcelamento[] = [];
  dataSource = new MatTableDataSource<PessoaParcelamento>([]);
  pessoasMap: { [key: number]: string } = {};
  proximosVencimentosMap: { [key: number]: string | null } = {};
  searchTerm = '';
  loading = false;
  displayedColumns: string[] = ['pessoa', 'quantidadeParcelas', 'valorTotal', 'proximoVencimento', 'acoes'];
  selectedTabIndex = 0;

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      const pessoaNome = this.pessoasMap[data.codigoPessoa]?.toLowerCase() || '';
      const termo = filter.trim().toLowerCase();
      return (
        pessoaNome.includes(termo) ||
        String(data.quantidadeParcelas).includes(termo) ||
        String(data.valorTotal).includes(termo)
      );
    };
    this.carregarParcelamentos();
  }

  carregarParcelamentos(): void {
    this.loading = true;
    this.spinner.show();

    this.parcelamentoService.getParcelamentos().subscribe({
      next: (data) => {
        // Filtrar apenas parcelamentos ativos (status 1)
        this.parcelamentos = data.filter(p => p.status === 1 && !p.excluido);
        this.dataSource.data = this.parcelamentos;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.applyFilter();
        this.carregarNomesPessoas();
        this.loading = false;
        this.spinner.hide();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar parcelamentos:', error);
        this.loading = false;
        this.spinner.hide();
        this.notificationService.errorToast('Falha ao carregar parcelamentos');
      }
    });
  }

  carregarNomesPessoas(): void {
    const codigosPessoas = [...new Set(this.parcelamentos.map(p => p.codigoPessoa))];
    
    codigosPessoas.forEach(codigo => {
      this.pessoaService.getPessoaById(codigo).subscribe({
        next: (pessoa) => {
          this.pessoasMap[codigo] = pessoa.nome;
        },
        error: (error) => {
          console.error(`Erro ao carregar pessoa ${codigo}:`, error);
        }
      });
    });

    // Carregar próximos vencimentos
    this.parcelamentos.forEach(parcelamento => {
      this.parcelamentoService.getDetalhesParcelamento(parcelamento.codigo).subscribe({
        next: (detalhes) => {
          // Filtrar parcelas não pagas (dataPagamento null) e ordenar por data de vencimento
          const parcelasAbertas = detalhes
            .filter(d => !d.dataPagamento)
            .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());
          
          this.proximosVencimentosMap[parcelamento.codigo] = parcelasAbertas.length > 0 
            ? parcelasAbertas[0].dataVencimento 
            : null;
        },
        error: (error) => {
          console.error(`Erro ao carregar detalhes do parcelamento ${parcelamento.codigo}:`, error);
          this.proximosVencimentosMap[parcelamento.codigo] = null;
        }
      });
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getNomePessoa(codigoPessoa: number): string {
    return this.pessoasMap[codigoPessoa] || 'Carregando...';
  }

  getProximoVencimento(codigoParcelamento: number): string {
    const dataVencimento = this.proximosVencimentosMap[codigoParcelamento];
    if (!dataVencimento) {
      return this.proximosVencimentosMap[codigoParcelamento] === null ? 'Todas pagas' : 'Carregando...';
    }
    return new Date(dataVencimento).toLocaleDateString('pt-BR');
  }

  getStatusLabel(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'Pendente',
      1: 'Ativo',
      2: 'Finalizado',
      3: 'Cancelado'
    };
    return statusMap[status] || 'Desconhecido';
  }

  getStatusClass(status: number): string {
    const statusClasses: { [key: number]: string } = {
      0: 'status-pending',
      1: 'status-active',
      2: 'status-completed',
      3: 'status-cancelled'
    };
    return statusClasses[status] || '';
  }

  get ativosParcelamentos(): PessoaParcelamento[] {
    return this.parcelamentos.filter(p => p.status === 1);
  }

  get encerradosParcelamentos(): PessoaParcelamento[] {
    return this.parcelamentos.filter(p => p.status === 2);
  }

  get canceladosParcelamentos(): PessoaParcelamento[] {
    return this.parcelamentos.filter(p => p.status === 3);
  }

  editarParcelamento(parcelamento: PessoaParcelamento): void {
    this.router.navigate(['/parcelamento/editar', parcelamento.codigo]);
  }

  visualizarDetalhes(parcelamento: PessoaParcelamento): void {
    this.router.navigate(['/parcelamento/detalhes', parcelamento.codigo]);
  }

  excluirParcelamento(parcelamento: PessoaParcelamento): void {
    const dialogRef = this.dialog.open(DialogMessageComponent, {
      data: {
        title: 'Confirmar exclusão',
        message: `Deseja excluir o parcelamento de ${this.getNomePessoa(parcelamento.codigoPessoa)}?`,
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show();
        this.parcelamentoService.excluirParcelamento(parcelamento.codigo).subscribe({
          next: () => {
            this.notificationService.successToast('Parcelamento excluído com sucesso');
            this.carregarParcelamentos();
            this.spinner.hide();
          },
          error: (error) => {
            console.error('Erro ao excluir parcelamento:', error);
            this.notificationService.errorToast('Falha ao excluir parcelamento');
            this.spinner.hide();
          }
        });
      }
    });
  }

  novoParcelamento(): void {
    this.router.navigate(['/parcelamento/novo']);
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  showSuccessToast(message: string): void {
    this.notificationService.successToast(message);
  }

  showErrorToast(message: string): void {
    this.notificationService.errorToast(message);
  }
}
