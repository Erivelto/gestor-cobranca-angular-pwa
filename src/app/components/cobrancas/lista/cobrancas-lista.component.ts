import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { CobrancaService } from '../../../services/cobranca.service';
import { PessoaService } from '../../../services/pessoa.service';
import { Cobranca, Pessoa } from '../../../models/api.models';

@Component({
  selector: 'app-cobrancas-lista',
  templateUrl: './cobrancas-lista.component.html',
  styleUrls: ['./cobrancas-lista.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTableModule
  ]
})
export class CobrancasListaComponent implements OnInit {
  cobrancas: Cobranca[] = [];
  loading: boolean = true;
  error: string = '';
  
  // Propriedades para busca de cliente
  clienteSearch: string = '';
  clientesEncontrados: Pessoa[] = [];
  clienteSelecionado: Pessoa | null = null;
  todasPessoas: Pessoa[] = [];
  
  // Propriedades para valores do empréstimo
  valorEmprestimo: number = 0;
  valorEmprestimoFormatado: string = '';
  taxaJuros: number = 0;
  taxaJurosFormatada: string = '';
  dataInicio: Date | null = null;
  periodicidade: string = '';
  
  // Propriedades para controle de parcelas
  numeroParcelas: number = 1;
  valorParcela: number = 0;
  mostrarCronograma: boolean = false;
  cronogramaParcelas: any[] = [];
  totalComJuros: number = 0;
  
  // Propriedades para tabela
  displayedColumns: string[] = ['parcela', 'dataVencimento', 'valorPagar'];

  constructor(
    private cobrancaService: CobrancaService,
    private pessoaService: PessoaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarCobrancas();
    this.carregarPessoas();
  }

  carregarPessoas(): void {
    this.pessoaService.getPessoas().subscribe({
      next: (pessoas) => {
        this.todasPessoas = pessoas;
        console.log('✅ Pessoas carregadas:', pessoas);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar pessoas:', error);
      }
    });
  }

  carregarCobrancas(): void {
    this.loading = true;
    this.error = '';

    this.cobrancaService.getCobrancas().subscribe({
      next: (cobrancas) => {
        this.cobrancas = cobrancas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cobranças:', error);
        this.error = 'Erro ao carregar cobranças. Verifique sua conexão e tente novamente.';
        this.loading = false;
      }
    });
  }



  trackByCobranca(index: number, cobranca: Cobranca): number {
    return cobranca.id || index;
  }

  getStatusIcon(status?: number): string {
    switch (status) {
      case 0: return 'schedule';
      case 1: return 'check_circle';
      case 2: return 'error';
      default: return 'help';
    }
  }

  buscarClientes(): void {
    if (this.clienteSearch.trim().length >= 2) {
      console.log('🔍 Buscando clientes para:', this.clienteSearch);
      
      // Filtra nas pessoas carregadas
      this.clientesEncontrados = this.todasPessoas.filter(pessoa => 
        pessoa.nome.toLowerCase().includes(this.clienteSearch.toLowerCase()) ||
        pessoa.documento.toLowerCase().includes(this.clienteSearch.toLowerCase()) ||
        (pessoa.contatos && pessoa.contatos.some(contato => 
          contato.email?.toLowerCase().includes(this.clienteSearch.toLowerCase())
        ))
      ).filter(pessoa => pessoa.status === 1); // Apenas pessoas ativas
      
      console.log('✅ Clientes encontrados:', this.clientesEncontrados);
    } else {
      this.clientesEncontrados = [];
    }
  }

  selecionarCliente(cliente: Pessoa): void {
    this.clienteSelecionado = cliente;
    this.clienteSearch = cliente.nome;
    this.clientesEncontrados = [];
    console.log('✅ Cliente selecionado:', cliente);
  }

  onClienteSelected(event: any): void {
    const cliente: Pessoa = event.option.value;
    this.clienteSelecionado = cliente;
    this.clienteSearch = cliente.nome;
    console.log('✅ Cliente selecionado via autocomplete:', cliente);
  }

