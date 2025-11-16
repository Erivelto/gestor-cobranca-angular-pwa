import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-cobranca-detalhes',
  templateUrl: './cobranca-detalhes.component.html',
  styleUrls: ['./cobranca-detalhes.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ]
})
export class CobrancaDetalhesComponent implements OnInit {
  loading: boolean = true;
  cobrancaId: number = 0;
  
  // Dados mocados da cobrança
  cobrancaDetalhes = {
    id: 1,
    cliente: {
      nome: 'João Silva',
      documento: '123.456.789-00'
    },
    valorEmprestimo: 5000.00,
    taxaJuros: 2.5,
    valorJuros: 125.00,
    valorTotal: 5125.00,
    dataEmprestimo: new Date('2024-01-15'),
    dataVencimento: new Date('2024-12-15'),
    status: 'ativo'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Simular carregamento
    this.route.params.subscribe(params => {
      this.cobrancaId = +params['id'] || 1;
      this.carregarDetalhes();
    });
  }

  carregarDetalhes(): void {
    this.loading = true;
    
    // Simular dados mocados baseado no ID
    setTimeout(() => {
      this.cobrancaDetalhes = this.gerarDadosMocados(this.cobrancaId);
      this.loading = false;
    }, 1000);
  }

  private gerarDadosMocados(id: number): any {
    const clientes = [
      { nome: 'João Silva', documento: '123.456.789-00' },
      { nome: 'Maria Santos', documento: '987.654.321-00' },
      { nome: 'Pedro Costa', documento: '456.789.123-00' }
    ];
    
    const valores = [5000, 2500, 7500];
    const taxas = [2.5, 3.0, 1.8];
    
    const clienteIndex = (id - 1) % clientes.length;
    const valorEmprestimo = valores[clienteIndex];
    const taxaJuros = taxas[clienteIndex];
    const valorJuros = valorEmprestimo * (taxaJuros / 100);
    const valorTotal = valorEmprestimo + valorJuros;
    
    return {
      id: id,
      cliente: clientes[clienteIndex],
      valorEmprestimo: valorEmprestimo,
      taxaJuros: taxaJuros,
      valorJuros: valorJuros,
      valorTotal: valorTotal,
      dataEmprestimo: new Date('2024-01-15'),
      dataVencimento: new Date('2024-12-15'),
      status: id === 2 ? 'vencido' : 'ativo'
    };
  }

  voltarLista(): void {
    this.router.navigate(['/cobrancas']);
  }

  getStatusColor(): string {
    switch (this.cobrancaDetalhes.status) {
      case 'ativo': return 'primary';
      case 'vencido': return 'warn';
      case 'quitado': return 'accent';
      default: return '';
    }
  }

  getStatusText(): string {
    switch (this.cobrancaDetalhes.status) {
      case 'ativo': return 'Ativo';
      case 'vencido': return 'Vencido';
      case 'quitado': return 'Quitado';
      default: return 'Indefinido';
    }
  }
}