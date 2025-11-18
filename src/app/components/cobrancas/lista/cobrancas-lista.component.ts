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
import { PessoaService } from '../../../services/pessoa.service';
import { Cobranca, Pessoa } from '../../../models/api.models';
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
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort!: MatSort;

  cobrancas: Cobranca[] = [];
  pessoas: Pessoa[] = [];
  dataSource = new MatTableDataSource<Cobranca>([]);
  loading: boolean = true;
  error: string = '';
  searchTerm: string = '';
  displayedColumns: string[] = ['nome', 'status', 'acoes'];

  constructor(
    private cobrancaService: CobrancaService,
    private pessoaService: PessoaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPessoas();
    this.setupTable();
  }

  ngAfterViewInit(): void {
    // Conectar paginator e sort após a view estar inicializada
    this.dataSource.paginator = this.paginator!;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }

  private setupTable(): void {
    // Filtro customizado: busca pelo nome da pessoa associada à cobrança
    this.dataSource.filterPredicate = (data: Cobranca, filter: string) => {
      const searchString = filter.toLowerCase();
      // Busca pelo nome da pessoa associada
      const pessoaNome = this.pessoas.find(p => p.codigo === data.codigoPessoa)?.nome?.toLowerCase() || '';
      return pessoaNome.includes(searchString);
    };
  }

  carregarPessoas(): void {
    console.log('🚀 Iniciando carregarPessoas()');
    this.loading = true;
    this.error = '';

    this.pessoaService.getPessoas().subscribe({
      next: (pessoas) => {
        console.log('✅ Pessoas carregadas da API:', pessoas);
        this.pessoas = pessoas;
        this.carregarCobrancas();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar pessoas:', error);
        this.error = 'Erro ao carregar dados das pessoas';
        this.loading = false;
      }
    });
  }

  carregarCobrancas(): void {
    console.log('🚀 Iniciando carregarCobrancas()');
    
    // Dados mocados de cobranças com referência às pessoas reais
    const cobrancasMocadas: Cobranca[] = [];
    // Criar mais cobranças para testar a paginação
    this.pessoas.forEach((pessoa, index) => {
      // Criar 2-3 cobranças por pessoa para ter dados suficientes para paginação
      const numCobrancas = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numCobrancas; i++) {
        const cobrancaId = (index * 3) + i + 1;
        const cobranca: Cobranca & { pessoa?: Pessoa } = {
          codigo: cobrancaId,
          codigoPessoa: pessoa.codigo,
          tipoCobranca: 'Mensalidade',
          valor: this.gerarValorAleatorio(),
          juros: Math.floor(Math.random() * 10),
          dataVencimento: this.gerarDataVencimento(cobrancaId),
          dataPagamento: null,
          status: this.gerarStatusAleatorio(cobrancaId),
          excluido: false,
          pessoa: pessoa
        };
        // Adicionar data de pagamento se status for pago
        if (cobranca.status === 2) {
          cobranca.dataPagamento = this.gerarDataPagamento();
        }
        cobrancasMocadas.push(cobranca);
      }
    });
    console.log('🎯 Cobranças criadas com pessoas da API:', cobrancasMocadas);
    this.cobrancas = cobrancasMocadas;
    this.dataSource.data = cobrancasMocadas;
    // Reconectar paginator após atualizar os dados
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    this.cdr.detectChanges();
    this.loading = false;
    console.log('🏁 Loading definido como false, total de cobranças:', cobrancasMocadas.length);
  }

  private gerarDescricaoAleatoria(index: number): string {
    const descricoes = [
      'Empréstimo para capital de giro',
      'Financiamento de equipamentos',
      'Crédito pessoal para investimento',
      'Empréstimo para expansão do negócio',
      'Antecipação de recebíveis'
    ];
    return descricoes[index % descricoes.length];
  }

  private gerarValorAleatorio(): number {
    const valores = [1500.00, 2500.00, 5000.00, 3200.00, 7800.00, 1200.00, 4500.00];
    return valores[Math.floor(Math.random() * valores.length)];
  }

  private gerarDataVencimento(index: number): string {
    const datas = [
      '2024-12-31',
      '2024-11-30',
      '2024-10-15',
      '2025-01-15',
      '2024-12-15'
    ];
    return datas[index % datas.length];
  }

  private gerarStatusAleatorio(index: number): number {
    const statuses = [1, 2, 3, 1, 1]; // 1=Pendente, 2=Pago, 3=Vencido
    return statuses[index % statuses.length];
  }

  private gerarDataPagamento(): string {
    const hoje = new Date();
    const diasAtras = Math.floor(Math.random() * 30);
    const dataPagamento = new Date(hoje.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
    return dataPagamento.toISOString().split('T')[0];
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

