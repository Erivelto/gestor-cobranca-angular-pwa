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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CobrancaService } from '../../../services/cobranca.service';
import { PessoaService } from '../../../services/pessoa.service';
import { Cobranca, Pessoa } from '../../../models/api.models';
import { NotificationService } from '../../../services/notification.service';
import { BrlCurrencyPipe } from '../../../pipes/brl-currency.pipe';
import { TitleCasePtPipe } from '../../../pipes/title-case.pipe';

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
    MatTabsModule,
    MatProgressBarModule,
    BrlCurrencyPipe,
    TitleCasePtPipe
  ]
})
export class CobrancasListaComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  selectedTabIndex = 0;

  @ViewChild('paginatorEmDia') paginatorEmDia!: MatPaginator;
  @ViewChild('paginatorAtrasadas') paginatorAtrasadas!: MatPaginator;
  @ViewChild('paginatorVenceHoje') paginatorVenceHoje!: MatPaginator;
  @ViewChild('sortEmDia') sortEmDia!: MatSort;
  @ViewChild('sortAtrasadas') sortAtrasadas!: MatSort;
  @ViewChild('sortVenceHoje') sortVenceHoje!: MatSort;

  cobrancas: Cobranca[] = [];
  pessoas: Pessoa[] = [];
  dataSourceEmDia = new MatTableDataSource<Cobranca>([]);
  dataSourceAtrasadas = new MatTableDataSource<Cobranca>([]);
  dataSourceVenceHoje = new MatTableDataSource<Cobranca>([]);
  searchEmDia = '';
  searchAtrasadas = '';
  searchVenceHoje = '';
  loading: boolean = true;
  error: string = '';

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
    this.dataSourceEmDia.paginator = this.paginatorEmDia;
    this.dataSourceEmDia.sort = this.sortEmDia;
    this.dataSourceAtrasadas.paginator = this.paginatorAtrasadas;
    this.dataSourceAtrasadas.sort = this.sortAtrasadas;
    this.dataSourceVenceHoje.paginator = this.paginatorVenceHoje;
    this.dataSourceVenceHoje.sort = this.sortVenceHoje;
    this.cdr.detectChanges();
  }

  private setupTable(): void {
    const predicate = (data: Cobranca, filter: string) => {
      const pessoaNome = this.pessoas.find(p => p.codigo === data.codigoPessoa)?.nome?.toLowerCase() || '';
      return pessoaNome.includes(filter);
    };
    this.dataSourceEmDia.filterPredicate = predicate;
    this.dataSourceAtrasadas.filterPredicate = predicate;
    this.dataSourceVenceHoje.filterPredicate = predicate;
  }

  applyFilterEmDia(): void {
    this.dataSourceEmDia.filter = this.searchEmDia.trim().toLowerCase();
    if (this.dataSourceEmDia.paginator) this.dataSourceEmDia.paginator.firstPage();
  }

  applyFilterAtrasadas(): void {
    this.dataSourceAtrasadas.filter = this.searchAtrasadas.trim().toLowerCase();
    if (this.dataSourceAtrasadas.paginator) this.dataSourceAtrasadas.paginator.firstPage();
  }

  applyFilterVenceHoje(): void {
    this.dataSourceVenceHoje.filter = this.searchVenceHoje.trim().toLowerCase();
    if (this.dataSourceVenceHoje.paginator) this.dataSourceVenceHoje.paginator.firstPage();
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
    forkJoin([
      this.cobrancaService.getCobrancas(),
      this.cobrancaService.getAllEmDiaLista(),
      this.cobrancaService.getAllAtrasadaLista(),
      this.cobrancaService.getAllVenceHojeLista()
    ]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([todas, emDia, atrasadas, venceHoje]) => {
        const toArr = (v: Cobranca[] | Cobranca | null | undefined) => Array.isArray(v) ? v : (v ? [v] : []);

        // Mapa de status dinâmico: codigo -> status (5, 3 ou 1)
        const statusMap = new Map<number, number>();
        toArr(emDia).forEach((c) => statusMap.set(c.codigo, 5));
        toArr(atrasadas).forEach((c) => statusMap.set(c.codigo, 3));
        toArr(venceHoje).forEach((c) => statusMap.set(c.codigo, 1));

        // Usa dados completos de getCobrancas(), filtra apenas os que têm status dinâmico
        const todasArray = toArr(todas);
        const todasCobrancas = todasArray
          .filter((c) => c && c.excluido !== true && statusMap.has(c.codigo))
          .map((c) => ({
            ...c,
            status: statusMap.get(c.codigo)!,
            pessoa: this.pessoas.find(p => p.codigo === c.codigoPessoa)
          }));

        this.cobrancas = todasCobrancas;
        this.dataSourceEmDia.data = todasCobrancas.filter(c => c.status === 5);
        this.dataSourceAtrasadas.data = todasCobrancas.filter(c => c.status === 3);
        this.dataSourceVenceHoje.data = todasCobrancas.filter(c => c.status === 1);
        if (this.paginatorEmDia) this.dataSourceEmDia.paginator = this.paginatorEmDia;
        if (this.sortEmDia) this.dataSourceEmDia.sort = this.sortEmDia;
        if (this.paginatorAtrasadas) this.dataSourceAtrasadas.paginator = this.paginatorAtrasadas;
        if (this.sortAtrasadas) this.dataSourceAtrasadas.sort = this.sortAtrasadas;
        if (this.paginatorVenceHoje) this.dataSourceVenceHoje.paginator = this.paginatorVenceHoje;
        if (this.sortVenceHoje) this.dataSourceVenceHoje.sort = this.sortVenceHoje;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        let mensagemErro = 'Erro ao carregar dados das cobranças';
        if (error?.status === 404) mensagemErro = 'Endpoint não encontrado. Verifique a configuração do servidor.';
        else if (error?.status === 401) mensagemErro = 'Não autorizado. Faça login novamente.';
        else if (error?.status === 500) mensagemErro = 'Erro no servidor. Tente novamente mais tarde.';
        this.error = mensagemErro;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
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
          this.cobrancaService.deleteCobranca(cobranca.codigo!).pipe(takeUntil(this.destroy$)).subscribe({
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

  onRowClick(cobranca: Cobranca): void {
    // Navegar para detalhes ou edição ao clicar na linha
    this.editarCobranca(cobranca);
  }

  // Performance optimization: TrackBy function for ngFor
  trackByCobranca(index: number, cobranca: Cobranca): number {
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

