import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
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
import { MatDividerModule } from '@angular/material/divider';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { BrlCurrencyPipe } from '../../../pipes/brl-currency.pipe';
import { TitleCasePtPipe } from '../../../pipes/title-case.pipe';
import { CobrancaService } from '../../../services/cobranca.service';
import { PessoaService } from '../../../services/pessoa.service';
import { Pessoa, PessoaCobranca, CronogramaParcela } from '../../../models/api.models';
import { MatDialog } from '@angular/material/dialog';
import { DialogMessageComponent } from '../../shared/dialog-message.component';
import { SpinnerService } from '../../../services/spinner.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    styleUrls: ['./nova-cobranca.component.scss'],
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
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatOptionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatTableModule,
        MatDividerModule,
        NgxMaskDirective,
        BrlCurrencyPipe,
        TitleCasePtPipe
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
        { provide: MAT_DATE_FORMATS, useValue: BR_DATE_FORMATS },
        provideNgxMask()
    ]
})
export class NovaCobrancaComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    tipoCobranca: string = 'semanal';
    private calcularParcelasTimeout: ReturnType<typeof setTimeout> | null = null;
    // Chamado quando a taxa de juros muda via ngx-mask
    onTaxaJurosChange(): void {
        if (this.valorEmprestimo > 0) {
            this.totalComJuros = this.valorEmprestimo * (1 + (this.taxaJuros / 100));
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
    taxaJuros: number = 0;
    multa: number = 0;

    dataInicio: Date | null = null;
    periodicidade: string = '';

    // Propriedades para controle de parcelas
    numeroParcelas: number = 1;
    valorParcela: number = 0;
    mostrarCronograma: boolean = false;
    cronogramaParcelas: CronogramaParcela[] = [];
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
        this.pessoaService.getPessoas().pipe(takeUntil(this.destroy$)).subscribe({
            next: (pessoas) => {
                this.todasPessoas = pessoas;
            },
            error: () => {
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
            // Filtra nas pessoas carregadas
            this.clientesEncontrados = this.todasPessoas.filter(pessoa =>
                pessoa.nome.toLowerCase().includes(this.clienteSearch.toLowerCase()) ||
                pessoa.documento.toLowerCase().includes(this.clienteSearch.toLowerCase()) ||
                (pessoa.contatos && pessoa.contatos.some(contato =>
                    contato.email?.toLowerCase().includes(this.clienteSearch.toLowerCase())
                ))
            ).filter(pessoa => pessoa.status === 1); // Apenas pessoas ativas
        } else {
            this.clientesEncontrados = [];
        }
    }

    selecionarCliente(cliente: Pessoa): void {
        this.clienteSelecionado = cliente;
        this.clienteSearch = cliente.nome;
        this.clientesEncontrados = [];
    }

    onClienteSelected(event: { option: { value: Pessoa } }): void {
        const cliente: Pessoa = event.option.value;
        this.clienteSelecionado = cliente;
        this.clienteSearch = cliente.nome;

        // Toast de confirmação
    }

    displayCliente(cliente: Pessoa): string {
        return cliente ? cliente.nome : '';
    }

    novoCliente(): void {
        this.router.navigate(['/pessoas/nova']);
    }

    // Chamado quando o valor do empréstimo muda via ngx-mask
    onValorEmprestimoChange(): void {
        if (this.numeroParcelas > 0 && this.valorEmprestimo > 0) {
            this.debounceCalcularParcelas();
        }
    }

    voltarListaCobrancas(): void {
        this.router.navigate(['/cobrancas']);
    }

    // Getter para valor da parcela formatado
    get valorParcelaFormatado(): string {
        return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.valorParcela);
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

    // Calcular valor total com juros aplicado (% sobre valor do empréstimo)
    calcularValorTotalComJuros(): void {
        if (this.valorEmprestimo > 0 && this.taxaJuros >= 0) {
            this.totalComJuros = this.valorEmprestimo * (1 + (this.taxaJuros / 100));
        }
    }

    // Gerar cronograma de pagamentos
    gerarCronograma(): void {
        if (!this.dataInicio || !this.periodicidade || this.numeroParcelas <= 0 || this.valorEmprestimo <= 0) {
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
        if (!this.clienteSelecionado || !this.dataInicio) {
            return;
        }
        // Declarar e inicializar novaCobranca conforme formato da API
        const dataInicioISO = this.dataInicio ? this.dataInicio.toISOString() : new Date().toISOString();
        const novaCobranca: PessoaCobranca = {
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

        try {
            const res = await this.spinnerService.withSpinner(
                () => this.cobrancaService.createCobranca(payload).toPromise(),
                { message: 'Adicionando empréstimo...', overlay: true }
            );
            const dialogRef = this.dialog.open(DialogMessageComponent, {
                data: {
                    title: 'Empréstimo criado!',
                    message: 'O empréstimo foi adicionado com sucesso.'
                }
            });
            dialogRef.afterClosed().subscribe(() => {
                this.router.navigate(['/cobrancas']);
            });
        } catch (error: unknown) {
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
        this.taxaJuros = 0;
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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.calcularParcelasTimeout) {
            clearTimeout(this.calcularParcelasTimeout);
        }
    }
}