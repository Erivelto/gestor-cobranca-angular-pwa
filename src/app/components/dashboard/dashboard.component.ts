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
  valorTotal: number = 0;
  loading: boolean = true;
  statsCols: number = 4;
  actionsCols: number = 4;

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
    // Breakpoints: mobile < 576, tablet < 1024
    if (width < 576) {
      this.statsCols = 1;
      this.actionsCols = 1;
    } else if (width < 1024) {
      this.statsCols = 2;
      this.actionsCols = 2;
    } else {
      this.statsCols = 4;
      this.actionsCols = 4;
    }
  }

  navegarPara(rota: string): void {
    this.router.navigate([rota]);
  }

  async refreshData(): Promise<void> {
    await this.loadDashboardData(true);
  }

  async loadDashboardData(isRefresh: boolean = false): Promise<void> {
    try {
      const spinnerConfig = isRefresh 
        ? { message: 'Atualizando...', overlay: false, fullScreen: false }
        : { message: 'Carregando dados do dashboard...', overlay: true };

      const result = await this.spinnerService.withSpinner(
        () => forkJoin([
          this.pessoaService.getPessoas(),
          this.cobrancaService.getCobrancas()
        ]).toPromise(),
        spinnerConfig
      );

      if (result) {
        const [pessoas, cobrancas] = result;

        // Processar dados das pessoas
        this.totalPessoas = pessoas.length;

        // Processar dados das cobranças
        this.totalCobrancas = cobrancas.length;
        
        // Separar por status (assumindo: 0=Em dia, 1=À vencer, 2=Devedor)
        const cobrancasEmDia = cobrancas.filter((c: Cobranca) => c.status === 0);
        const cobrancasAVencer = cobrancas.filter((c: Cobranca) => c.status === 1);
        const cobrancasDevedor = cobrancas.filter((c: Cobranca) => c.status === 2);
        
        // Calcular valores por status
        this.valorEmDia = cobrancasEmDia.reduce((sum: number, c: Cobranca) => sum + c.valor, 0);
        this.valorAVencer = cobrancasAVencer.reduce((sum: number, c: Cobranca) => sum + c.valor, 0);
        this.valorDevedor = cobrancasDevedor.reduce((sum: number, c: Cobranca) => sum + c.valor, 0);
        this.valorTotal = cobrancas.reduce((sum: number, c: Cobranca) => sum + c.valor, 0);

        // Configurar cards de estatísticas
        this.setupStatCards();
      }
      
      this.loading = false;
      this.cdr.markForCheck();

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
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
        title: 'Total de Pessoas',
        value: this.totalPessoas,
        icon: 'people',
        color: 'primary',
        subtitle: 'Pessoas cadastradas no sistema'
      },
      {
        title: 'Valor em Dia',
        value: `R$ ${this.valorEmDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        icon: 'check_circle',
        color: 'success',
        subtitle: 'Cobranças quitadas',
        progress: Math.round((this.valorEmDia / this.valorTotal) * 100)
      },
      {
        title: 'Valor à Vencer',
        value: `R$ ${this.valorAVencer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        icon: 'schedule',
        color: 'info',
        subtitle: 'Cobranças pendentes',
        progress: Math.round((this.valorAVencer / this.valorTotal) * 100)
      },
      {
        title: 'Valor Devedor',
        value: `R$ ${this.valorDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        icon: 'warning',
        color: 'warn',
        subtitle: 'Cobranças em atraso',
        progress: Math.round((this.valorDevedor / this.valorTotal) * 100)
      }
    ];
  }
}

