import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { CobrancaService } from '../../../services/cobranca.service';
import { PessoaService } from '../../../services/pessoa.service';
import { Pessoa } from '../../../models/api.models';
import { PessoaCobranca } from '../../../models/api.models';
import { MatDialog } from '@angular/material/dialog';
import { DialogMessageComponent } from '../../shared/dialog-message.component';
import { SpinnerService } from '../../../services/spinner.service';

const BR_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY'
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY'
    }
};

@Component({
    selector: 'app-nova-cobranca',
    templateUrl: './nova-cobranca.component.html',
    styleUrls: ['./nova-cobranca.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatOptionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatTableModule
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
        { provide: MAT_DATE_FORMATS, useValue: BR_DATE_FORMATS }
    ]
})
export class NovaCobrancaComponent implements OnInit {
    tipoCobranca: string = 'semanal';
    private calcularParcelasTimeout: any;
    // Função para tratar entrada do campo de juros aplicado (% sobre valor do empréstimo)
    onTaxaJurosInput(event: any): void {
        let valor = event.target.value.replace(',', '.');
        valor = valor.replace(/[^\d\.]/g, '');
        if (!valor) {
            this.taxaJuros = 0;
            this.taxaJurosFormatada = '';
            return;
        }
        const valorNumerico = parseFloat(valor);
        this.taxaJuros = isNaN(valorNumerico) ? 0 : valorNumerico;
        this.taxaJurosFormatada = valor;
        event.target.value = valor;
        if (this.valorEmprestimo > 0) {
            if (this.taxaJuros > 0) {
                this.totalComJuros = this.valorEmprestimo * (1 + (this.taxaJuros / 100));
            } else {
                this.totalComJuros = this.valorEmprestimo;
            }
        }
    }
    loading: boolean = false;

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
    multa: number = 0;
    multaFormatada: string = '';

    // Função para tratar entrada do campo de multa (valor monetário)
    onMultaInput(event: any): void {
        let valor = event.target.value.replace(/\D/g, '');
        if (!valor) {
            this.multa = 0;
            this.multaFormatada = '';
            return;
        }
        const valorNumerico = parseFloat(valor) / 100;
        this.multa = valorNumerico;
        this.multaFormatada = this.formatarValorMoeda(valorNumerico);
        event.target.value = this.multaFormatada;
    }

    onMultaFocus(event: any): void {
        if (this.multa === 0) {
            event.target.value = '';
        }
    }

