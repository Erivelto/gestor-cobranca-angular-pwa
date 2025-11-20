import { CobrancaService } from '../../../services/cobranca.service';
import { PessoaService } from '../../../services/pessoa.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogMessageComponent } from '../../shared/dialog-message.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MatListModule } from '@angular/material/list';

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
    MatExpansionModule,
    MatListModule
  ]
})
export class CobrancaDetalhesComponent implements OnInit {
    finalizarCobranca(): void {
      if (!this.cobrancaDetalhes || !this.cobrancaDetalhes.codigo) {
        this.dialog.open(DialogMessageComponent, {
          data: {
            title: 'Erro',
            message: 'Dados da cobrança não encontrados.'
          }
        });
        return;
      }
      // Atualiza status para Pago e define dataPagamento
      this.cobrancaDetalhes.status = 2;
      this.cobrancaDetalhes.dataPagamento = new Date().toISOString().split('T')[0];
      this.cobrancaService.updateCobranca(this.cobrancaDetalhes.codigo, this.cobrancaDetalhes).subscribe({
        next: () => {
          this.dialog.open(DialogMessageComponent, {
            data: {
              title: 'Cobrança Finalizada',
              message: 'Cobrança marcada como paga com sucesso!'
            }
          });
          this.carregarDetalhes();
        },
        error: (error: any) => {
          console.error('Erro ao finalizar cobrança:', error);
          this.dialog.open(DialogMessageComponent, {
            data: {
              title: 'Erro',
              message: 'Não foi possível finalizar a cobrança. Tente novamente.'
            }
          });
        }
      });
    }
  // ...existing code...

  pessoaDetalhes: any = null;
  loading: boolean = true;
  cobrancaId: number = 0;
  
  cobrancaDetalhes: any = null;

  // Histórico de pagamentos
  historicoPagamentos: { valor: number, data: Date }[] = [];
  dataSource = new MatTableDataSource(this.historicoPagamentos);
  displayedColumns: string[] = ['data', 'valor'];
  
  // Campo formatado para exibição
  valorPagamentoFormatado: string = '0,00';

  getStatusClass(status?: string | number): string {
    // Permite status como string ou número para padronizar
    if (typeof status === 'number') {
      switch (status) {
        case 1: return 'badge-warning';
        case 2: return 'badge-success';
        case 3: return 'badge-danger';
        case 4: return 'badge-secondary';
        default: return 'badge-secondary';
      }
    } else {
      switch (status) {
        case 'ativo': return 'badge-success';
        case 'vencido': return 'badge-danger';
        case 'quitado': return 'badge-warning';
        default: return 'badge-secondary';
      }
    }
  }

  getStatusText(status?: string | number): string {
    if (typeof status === 'number') {
      switch (status) {
        case 1: return 'Pendente';
        case 2: return 'Pago';
        case 3: return 'Vencido';
        case 4: return 'Cancelado';
        default: return 'Indefinido';
      }
    } else {
      switch (status) {
        case 'ativo': return 'Ativo';
        case 'vencido': return 'Vencido';
        case 'quitado': return 'Quitado';
        default: return 'Indefinido';
      }
    }
  }
  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private cobrancaService: CobrancaService,
  private pessoaService: PessoaService,
  private dialog: MatDialog
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
  this.cobrancaService.getCobrancaById(this.cobrancaId).subscribe({
    next: (cobranca) => {
      this.cobrancaDetalhes = cobranca;
      console.log('[COBRANCA] Detalhes recebidos:', cobranca);
      if (cobranca && cobranca.codigoPessoa) {
        console.log('[COBRANCA] codigoPessoa:', cobranca.codigoPessoa);
        this.pessoaService.getPessoaById(cobranca.codigoPessoa).subscribe({
          next: (pessoa) => {
            console.log('[PESSOA] Detalhes recebidos:', pessoa);
            this.pessoaDetalhes = pessoa;
            this.loading = false;
          },
          error: (error) => {
            console.error('[PESSOA] Erro ao buscar detalhes da pessoa:', error);
            this.loading = false;
          }
        });
      } else {
        console.warn('[COBRANCA] codigoPessoa não encontrado ou nulo:', cobranca);
        this.loading = false;
      }
    },
    error: (error) => {
      console.error('[COBRANCA] Erro ao buscar detalhes da cobrança:', error);
      this.loading = false;
    }
  });
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
      this.dialog.open(DialogMessageComponent, {
        data: {
          title: 'Valor Inválido',
          message: 'Informe um valor válido para o pagamento.'
        }
      });
      return;
    }

    if (this.cobrancaDetalhes.valorPagamento > this.cobrancaDetalhes.valorTotal) {
      this.dialog.open(DialogMessageComponent, {
        data: {
          title: 'Valor Excedente',
          message: 'O valor do pagamento não pode ser maior que o valor total.'
        }
      });
      return;
    }

    // Confirmar o pagamento
    const dialogRef = this.dialog.open(DialogMessageComponent, {
      data: {
        title: 'Confirmar Pagamento',
        message: `Deseja abater R$ ${this.formatarMoeda(this.cobrancaDetalhes.valorPagamento)} do empréstimo?`
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Se o usuário clicar em OK, processa o pagamento
      if (result) {
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
      this.dialog.open(DialogMessageComponent, {
        data: {
          title: 'Empréstimo Quitado!',
          message: 'Parabéns! O empréstimo foi quitado com sucesso.'
        }
      });
    } else {
      this.dialog.open(DialogMessageComponent, {
        data: {
          title: 'Pagamento Realizado!',
          message: `Pagamento de R$ ${this.formatarMoeda(valorPago)} abatido com sucesso!`
        }
      });
    }
  }
}