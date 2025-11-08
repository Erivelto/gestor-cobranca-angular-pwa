import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { PessoaService } from '../../services/pessoa.service';
import { CobrancaService } from '../../services/cobranca.service';
import { Pessoa, Cobranca } from '../../models/api.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  totalPessoas: number = 0;
  totalCobrancas: number = 0;
  cobrancasPendentes: number = 0;
  valorTotal: number = 0;
  loading: boolean = true;
  statsCols: number = 4;
  actionsCols: number = 4;

  constructor(
    private pessoaService: PessoaService,
    private cobrancaService: CobrancaService,
    private router: Router
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

  loadDashboardData(): void {
    this.loading = true;

    // Carregar pessoas
    this.pessoaService.getPessoas().subscribe({
      next: (pessoas: Pessoa[]) => {
        this.totalPessoas = pessoas.length;
      },
      error: (error) => {
        console.error('Erro ao carregar pessoas:', error);
      }
    });

    // Carregar cobranças
    this.cobrancaService.getCobrancas().subscribe({
      next: (cobrancas: Cobranca[]) => {
        this.totalCobrancas = cobrancas.length;
        this.cobrancasPendentes = cobrancas.filter(c => c.status === 0 || c.status === 1).length;
        this.valorTotal = cobrancas.reduce((sum, c) => sum + c.valor, 0);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cobranças:', error);
        this.loading = false;
      }
    });
  }
}