  displayCliente(cliente: Pessoa): string {
    return cliente ? cliente.nome : '';
  }

  novoCliente(): void {
    this.router.navigate(['/pessoas/nova']);
  }

  novaCobranca(): void {
    this.router.navigate(['/cobrancas/nova']);
  }

  editarCobranca(id: number): void {
    this.router.navigate(['/cobrancas/editar', id]);
  }

  deletarCobranca(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta cobrança?')) {
      this.cobrancaService.deleteCobranca(id).subscribe({
        next: () => {
          console.log('Cobrança excluída com sucesso!');
          this.carregarCobrancas();
        },
        error: (error) => {
          console.error('Erro ao excluir cobrança:', error);
          alert('Erro ao excluir cobrança. Tente novamente.');
        }
      });
    }
  }

  getStatusText(status?: number): string {
    switch (status) {
      case 0: return 'Pendente';
      case 1: return 'Pago';
      case 2: return 'Vencido';
      default: return 'Desconhecido';
    }
  }

  getStatusClass(status?: number): string {
    switch (status) {
      case 0: return 'badge-warning';
      case 1: return 'badge-success';
      case 2: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  // Getter para valor da parcela formatado
  get valorParcelaFormatado(): string {
    return this.valorParcela.toFixed(2).replace('.', ',');
  }

  // Função para formatar valor como moeda
  formatarValorMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }

  // Função para aplicar mascara no campo de valor
  onValorEmprestimoInput(event: any): void {
    let valor = event.target.value;
    
    // Remove tudo que não é número
    valor = valor.replace(/\D/g, '');
    
    // Se vazio, zera
    if (!valor) {
      this.valorEmprestimo = 0;
      this.valorEmprestimoFormatado = '';
      return;
    }
    
    // Converte para número com centavos
    const valorNumerico = parseFloat(valor) / 100;
    this.valorEmprestimo = valorNumerico;
    
    // Formata para exibição
    this.valorEmprestimoFormatado = this.formatarValorMoeda(valorNumerico);
    
    // Atualiza o campo
    event.target.value = this.valorEmprestimoFormatado;
    
    // Recalcula parcelas se necessário
    if (this.numeroParcelas > 0) {
      this.calcularParcelas();
    }
  }

  // Função para tratar o foco no campo
  onValorEmprestimoFocus(event: any): void {
    if (this.valorEmprestimo === 0) {
      event.target.value = '';
    }
  }

  // Função para tratar quando sai do campo
  onValorEmprestimoBlur(event: any): void {
    if (!event.target.value || event.target.value === '') {
      this.valorEmprestimo = 0;
      this.valorEmprestimoFormatado = '';
    } else {
      event.target.value = this.valorEmprestimoFormatado;
    }
  }

  // Função para aplicar mascara no campo de taxa de juros
  onTaxaJurosInput(event: any): void {
    let valor = event.target.value;
    
    // Remove tudo que não é número
    valor = valor.replace(/\D/g, '');
    
    // Se vazio, zera
    if (!valor) {
      this.taxaJuros = 0;
      this.taxaJurosFormatada = '';
      return;
    }
    
    // Converte para número com casas decimais
    const valorNumerico = parseFloat(valor) / 100;
    
    // Limita a 100%
    if (valorNumerico > 100) {
      this.taxaJuros = 100;
      this.taxaJurosFormatada = '100,00';
    } else {
      this.taxaJuros = valorNumerico;
      this.taxaJurosFormatada = valorNumerico.toFixed(2).replace('.', ',');
    }
    
    // Atualiza o campo
    event.target.value = this.taxaJurosFormatada;
    
    // Recalcula parcelas se necessário
    if (this.numeroParcelas > 0 && this.valorEmprestimo > 0) {
      this.calcularParcelas();
    }
  }

  // Função para tratar o foco no campo de juros
  onTaxaJurosFocus(event: any): void {
    if (this.taxaJuros === 0) {
      event.target.value = '';
    }
  }

  // Função para tratar quando sai do campo de juros
  onTaxaJurosBlur(event: any): void {
    if (!event.target.value || event.target.value === '') {
      this.taxaJuros = 0;
      this.taxaJurosFormatada = '';
    } else {
      event.target.value = this.taxaJurosFormatada;
    }
  }

  // Calcular parcelas baseado no valor e juros
  calcularParcelas(): void {
    if (this.valorEmprestimo > 0 && this.numeroParcelas > 0) {
      // Cálculo simples: valor principal + juros dividido pelo número de parcelas
      const valorComJuros = this.valorEmprestimo * (1 + (this.taxaJuros / 100));
      this.valorParcela = valorComJuros / this.numeroParcelas;
      this.totalComJuros = valorComJuros;
      
      console.log('💰 Calculando parcelas:', {
        valorEmprestimo: this.valorEmprestimo,
        taxaJuros: this.taxaJuros,
        numeroParcelas: this.numeroParcelas,
        valorParcela: this.valorParcela,
        totalComJuros: this.totalComJuros
      });
    }
  }

  // Gerar cronograma de pagamentos
  gerarCronograma(): void {
    if (!this.dataInicio || !this.periodicidade || this.numeroParcelas <= 0 || this.valorEmprestimo <= 0) {
      alert('Preencha todos os campos antes de gerar o cronograma!');
      return;
    }

    this.cronogramaParcelas = [];
    const dataAtual = new Date(this.dataInicio);
    
    // Definir incremento baseado na periodicidade
    const incrementoDias = this.getIncrementoDias();
    
    for (let i = 0; i < this.numeroParcelas; i++) {
      const dataVencimento = new Date(dataAtual);
      dataVencimento.setDate(dataAtual.getDate() + (i * incrementoDias));
      
      const jurosParaParcela = (this.valorEmprestimo * this.taxaJuros / 100) / this.numeroParcelas;
      const valorPrincipal = this.valorEmprestimo / this.numeroParcelas;
      
      this.cronogramaParcelas.push({
        numero: i + 1,
        dataVencimento: dataVencimento,
        valor: valorPrincipal,
        juros: jurosParaParcela,
        valorTotal: valorPrincipal + jurosParaParcela
      });
    }

    this.mostrarCronograma = true;
    console.log('📅 Cronograma gerado:', this.cronogramaParcelas);
  }

  // Obter incremento de dias baseado na periodicidade
  private getIncrementoDias(): number {
    switch (this.periodicidade) {
      case 'semanal': return 7;
      case 'quinzenal': return 15;
      case 'mensal': return 30;
      default: return 30;
    }
  }

  // Fechar cronograma
  fecharCronograma(): void {
    this.mostrarCronograma = false;
  }

  // Salvar empréstimo
  salvarEmprestimo(): void {
    if (!this.clienteSelecionado || !this.dataInicio || !this.periodicidade || this.numeroParcelas <= 0) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const emprestimoData = {
      cliente: this.clienteSelecionado,
      valorEmprestimo: this.valorEmprestimo,
      taxaJuros: this.taxaJuros,
      dataInicio: this.dataInicio,
      periodicidade: this.periodicidade,
      numeroParcelas: this.numeroParcelas,
      valorParcela: this.valorParcela,
      totalComJuros: this.totalComJuros,
      cronograma: this.cronogramaParcelas
    };

    console.log('💾 Salvando empréstimo:', emprestimoData);
    
    // Aqui você pode integrar com seu serviço para salvar no backend
    alert('Empréstimo salvo com sucesso! (Implementar integração com backend)');
    
    // Limpar formulário após salvar
    this.limparFormulario();
  }

  // Limpar formulário
  private limparFormulario(): void {
    this.clienteSelecionado = null;
    this.clienteSearch = '';
    this.valorEmprestimo = 0;
    this.valorEmprestimoFormatado = '';
    this.taxaJuros = 0;
    this.taxaJurosFormatada = '';
    this.dataInicio = null;
    this.periodicidade = '';
    this.numeroParcelas = 1;
    this.valorParcela = 0;
    this.mostrarCronograma = false;
    this.cronogramaParcelas = [];
    this.totalComJuros = 0;
  }
}

