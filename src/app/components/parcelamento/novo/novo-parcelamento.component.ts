import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { TitleCasePtPipe } from '../../../pipes/title-case.pipe';
import { PessoaParcelamento } from '../../../models/api.models';
import { ParcelamentoService } from '../../../services/parcelamento.service';
import { PessoaService } from '../../../services/pessoa.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Pessoa } from '../../../models/api.models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

const BR_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'app-novo-parcelamento',
  templateUrl: './novo-parcelamento.component.html',
  styleUrls: ['./novo-parcelamento.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    MatDividerModule,
    NgxMaskDirective,
    TitleCasePtPipe,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    provideNgxMask(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: BR_DATE_FORMATS }
  ]
})
export class NovoParcelamentoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private parcelamentoService = inject(ParcelamentoService);
  private pessoaService = inject(PessoaService);
  private spinner = inject(SpinnerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private dateAdapter = inject<DateAdapter<Date>>(DateAdapter);

  form!: FormGroup;
  loading = false;
  isEditing = false;
  pessoas: Pessoa[] = [];
  parcelamentoId?: number;

  ngOnInit(): void {
    this.dateAdapter.setLocale('pt-BR');
    this.initForm();
    this.carregarPessoas();
    this.verificarEdicao();
  }

  initForm(): void {
    this.form = this.fb.group({
      codigoPessoa: ['', Validators.required],
      quantidadeParcelas: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      valorTotal: ['', [Validators.required, Validators.min(0.01)]],
      dataInicial: [new Date(), Validators.required],
      status: [1, Validators.required]
    });
  }

  carregarPessoas(): void {
    this.spinner.show();
    this.pessoaService.getPessoas().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.pessoas = data.filter(p => !p.status || p.status === 1);
        this.spinner.hide();
      },
      error: () => {
        Swal.fire('Erro', 'Falha ao carregar pessoas', 'error');
        this.spinner.hide();
      }
    });
  }

  verificarEdicao(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
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
    this.parcelamentoService.getParcelamentoById(this.parcelamentoId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.form.patchValue({
          codigoPessoa: data.codigoPessoa,
          quantidadeParcelas: data.quantidadeParcelas,
          valorTotal: data.valorTotal,
          status: data.status
        });
        this.spinner.hide();
      },
      error: () => {
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
      this.parcelamentoService.atualizarParcelamento(this.parcelamentoId!, dados).pipe(takeUntil(this.destroy$)).subscribe({
        next: (result) => {
          Swal.fire('Sucesso!', 'Parcelamento atualizado com sucesso', 'success');
          this.loading = false;
          this.cdr.markForCheck();
          this.spinner.hide();
          this.router.navigate(['/parcelamento']);
        },
        error: () => {
          Swal.fire('Erro!', 'Falha ao atualizar parcelamento', 'error');
          this.loading = false;
          this.cdr.markForCheck();
          this.spinner.hide();
        }
      });
    } else {
      // Se criando, usa o novo método que cria parcelamento + detalhes das parcelas
      const dataCadastroAgora = this.formatarData(this.form.value.dataInicial);

      this.parcelamentoService.criarParcelamentoComDetalhes(dados, dataCadastroAgora).pipe(takeUntil(this.destroy$)).subscribe({
        next: (result) => {
          Swal.fire('Sucesso!', 'Parcelamento criado com sucesso com todas as parcelas', 'success');
          this.loading = false;
          this.cdr.markForCheck();
          this.spinner.hide();
          // 🎯 Redirecionar para a tela de DETALHES do parcelamento criado
          this.router.navigate(['/parcelamento/detalhes', result.codigo]);
        },
        error: () => {
          Swal.fire('Erro!', 'Falha ao criar parcelamento', 'error');
          this.loading = false;
          this.cdr.markForCheck();
          this.spinner.hide();
        }
      });
    }
  }

  private formatarData(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cancelar(): void {
    this.router.navigate(['/parcelamento']);
  }

  get title(): string {
    return this.isEditing ? 'Editar Parcelamento' : 'Novo Parcelamento';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
