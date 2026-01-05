import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { PessoaParcelamento } from '../../../models/api.models';
import { ParcelamentoService } from '../../../services/parcelamento.service';
import { PessoaService } from '../../../services/pessoa.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Pessoa } from '../../../models/api.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-novo-parcelamento',
  templateUrl: './novo-parcelamento.component.html',
  styleUrls: ['./novo-parcelamento.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ]
})
export class NovoParcelamentoComponent implements OnInit {
  private parcelamentoService = inject(ParcelamentoService);
  private pessoaService = inject(PessoaService);
  private spinner = inject(SpinnerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  loading = false;
  isEditing = false;
  pessoas: Pessoa[] = [];
  parcelamentoId?: number;

  ngOnInit(): void {
    this.initForm();
    this.carregarPessoas();
    this.verificarEdicao();
  }

  initForm(): void {
    this.form = this.fb.group({
      codigoPessoa: ['', Validators.required],
      quantidadeParcelas: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      valorTotal: ['', [Validators.required, Validators.min(0.01)]],
      status: [1, Validators.required]
    });
  }

  carregarPessoas(): void {
    this.spinner.show();
    this.pessoaService.getPessoas().subscribe({
      next: (data) => {
        this.pessoas = data.filter(p => !p.status || p.status === 1);
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Erro ao carregar pessoas:', error);
        Swal.fire('Erro', 'Falha ao carregar pessoas', 'error');
        this.spinner.hide();
      }
    });
  }

  verificarEdicao(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditing = true;
        this.parcelamentoId = Number(id);
        this.carregarParcelamento();
      }
    });
  }

  carregarParcelamento(): void {
    if (!this.parcelamentoId) return;

    this.spinner.show();
    this.parcelamentoService.getParcelamentoById(this.parcelamentoId).subscribe({
      next: (data) => {
        this.form.patchValue({
          codigoPessoa: data.codigoPessoa,
          quantidadeParcelas: data.quantidadeParcelas,
          valorTotal: data.valorTotal,
          status: data.status
        });
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Erro ao carregar parcelamento:', error);
        Swal.fire('Erro', 'Falha ao carregar parcelamento', 'error');
        this.spinner.hide();
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      Swal.fire('Erro', 'Preencha todos os campos obrigatórios', 'warning');
      return;
    }

    const dados: PessoaParcelamento = {
      codigo: this.parcelamentoId || 0,
      codigoPessoa: this.form.value.codigoPessoa,
      quantidadeParcelas: this.form.value.quantidadeParcelas,
      valorTotal: this.form.value.valorTotal,
      status: this.form.value.status,
      excluido: false
    };

    this.loading = true;
    this.spinner.show();

    if (this.isEditing) {
      // Se editando, usa o método de atualização padrão
      this.parcelamentoService.atualizarParcelamento(this.parcelamentoId!, dados).subscribe({
        next: (result) => {
          Swal.fire('Sucesso!', 'Parcelamento atualizado com sucesso', 'success');
          this.loading = false;
          this.spinner.hide();
          this.router.navigate(['/parcelamento']);
        },
        error: (error) => {
          console.error('Erro ao atualizar parcelamento:', error);
          Swal.fire('Erro!', 'Falha ao atualizar parcelamento', 'error');
          this.loading = false;
          this.spinner.hide();
        }
      });
    } else {
      // Se criando, usa o novo método que cria parcelamento + detalhes das parcelas
      const dataCadastroAgora = this.obterDataAtualFormatada();
      console.log('📅 Data de cadastro para cálculo de parcelas:', dataCadastroAgora);

      this.parcelamentoService.criarParcelamentoComDetalhes(dados, dataCadastroAgora).subscribe({
        next: (result) => {
          Swal.fire('Sucesso!', 'Parcelamento criado com sucesso com todas as parcelas', 'success');
          this.loading = false;
          this.spinner.hide();
          // 🎯 Redirecionar para a tela de DETALHES do parcelamento criado
          this.router.navigate(['/parcelamento/detalhes', result.codigo]);
        },
        error: (error) => {
          console.error('Erro ao criar parcelamento:', error);
          Swal.fire('Erro!', 'Falha ao criar parcelamento', 'error');
          this.loading = false;
          this.spinner.hide();
        }
      });
    }
  }

  private obterDataAtualFormatada(): string {
    const hoje = new Date();
    const year = hoje.getFullYear();
    const month = String(hoje.getMonth() + 1).padStart(2, '0');
    const day = String(hoje.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cancelar(): void {
    this.router.navigate(['/parcelamento']);
  }

  get title(): string {
    return this.isEditing ? 'Editar Parcelamento' : 'Novo Parcelamento';
  }

  get valorTotalFormatado(): string {
    const valor = this.form?.get('valorTotal')?.value;
    if (valor === null || valor === undefined || valor === '') return '';
    return this.formatCurrency(valor);
  }

  onValorTotalInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = this.parseCurrency(input.value);
    this.form.get('valorTotal')?.setValue(valor, { emitEvent: false });
    input.value = this.formatCurrency(valor);
  }

  onValorTotalFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = this.form.get('valorTotal')?.value;
    input.value = valor ? String(valor) : '';
  }

  onValorTotalBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = this.form.get('valorTotal')?.value;
    input.value = valor ? this.formatCurrency(valor) : '';
  }

  private parseCurrency(value: string | number): number {
    if (typeof value === 'number') return value;
    const numeric = value.replace(/\D/g, '');
    const valor = Number(numeric) / 100;
    return Number.isNaN(valor) ? 0 : Number(valor.toFixed(2));
  }

  private formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? this.parseCurrency(value) : value;
    if (num === 0) return '0,00';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
