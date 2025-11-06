import { Component, OnInit } from '@angular/core';
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

  constructor(
    private pessoaService: PessoaService,
    private cobrancaService: CobrancaService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
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

