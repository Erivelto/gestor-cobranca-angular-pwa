import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-cobranca-detalhes',
  templateUrl: './cobranca-detalhes.component.html',
  styleUrls: ['./cobranca-detalhes.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatExpansionModule
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
    valorPagamento: 0,
    valorTotal: 5125.00,
    dataEmprestimo: new Date('2024-01-15'),
    dataVencimento: new Date('2024-12-15'),
    status: 'ativo'
  };

  // Histórico de pagamentos
  historicoPagamentos: { valor: number, data: Date }[] = [];
  dataSource = new MatTableDataSource(this.historicoPagamentos);
  displayedColumns: string[] = ['data', 'valor'];
  
  // Campo formatado para exibição
  valorPagamentoFormatado: string = '0,00';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Simular carregamento
    this.route.params.subscribe(params => {
      const novoId = +params['id'] || 1;
      
      // Resetar histórico apenas se mudou de cobrança
      if (this.cobrancaId !== novoId) {
        this.historicoPagamentos = [];
        this.dataSource.data = this.historicoPagamentos;
      }
      
      this.cobrancaId = novoId;
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
    
    const dadosMocados = {
      id: id,
      cliente: clientes[clienteIndex],
      valorEmprestimo: valorEmprestimo,
      taxaJuros: taxaJuros,
      valorJuros: valorJuros,
      valorPagamento: 0,
      valorTotal: valorTotal,
      dataEmprestimo: new Date('2024-01-15'),
      dataVencimento: new Date('2024-12-15'),
      status: id === 2 ? 'vencido' : 'ativo'
    };

    return dadosMocados;
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

  // Métodos para máscara de moeda
  onValorPagamentoInput(event: any): void {
    const input = event.target;
    let valor = input.value;
    
    // Remove tudo que não for número
    valor = valor.replace(/\D/g, '');
    
    // Converte para número e divide por 100 para ter os centavos
    const numeroValor = parseInt(valor || '0') / 100;
    
    // Atualiza o valor numérico no modelo
    this.cobrancaDetalhes.valorPagamento = numeroValor;
    
    // Formata para exibição
    this.valorPagamentoFormatado = this.formatarMoeda(numeroValor);
    
    // Atualiza o input
    input.value = this.valorPagamentoFormatado;
  }

  onValorPagamentoFocus(event: any): void {
    const input = event.target;
    if (this.cobrancaDetalhes.valorPagamento === 0) {
      input.value = '';
    }
  }

  onValorPagamentoBlur(event: any): void {
    const input = event.target;
    if (input.value === '') {
      this.cobrancaDetalhes.valorPagamento = 0;
      this.valorPagamentoFormatado = '0,00';
      input.value = this.valorPagamentoFormatado;
    }
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  abaterPagamento(): void {
    if (this.cobrancaDetalhes.valorPagamento <= 0) {
      Swal.fire({
        title: 'Valor Inválido',
        text: 'Informe um valor válido para o pagamento.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    if (this.cobrancaDetalhes.valorPagamento > this.cobrancaDetalhes.valorTotal) {
      Swal.fire({
        title: 'Valor Excedente',
        text: 'O valor do pagamento não pode ser maior que o valor total.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    // Confirmar o pagamento
    Swal.fire({
      title: 'Confirmar Pagamento',
      text: `Deseja abater R$ ${this.formatarMoeda(this.cobrancaDetalhes.valorPagamento)} do empréstimo?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, Abater',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#f44336'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processarPagamento();
      }
    });
  }

  private processarPagamento(): void {
    // Armazenar o valor do pagamento antes de resetar
    const valorPago = this.cobrancaDetalhes.valorPagamento;

    // Adicionar ao histórico de pagamentos
    this.historicoPagamentos.push({
      valor: valorPago,
      data: new Date()
    });

    // Atualizar o dataSource da tabela
    this.dataSource.data = [...this.historicoPagamentos];

    // Lógica para abater o pagamento
    this.cobrancaDetalhes.valorTotal -= valorPago;
    
    // Resetar o campo de pagamento
    this.cobrancaDetalhes.valorPagamento = 0;
    this.valorPagamentoFormatado = '0,00';

    // Verificar se foi quitado
    if (this.cobrancaDetalhes.valorTotal <= 0) {
      this.cobrancaDetalhes.status = 'quitado';
      Swal.fire({
        title: 'Empréstimo Quitado!',
        text: 'Parabéns! O empréstimo foi quitado com sucesso.',
        icon: 'success',
        confirmButtonText: 'Ótimo!',
        confirmButtonColor: '#4caf50'
      });
    } else {
      Swal.fire({
        title: 'Pagamento Realizado!',
        text: `Pagamento de R$ ${this.formatarMoeda(valorPago)} abatido com sucesso!`,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#4caf50',
        timer: 3000,
        timerProgressBar: true
      });
    }
  }
}