    onMultaBlur(event: any): void {
        if (!event.target.value || event.target.value === '') {
            this.multa = 0;
            this.multaFormatada = '';
        } else {
            event.target.value = this.multaFormatada;
        }
    }
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
        private router: Router,
        private dialog: MatDialog,
        private dateAdapter: DateAdapter<Date>,
        private spinnerService: SpinnerService
    ) {
        // Ajusta o datepicker para usar locale brasileiro (dd/MM/yyyy)
        this.dateAdapter.setLocale('pt-BR');
    }

    ngOnInit(): void {
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
                this.dialog.open(DialogMessageComponent, {
                    data: {
                        title: 'Erro!',
                        message: 'Erro ao carregar lista de clientes. Tente novamente.'
                    }
                });
            }
        });
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

        // Toast de confirmação
    }

    displayCliente(cliente: Pessoa): string {
        return cliente ? cliente.nome : '';
    }

    novoCliente(): void {
        this.router.navigate(['/pessoas/nova']);
    }

    voltarListaCobrancas(): void {
        this.router.navigate(['/cobrancas']);
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
	valor = valor.replace(/\D/g, '');
	if (!valor) {
		this.valorEmprestimo = 0;
		this.valorEmprestimoFormatado = '';
		return;
	}
	const valorNumerico = parseFloat(valor) / 100;
	this.valorEmprestimo = valorNumerico;
	this.valorEmprestimoFormatado = this.formatarValorMoeda(valorNumerico);
	event.target.value = this.valorEmprestimoFormatado;
	if (this.numeroParcelas > 0 && this.valorEmprestimo > 0) {
		this.debounceCalcularParcelas();
	}
    }

    // Função debounce para cálculo de parcelas
    debounceCalcularParcelas(): void {
        if (this.calcularParcelasTimeout) {
            clearTimeout(this.calcularParcelasTimeout);
        }
        this.calcularParcelasTimeout = setTimeout(() => {
            this.calcularValorTotalComJuros();
        }, 400);
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

    // Função para aplicar mascara no campo de juros aplicado (valor)

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

    // Calcular valor total com juros aplicado (% sobre valor do empréstimo)
    calcularValorTotalComJuros(): void {
        if (this.valorEmprestimo > 0 && this.taxaJuros >= 0) {
            this.totalComJuros = this.valorEmprestimo * (1 + (this.taxaJuros / 100));
            console.log('💰 Calculando valor total com juros:', {
                valorEmprestimo: this.valorEmprestimo,
                taxaJuros: this.taxaJuros,
                totalComJuros: this.totalComJuros
            });
        }
    }

    // Gerar cronograma de pagamentos
    gerarCronograma(): void {
        if (!this.dataInicio || !this.periodicidade || this.numeroParcelas <= 0 || this.valorEmprestimo <= 0) {
            // Aqui pode ser implementado Material Dialog futuramente
            console.warn('Preencha todos os campos antes de gerar o cronograma!');
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

        // Aqui pode ser implementado Material Dialog futuramente
        console.log(`Cronograma de ${this.numeroParcelas} parcelas criado com sucesso.`);
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
    async salvarEmprestimo(): Promise<void> {
        console.log('Botão salvar clicado');
        console.log('Dados do formulário:', {
            clienteSelecionado: this.clienteSelecionado,
            dataInicio: this.dataInicio,
            periodicidade: this.periodicidade,
            numeroParcelas: this.numeroParcelas,
            valorEmprestimo: this.valorEmprestimo,
            taxaJuros: this.taxaJuros,
            tipoCobranca: this.tipoCobranca
        });
        if (!this.clienteSelecionado || !this.dataInicio) {
            console.warn('Campos obrigatórios não preenchidos');
            return;
        }
        // Declarar e inicializar novaCobranca conforme formato da API
        const dataInicioISO = this.dataInicio ? this.dataInicio.toISOString() : new Date().toISOString();
        const novaCobranca: any = {
            codigo: 0,
            codigoPessoa: this.clienteSelecionado?.codigo ?? 0,
            tipoCobranca: this.tipoCobranca,
            valor: this.valorEmprestimo > 0 ? this.valorEmprestimo : 1,
            juros: this.taxaJuros >= 0 ? this.taxaJuros : 0,
            multa: this.multa >= 0 ? this.multa : 0,
            valorTotal: this.valorEmprestimo * (1 + (this.taxaJuros / 100)),
            dataInicio: dataInicioISO,
            diaVencimento: 0, // Sempre enviar 0
            status: 1,
            excluido: false
        };
        const payload = novaCobranca;
        console.log('Payload enviado para API:', JSON.stringify(payload, null, 2));
        console.log('Criando objeto novaCobranca...');
        console.log('Objeto novaCobranca:', novaCobranca);
        console.log('Chamando cobrancaService.createCobranca...');

        try {
            const res = await this.spinnerService.withSpinner(
                () => this.cobrancaService.createCobranca(payload).toPromise(),
                { message: 'Adicionando empréstimo...', overlay: true }
            );
            console.log('Cobrança criada com sucesso na API:', res);
            const dialogRef = this.dialog.open(DialogMessageComponent, {
                data: {
                    title: 'Empréstimo criado!',
                    message: 'O empréstimo foi adicionado com sucesso.'
                }
            });
            dialogRef.afterClosed().subscribe(() => {
                this.router.navigate(['/cobrancas']);
            });
        } catch (error: any) {
            console.error('Erro ao criar cobrança na API:', error);
            this.dialog.open(DialogMessageComponent, {
                data: {
                    title: 'Erro!',
                    message: 'Não foi possível adicionar o empréstimo. Tente novamente.'
                }
            });
        }
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

    // Cancelar cadastro
    cancelarCadastro(): void {
        if (this.clienteSelecionado || this.valorEmprestimo > 0) {
            // Se desejar, pode implementar Material Dialog para confirmação aqui
            this.voltarListaCobrancas();
        }
    }
}