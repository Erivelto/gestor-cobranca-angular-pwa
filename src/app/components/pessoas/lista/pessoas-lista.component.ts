import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
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
import { PessoaService } from '../../../services/pessoa.service';
import { NotificationService } from '../../../services/notification.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Pessoa } from '../../../models/api.models';

@Component({
  selector: 'app-pessoas-lista',
  templateUrl: './pessoas-lista.component.html',
  styleUrls: ['./pessoas-lista.component.css'],
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
    MatTooltipModule
  ]
})
export class PessoasListaComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  pessoas: Pessoa[] = [];
  dataSource = new MatTableDataSource<Pessoa>([]);
  loading: boolean = true;
  error: string = '';
  searchTerm: string = '';
  displayedColumns: string[] = ['codigo', 'nome', 'documento', 'status', 'acoes'];

  constructor(
    private pessoaService: PessoaService,
    private router: Router,
    private notificationService: NotificationService,
    private spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef
  ) {}

  // Método de teste para debug da API
  testarAPI(): void {
    console.log('=== TESTE DIRETO DA API ===');
    this.pessoaService.getPessoas().subscribe({
      next: (response) => {
        console.log('Resposta direta da API:', response);
        console.log('Tipo da resposta:', typeof response);
        console.log('É array?', Array.isArray(response));
        if (Array.isArray(response) && response.length > 0) {
          console.log('Primeiro item:', response[0]);
          console.log('Propriedades do primeiro item:', Object.keys(response[0]));
        }
      },
      error: (error) => {
        console.error('Erro no teste da API:', error);
      }
    });
  }

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
    console.log('🚀 Iniciando loadPessoas()');
    this.loading = true;
    this.error = '';
    
    // Comentando o spinner por enquanto para debug
    // this.spinnerService.showOverlay('Carregando lista de clientes...');

    console.log('📞 Chamando pessoaService.getPessoas()');
    this.pessoaService.getPessoas().subscribe({
      next: (response) => {
        console.log('✅ Dados recebidos no componente:', response);
        console.log('📊 Tipo da resposta:', typeof response);
        console.log('📋 É array?', Array.isArray(response));
        console.log('📈 Quantidade de itens:', Array.isArray(response) ? response.length : 'N/A');
        
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
        
        console.log('🎯 Pessoas finais:', pessoas);
        console.log('🔢 Total de pessoas processadas:', pessoas.length);
        
        this.pessoas = pessoas;
        this.dataSource.data = pessoas;
        this.loading = false;
        console.log('🏁 Loading definido como false');
        
        // this.spinnerService.hide();
      },
      error: (error) => {
        console.error('❌ Erro no subscribe do componente:', error);
        this.error = 'Erro ao carregar clientes. Tente novamente.';
        this.loading = false;
        // this.spinnerService.hide();
        this.notificationService.errorToast('Erro ao carregar lista de clientes');
      }
    });
  }

  novaPessoa(): void {
    this.router.navigate(['/pessoas/nova']);
  }

  editarPessoa(codigo: string | number | undefined): void {
    console.log('=== MÉTODO EDITAR PESSOA SIMPLES CHAMADO ===');
    console.log('Código recebido:', codigo);
    console.log('Tipo do código:', typeof codigo);
    console.log('Router disponível:', !!this.router);
    
    if (!codigo) {
      console.error('Código não fornecido ou inválido');
      this.notificationService.error('Erro de Sistema', 'Código da pessoa não encontrado. Recarregue a página e tente novamente.');
      return;
    }
    
    console.log('Navegando para:', ['/pessoas/editar', codigo]);
    
    try {
      this.router.navigate(['/pessoas/editar', codigo]).then(
        (success) => {
          console.log('Navegação bem-sucedida:', success);
        },
        (error) => {
          console.error('Erro na promise de navegação:', error);
        }
      );
    } catch (error) {
      console.error('Erro na navegação:', error);
    }
  }

  editarPessoaAvancado(codigo: string | number | undefined): void {
    console.log('=== MÉTODO EDITAR PESSOA AVANÇADO CHAMADO ===');
    console.log('Código recebido:', codigo);
    console.log('Tipo do código:', typeof codigo);
    console.log('Router disponível:', !!this.router);
    
    if (!codigo) {
      console.error('Código não fornecido ou inválido');
      this.notificationService.error('Erro de Sistema', 'Código da pessoa não encontrado. Recarregue a página e tente novamente.');
      return;
    }
    
    console.log('Navegando para:', ['/pessoas/edit', codigo]);
    
    try {
      this.router.navigate(['/pessoas/edit', codigo]).then(
        (success) => {
          console.log('Navegação bem-sucedida:', success);
        },
        (error) => {
          console.error('Erro na promise de navegação:', error);
        }
      );
    } catch (error) {
      console.error('Erro na navegação:', error);
    }
  }

  deletarPessoa(codigo: string | number | undefined): void {
    if (!codigo) {
      this.notificationService.error('Erro', 'Código da pessoa não encontrado');
      return;
    }
    
    // Converter para number se necessário
    const id = typeof codigo === 'string' ? parseInt(codigo) : codigo;
    
    this.notificationService.confirmDelete(
      'Excluir Cliente',
      'Tem certeza que deseja excluir este cliente? Esta ação não poderá ser desfeita.'
    ).then((result) => {
      if (result.isConfirmed) {
        this.spinnerService.showFullScreen('Excluindo cliente...');
        
        this.pessoaService.deletePessoa(id).subscribe({
          next: () => {
            this.spinnerService.hide();
            this.notificationService.successToast('Cliente excluído com sucesso!');
            this.loadPessoas();
          },
          error: (error) => {
            console.error('Erro ao excluir pessoa:', error);
            this.spinnerService.hide();
            this.notificationService.error('Erro ao Excluir', 'Não foi possível excluir o cliente. Tente novamente.');
          }
        });
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
}

