import { Component, OnInit, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PessoaService } from '../../services/pessoa.service';
import { CobrancaService } from '../../services/cobranca.service';
import { NotificationService } from '../../services/notification.service';
import { SpinnerService } from '../../services/spinner.service';
import { Pessoa, Cobranca } from '../../models/api.models';
import { forkJoin } from 'rxjs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface StatCardData {
  title: string;
  value: number | string;
  icon: string;
  color: 'primary' | 'accent' | 'warn' | 'success' | 'info';
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  progress?: number;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  totalPessoas: number = 0;
  totalCobrancas: number = 0;
  valorEmDia: number = 0;
  valorAVencer: number = 0;
  valorDevedor: number = 0;
  valorJuros: number = 0;
  valorTotal: number = 0;
  loading: boolean = true;
  statsCols: number = 4;
  actionsCols: number = 4;
  rowHeight: string = '200px';

  statCards: StatCardData[] = [];

  constructor(
    private pessoaService: PessoaService,
    private cobrancaService: CobrancaService,
    private notificationService: NotificationService,
    private spinnerService: SpinnerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setCols(window.innerWidth);
    this.loadDashboardData();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setCols(event.target.innerWidth);
  }

  private setCols(width: number) {
    // Breakpoints otimizados para legibilidade em diferentes resoluções
    if (width < 375) {
      // Telas muito pequenas: 1 coluna para máxima legibilidade
      this.statsCols = 1;
      this.actionsCols = 1;
      this.rowHeight = '140px'; // Cards mais baixos para economizar espaço
    } else if (width < 390) {
      // iPhone 6/7/8, iPhone X/XS/11 Pro (375px): 2 colunas otimizadas para legibilidade
      this.statsCols = 2;
      this.actionsCols = 2;
      this.rowHeight = '170px'; // Altura maior para melhor legibilidade em 375px
    } else if (width < 400) {
      // iPhone 12 mini e similares (390px): 2 colunas otimizadas
      this.statsCols = 2;
      this.actionsCols = 2;
      this.rowHeight = '160px'; // Altura otimizada para 390px
    } else if (width < 480) {
      // Mobile médio (incluindo 412px): 2 colunas com altura otimizada
      this.statsCols = 2;
      this.actionsCols = 2;
      this.rowHeight = '170px'; // Altura maior para melhor legibilidade
    } else if (width < 768) {
      // Mobile: 2 colunas com cards compactos
      this.statsCols = 2;
      this.actionsCols = 2;
      this.rowHeight = '160px'; // Cards compactos no mobile
    } else if (width < 1024) {
      // Tablet: 3 colunas
      this.statsCols = 3;
      this.actionsCols = 2;
      this.rowHeight = '180px'; // Altura intermediária
    } else {
      // Desktop: 4 colunas
      this.statsCols = 4;
      this.actionsCols = 4;
      this.rowHeight = '200px'; // Altura padrão
    }
  }

  navegarPara(rota: string): void {
    this.router.navigate([rota]);
  }

  navegarParaStatus(status: 'em-dia' | 'vence-hoje' | 'devedor'): void {
    if (status === 'em-dia') {
      this.navegarPara('/cobrancas/em-dia');
      return;
    }
    if (status === 'vence-hoje') {
      this.navegarPara('/cobrancas/vence-hoje');
      return;
    }
    if (status === 'devedor') {
      this.navegarPara('/cobrancas/devedor');
    }
  }

  async refreshData(): Promise<void> {
    await this.loadDashboardData(true);
  }

  async loadDashboardData(isRefresh: boolean = false): Promise<void> {
    try {
      const spinnerConfig = isRefresh 
        ? { message: 'Atualizando...', overlay: false, fullScreen: false }
        : { message: 'Carregando dados do dashboard...', overlay: true };

      // Fazer requisições para todos os dados específicos da API
      const result = await this.spinnerService.withSpinner(
        () => forkJoin([
          this.pessoaService.getPessoas(),
          this.cobrancaService.getAllEmDia(),
          this.cobrancaService.getAllAtrasado(),
          this.cobrancaService.getAllVenceHoje(),
          this.cobrancaService.getAllJuros()
        ]).toPromise(),
        spinnerConfig
      );

      if (result) {
        const [pessoas, emDiaValor, atrasadoValor, venceHojeValor, jurosValor] = result;

        // Processar dados das pessoas
        this.totalPessoas = Array.isArray(pessoas) ? pessoas.length : 0;

        // API retorna somente o valor (double) para cada status
        this.valorEmDia = Number(emDiaValor) || 0;
        this.valorDevedor = Number(atrasadoValor) || 0;
        this.valorAVencer = Number(venceHojeValor) || 0;
        this.valorJuros = Number(jurosValor) || 0;
        this.valorTotal = this.valorEmDia + this.valorAVencer + this.valorDevedor;

        // Sem contagem individual de cobranças nesses endpoints
        this.totalCobrancas = 0;

        console.log('📊 Dados do Dashboard carregados da API (totais):');
        console.log('   - Em Dia (R$):', this.valorEmDia);
        console.log('   - Vence Hoje (R$):', this.valorAVencer);
        console.log('   - Devedor (Atrasadas) (R$):', this.valorDevedor);
        console.log('   - Juros (R$):', this.valorJuros);
        console.log('   - Total (R$):', this.valorTotal);

        // Configurar cards de estatísticas
        this.setupStatCards();
      }
      
      this.loading = false;
      this.cdr.markForCheck();

    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
      this.notificationService.error(
        'Erro de Carregamento', 
        'Não foi possível carregar os dados do dashboard. Tente recarregar a página.'
      );
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  private setupStatCards(): void {
    this.statCards = [
      {
        title: 'Total de Clientes',
        value: this.totalPessoas,
        icon: 'people',
        color: 'primary',
        subtitle: 'Clientes cadastrados no sistema'
      },
      {
        title: 'Em Dia',
        value: `R$ ${this.valorEmDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        icon: 'check_circle',
        color: 'success',
        subtitle: 'Cobranças quitadas',
        progress: this.valorTotal ? Math.round((this.valorEmDia / this.valorTotal) * 100) : 0
      },
      {
        title: 'Vence Hoje',
        value: `R$ ${this.valorAVencer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        icon: 'schedule',
        color: 'info',
        subtitle: 'Cobranças pendentes',
        progress: this.valorTotal ? Math.round((this.valorAVencer / this.valorTotal) * 100) : 0
      },
      {
        title: 'Devedor',
        value: `R$ ${this.valorDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        icon: 'warning',
        color: 'warn',
        subtitle: 'Cobranças em atraso',
        progress: this.valorTotal ? Math.round((this.valorDevedor / this.valorTotal) * 100) : 0
      },
      {
        title: 'Valor Juros',
        value: `R$ ${this.valorJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        icon: 'trending_up',
        color: 'accent',
        subtitle: 'Juros acumulados'
      }
    ];
  }
}

