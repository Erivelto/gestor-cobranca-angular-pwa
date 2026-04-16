import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PessoaService } from '../../../services/pessoa.service';
import { NotificationService } from '../../../services/notification.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Pessoa } from '../../../models/api.models';
import { CobrancaService } from '../../../services/cobranca.service';

@Component({
  selector: 'app-pessoas-lista',
  templateUrl: './pessoas-lista.component.html',
  styleUrls: ['./pessoas-lista.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule
  ]
})
export class PessoasListaComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  pessoas: Pessoa[] = [];
  dataSource = new MatTableDataSource<Pessoa>([]);
  loading: boolean = true;
  error: string = '';
  searchTerm: string = '';
  displayedColumns: string[] = ['nome', 'documento', 'acoes'];

  constructor(
    private pessoaService: PessoaService,
    private router: Router,
    private notificationService: NotificationService,
    private spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef,
    private cobrancaService: CobrancaService
  ) {}

  ngOnInit(): void {
    this.loadPessoas();
    this.setupTable();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupTable(): void {
    // Configurar filtro customizado
    this.dataSource.filterPredicate = (data: Pessoa, filter: string) => {
      const searchString = filter.toLowerCase();
      return (
        data.nome?.toLowerCase().includes(searchString) ||
        data.documento?.toLowerCase().includes(searchString) ||
        data.codigo?.toString().includes(searchString) ||
        this.getStatusText(data.status).toLowerCase().includes(searchString)
      );
    };
  }

  loadPessoas(): void {
    this.loading = true;
    this.error = '';

    this.pessoaService.getPessoas().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        
        // Verificar se é array ou objeto
        let pessoas: Pessoa[] = [];
        
        if (Array.isArray(response)) {
          pessoas = response;
        } else if (response && typeof response === 'object' && 'data' in response) {
          pessoas = (response as any).data || [];
        } else if (response && typeof response === 'object' && 'pessoas' in response) {
          pessoas = (response as any).pessoas || [];
        } else {
          pessoas = [];
        }
        
        // Ordena por ordem de cadastro (menor código primeiro)
        const pessoasOrdenadas = pessoas.slice().sort((a, b) => {
          const codA = typeof a.codigo === 'string' ? parseInt(a.codigo) : a.codigo;
          const codB = typeof b.codigo === 'string' ? parseInt(b.codigo) : b.codigo;
          return codA - codB;
        });
        this.pessoas = pessoasOrdenadas;
        this.dataSource.data = pessoasOrdenadas;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.error = 'Erro ao carregar clientes. Tente novamente.';
        this.loading = false;
        this.cdr.markForCheck();
        this.notificationService.errorToast('Erro ao carregar lista de clientes');
      }
    });
  }

  novaPessoa(): void {
    this.router.navigate(['/pessoas/nova']);
  }

  editarPessoa(codigo: string | number | undefined): void {
    if (!codigo) {
      this.notificationService.error('Erro de Sistema', 'Código da pessoa não encontrado. Recarregue a página e tente novamente.');
      return;
    }
    this.router.navigate(['/pessoas/editar', codigo]);
  }

  editarPessoaAvancado(codigo: string | number | undefined): void {
    if (!codigo) {
      this.notificationService.error('Erro de Sistema', 'Código da pessoa não encontrado. Recarregue a página e tente novamente.');
      return;
    }
    this.router.navigate(['/pessoas/edit', codigo]);
  }

  deletarPessoa(codigo: string | number | undefined): void {
    if (!codigo) {
      this.notificationService.error('Erro', 'Código da pessoa não encontrado');
      return;
    }
    const id = typeof codigo === 'string' ? parseInt(codigo) : codigo;
    this.spinnerService.showFullScreen('Verificando cobranças...');
    this.cobrancaService.getCobrancas().pipe(takeUntil(this.destroy$)).subscribe({
      next: (cobrancas: any[]) => {
        const cobrancasAtivas = cobrancas.filter((c: any) => c.codigoPessoa === id && c.status === 1);
        if (cobrancasAtivas.length > 0) {
          this.spinnerService.hide();
          this.notificationService.error('Exclusão bloqueada', 'Este cliente possui cobranças ativas e não pode ser excluído.');
          return;
        }
        this.pessoaService.deletePessoa(id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.spinnerService.hide();
            this.notificationService.successToast('Cliente excluído com sucesso!');
            this.loadPessoas();
          },
          error: (error: any) => {
            this.spinnerService.hide();
            this.notificationService.error('Erro ao Excluir', 'Não foi possível excluir o cliente. Tente novamente.');
          }
        });
      },
      error: (error: any) => {
        this.spinnerService.hide();
        this.notificationService.error('Erro ao verificar cobranças', 'Não foi possível verificar cobranças do cliente. Tente novamente.');
      }
    });
  }

  getStatusText(status?: number): string {
    return status === 1 ? 'Ativo' : 'Inativo';
  }

  getStatusClass(status?: number): string {
    return status === 1 ? 'badge-success' : 'badge-secondary';
  }

  // Métodos para a tabela avançada
  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onRowClick(pessoa: Pessoa): void {
    // Navegar para detalhes ou edição simples ao clicar na linha
    this.editarPessoa(pessoa.codigo);
  }

  // Performance optimization: TrackBy function for ngFor
  trackByPessoa(index: number, pessoa: Pessoa): any {
    return pessoa.codigo || index;
  }

  // Método para alternar destaque
  toggleDestaque(pessoa: any): void {
    pessoa.destacado = !pessoa.destacado;
    
    // Reordenar array: pessoas destacadas primeiro
    this.pessoas.sort((a: any, b: any) => {
      if (a.destacado && !b.destacado) return -1;
      if (!a.destacado && b.destacado) return 1;
      return 0;
    });

    // Atualizar dataSource para a tabela desktop
    this.dataSource.data = [...this.pessoas];
    
    // Feedback para o usuário
    const acao = pessoa.destacado ? 'destacado' : 'removido do destaque';
    this.notificationService.successToast(`Cliente ${acao} com sucesso!`);
  }

  // Método para formatar nomes: primeira letra maiúscula, resto minúscula
  formatarNome(nome: string): string {
    if (!nome) return '';
    return nome.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

