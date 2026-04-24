// ...existing code...
import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CobrancaService } from '../../../services/cobranca.service';
import { PessoaService } from '../../../services/pessoa.service';
import { Cobranca, Pessoa } from '../../../models/api.models';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-cobrancas-lista',
  templateUrl: './cobrancas-lista.component.html',
  styleUrls: ['./cobrancas-lista.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    MatTooltipModule,
    MatTabsModule
  ]
})
export class CobrancasListaComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  selectedTabIndex = 0;
      get emDiaCobrancas(): Cobranca[] {
        return this.cobrancas.filter(c => c.status === 5);
      }

      get atrasadasCobrancas(): Cobranca[] {
        return this.cobrancas.filter(c => c.status === 3);
      }

      get venceHojeCobrancas(): Cobranca[] {
        return this.cobrancas.filter(c => c.status === 1);
      }
    finalizarCobranca(cobranca: Cobranca): void {
      if (!cobranca || !cobranca.codigo) {
        this.showErrorToast('Dados da cobrança não encontrados');
        return;
      }
      // Atualiza status para Pago e define dataPagamento
      cobranca.status = 2;
      cobranca.dataPagamento = new Date().toISOString().split('T')[0];
      // Monta apenas o objeto pessoaCobrancaHistorico para o endpoint de abater pagamento
      // Função utilitária para garantir formato yyyy-MM-dd
      const formatDate = (dateStr?: string) => {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        // Se já está no formato yyyy-MM-dd, retorna direto
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        // Se está no formato ISO, extrai só a data
        if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) return dateStr.split('T')[0];
        // Tenta converter para Date e extrair
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      const pessoaCobrancaHistorico = {
        codigo: 0,
        codigoCobranca: typeof cobranca.codigo === 'number' ? cobranca.codigo : 0,
        dataVencimento: formatDate(cobranca.dataVencimento),
        dataPagamento: formatDate(cobranca.dataPagamento),
        valorPagamento: cobranca.valor !== null && typeof cobranca.valor === 'number' ? cobranca.valor : 0,
        dataInicio: formatDate(cobranca.dataInicio)
      };
      // this.cobrancaService.abaterPagamento(cobranca.codigo, pessoaCobrancaHistorico).subscribe({
      //   next: () => {
      //     this.showSuccessToast('Cobrança finalizada com sucesso!');
      //     this.carregarCobrancas();
      //   },
      //   error: (error: any) => {
      //     let mensagem = 'Erro ao finalizar cobrança.';
      //     if (error?.error?.message) {
      //       mensagem = error.error.message;
      //     } else if (error?.status) {
      //       mensagem += ` (Código: ${error.status})`;
      //     }
      //     this.showErrorToast(mensagem);
      //   }
      // });
    }
  statusSortDirection: 'asc' | 'desc' = 'asc';

  sortByStatus(): void {
    const direction = this.statusSortDirection;
    this.dataSource.data = [...this.dataSource.data].sort((a, b) => {
      if (a.status === b.status) return 0;
      if (direction === 'asc') return (a.status ?? 0) - (b.status ?? 0);
      else return (b.status ?? 0) - (a.status ?? 0);
    });
    this.statusSortDirection = direction === 'asc' ? 'desc' : 'asc';
  }
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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      const tab = (data['tab'] as string) || '';
      if (tab === 'em-dia') this.selectedTabIndex = 0;
      else if (tab === 'devedor' || tab === 'atrasadas') this.selectedTabIndex = 1;
      else if (tab === 'vence-hoje') this.selectedTabIndex = 2;
    });
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
    this.loading = true;
    this.error = '';

    this.pessoaService.getPessoas().pipe(takeUntil(this.destroy$)).subscribe({
      next: (pessoas) => {
        this.pessoas = pessoas;
        this.carregarCobrancas();
      },
      error: () => {
        this.error = 'Erro ao carregar dados das pessoas';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  carregarCobrancas(): void {
    this.loading = true;
    this.error = '';

    // Estratégia: 4 chamadas em paralelo.
    // - getCobrancas() traz dados completos incluindo proximoVencimento, valorTotal, etc.
    // - Os 3 endpoints especializados calculam o status dinâmico no backend (baseado em datas).
    // Mescla por codigo: dados completos do getCobrancas() + status dinâmico dos especializados.
    Promise.all([
      this.cobrancaService.getCobrancas().toPromise(),
      this.cobrancaService.getAllEmDiaLista().toPromise(),
      this.cobrancaService.getAllAtrasadaLista().toPromise(),
      this.cobrancaService.getAllVenceHojeLista().toPromise()
    ]).then(([todas, emDia, atrasadas, venceHoje]) => {
      const toArr = (v: any) => Array.isArray(v) ? v : (v ? [v] : []);

      // Mapa de status dinâmico: codigo -> status (5, 3 ou 1)
      const statusMap = new Map<number, number>();
      toArr(emDia).forEach((c: any) => statusMap.set(c.codigo, 5));
      toArr(atrasadas).forEach((c: any) => statusMap.set(c.codigo, 3));
      toArr(venceHoje).forEach((c: any) => statusMap.set(c.codigo, 1));

      // Usa dados completos de getCobrancas(), filtra apenas os que têm status dinâmico
      const todasArray = toArr(todas);
      const todasCobrancas = todasArray
        .filter((c: any) => c && c.excluido !== true && statusMap.has(c.codigo))
        .map((c: any) => ({
          ...c,
          status: statusMap.get(c.codigo),
          pessoa: this.pessoas.find(p => p.codigo === c.codigoPessoa)
        }));

      this.cobrancas = todasCobrancas;
      this.dataSource.data = todasCobrancas;
      if (this.paginator) this.dataSource.paginator = this.paginator;
      if (this.sort) this.dataSource.sort = this.sort;
      this.loading = false;
      this.cdr.markForCheck();
    }).catch(error => {
      let mensagemErro = 'Erro ao carregar dados das cobranças';
      if (error?.status === 404) mensagemErro = 'Endpoint não encontrado. Verifique a configuração do servidor.';
      else if (error?.status === 401) mensagemErro = 'Não autorizado. Faça login novamente.';
      else if (error?.status === 500) mensagemErro = 'Erro no servidor. Tente novamente mais tarde.';
      this.error = mensagemErro;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  private resolverDataVencimento(c: any): string {
    // Campo principal retornado pelos endpoints de lista
    const proximo = c.proximoVencimento as string | null | undefined;
    if (proximo && !proximo.startsWith('0001-01-01')) return proximo;
    // Fallback: dataVencimento quando presente
    const raw = c.dataVencimento as string | null | undefined;
    if (raw && !raw.startsWith('0001-01-01')) return raw;
    // Último recurso: calcular pelo diaVencimento
    if (!c.diaVencimento) return '';
    const hoje = new Date();
    const data = new Date(hoje.getFullYear(), hoje.getMonth(), c.diaVencimento);
    return data.toISOString().split('T')[0];
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
    if (!cobranca || !cobranca.codigo) {
      this.showErrorToast('Dados da cobrança não encontrados. Recarregue a página e tente novamente.');
      return;
    }
    
    this.router.navigate(['/cobrancas/detalhes', cobranca.codigo]);
  }

  excluirCobranca(cobranca: Cobranca): void {
    if (!cobranca || !cobranca.codigo) {
      this.showErrorToast('Dados da cobrança não encontrados');
      return;
    }
    
    this.notification.confirmDelete('Excluir Cobrança', 'Tem certeza que deseja excluir esta cobrança? Esta ação não poderá ser desfeita.')
      .then((confirmed) => {
        if (confirmed) {
          this.cobrancaService.deleteCobranca(cobranca.codigo!).subscribe({
            next: () => {
              this.notification.successToast('Cobrança excluída com sucesso!');
              this.carregarCobrancas();
            },
            error: () => {
              this.notification.errorToast('Não foi possível excluir a cobrança. Tente novamente.');
            }
          });
        }
      });
  }

  getStatusText(status?: number): string {
    switch (status) {
      case 1: return 'Pendente'; // Dia do vencimento
      case 2: return 'Pago';
      case 3: return 'Atraso'; // Vencido
      case 4: return 'Cancelado';
      case 5: return 'Em dia'; // Antes do vencimento
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
    this.notification.successToast(message);
  }

  private showErrorToast(message: string): void {
    this.notification.errorToast(message);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

