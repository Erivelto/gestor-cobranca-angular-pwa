import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
import { CobrancaService } from '../../../services/cobranca.service';
import { Cobranca } from '../../../models/api.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cobrancas-lista',
  templateUrl: './cobrancas-lista.component.html',
  styleUrls: ['./cobrancas-lista.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
    MatTooltipModule
  ]
})
export class CobrancasListaComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  cobrancas: Cobranca[] = [];
  dataSource = new MatTableDataSource<Cobranca>([]);
  loading: boolean = true;
  error: string = '';
  searchTerm: string = '';
  displayedColumns: string[] = ['nome', 'acoes'];

  constructor(
    private cobrancaService: CobrancaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarCobrancas();
    this.setupTable();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupTable(): void {
    // Configurar filtro customizado
    this.dataSource.filterPredicate = (data: Cobranca, filter: string) => {
      const searchString = filter.toLowerCase();
      return (
        data.pessoa?.nome?.toLowerCase().includes(searchString) ||
        data.pessoa?.documento?.toLowerCase().includes(searchString) ||
        data.valor?.toString().includes(searchString) ||
        this.getStatusText(data.status).toLowerCase().includes(searchString)
      );
    };
  }

  carregarCobrancas(): void {
    console.log('🚀 Iniciando carregarCobrancas()');
    this.loading = true;
    this.error = '';

    // Dados mocados para teste
    setTimeout(() => {
      const cobrancasMocadas: Cobranca[] = [
        {
          codigo: 1,
          codigopessoa: 1,
          descricao: 'Empréstimo para capital de giro',
          valor: 1500.00,
          dataVencimento: '2024-12-31',
          status: 1,
          pessoa: {
            codigo: 1,
            nome: 'João Silva',
            documento: '123.456.789-00'
          }
        },
        {
          codigo: 2,
          codigopessoa: 2,
          descricao: 'Primeira parcela em atraso',
          valor: 2500.00,
          dataVencimento: '2024-11-30',
          status: 3,
          pessoa: {
            codigo: 2,
            nome: 'Maria Santos',
            documento: '987.654.321-00'
          }
        },
        {
          codigo: 3,
          codigopessoa: 3,
          descricao: 'Empréstimo quitado',
          valor: 5000.00,
          dataVencimento: '2024-10-15',
          status: 2,
          dataPagamento: '2024-10-10',
          pessoa: {
            codigo: 3,
            nome: 'Pedro Costa',
            documento: '456.789.123-00'
          }
        }
      ];
      
      console.log('🎯 Cobranças mocadas:', cobrancasMocadas);
      
      this.cobrancas = cobrancasMocadas;
      this.dataSource.data = cobrancasMocadas;
      this.loading = false;
      console.log('🏁 Loading definido como false');
    }, 1000);
  }

  novaCobranca(): void {
    this.router.navigate(['/cobrancas/nova']);
  }

  editarCobranca(cobranca: Cobranca): void {
    console.log('=== MÉTODO EDITAR COBRANÇA CHAMADO ===');
    console.log('Cobrança recebida:', cobranca);
    
    if (!cobranca || !cobranca.codigo) {
      console.error('Cobrança não fornecida ou inválida');
      this.showErrorToast('Dados da cobrança não encontrados. Recarregue a página e tente novamente.');
      return;
    }
    
    console.log('Navegando para detalhes da cobrança:', cobranca.codigo);
    this.router.navigate(['/cobrancas/detalhes', cobranca.codigo]);
  }

  excluirCobranca(cobranca: Cobranca): void {
    if (!cobranca || !cobranca.codigo) {
      this.showErrorToast('Dados da cobrança não encontrados');
      return;
    }
    
    Swal.fire({
      title: 'Excluir Cobrança',
      text: 'Tem certeza que deseja excluir esta cobrança? Esta ação não poderá ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.cobrancaService.deleteCobranca(cobranca.codigo!).subscribe({
          next: () => {
            this.showSuccessToast('Cobrança excluída com sucesso!');
            this.carregarCobrancas();
          },
          error: (error: any) => {
            console.error('Erro ao excluir cobrança:', error);
            this.showErrorToast('Não foi possível excluir a cobrança. Tente novamente.');
          }
        });
      }
    });
  }

  getStatusText(status?: number): string {
    switch (status) {
      case 1: return 'Pendente';
      case 2: return 'Pago';
      case 3: return 'Vencido';
      case 4: return 'Cancelado';
      default: return 'Indefinido';
    }
  }

  getStatusClass(status?: number): string {
    switch (status) {
      case 1: return 'badge-warning';
      case 2: return 'badge-success';
      case 3: return 'badge-danger';
      case 4: return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getStatusIcon(status?: number): string {
    switch (status) {
      case 1: return 'schedule';
      case 2: return 'check_circle';
      case 3: return 'error';
      case 4: return 'cancel';
      default: return 'help';
    }
  }

  getStatusColor(status?: number): string {
    switch (status) {
      case 1: return 'accent';
      case 2: return 'primary';
      case 3: return 'warn';
      case 4: return '';
      default: return '';
    }
  }

  // Métodos para a tabela
  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onRowClick(cobranca: Cobranca): void {
    // Navegar para detalhes ou edição ao clicar na linha
    this.editarCobranca(cobranca);
  }

  // Performance optimization: TrackBy function for ngFor
  trackByCobranca(index: number, cobranca: Cobranca): any {
    return cobranca.codigo || index;
  }

  // Métodos auxiliares para notificações
  private showSuccessToast(message: string): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  private showErrorToast(message: string): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
}

