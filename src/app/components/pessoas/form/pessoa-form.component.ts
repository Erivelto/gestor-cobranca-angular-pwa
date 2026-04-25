import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PessoaService } from '../../../services/pessoa.service';
import { ViaCepService } from '../../../services/viacep.service';
import { NotificationService } from '../../../services/notification.service';
import { Pessoa, PessoaContato, PessoaEndereco, PessoaFile, ArquivoImagem } from '../../../models/api.models';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-pessoa-form',
  templateUrl: './pessoa-form.component.html',
  styleUrls: ['./pessoa-form.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PessoaFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  pessoa: Pessoa = {
    codigo: 0,
    nome: '',
    documento: '',
    status: 1   
  };

  contato: PessoaContato = {
    codigo: 0,
    codigoPessoa: 0,
    email: '',
    site: '',
    ddd: '',
    celular: '',
    excluido: false,
    tipo: ' ',  // API espera espaço quando vazio
    dddAdic: '',
    celularAdic: '',
    descricaoAdic: ''
  };

  endereco: PessoaEndereco = {
    codigo: 0,
    codigoPessoa: 0,
    tipo: 'R',
    logradouro: '',
    numrero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    excluido: false
  };

  isEditMode: boolean = false;
  loading: boolean = false;
  loadingCep: boolean = false;
  success: string = '';
  error: string = '';
  selectedFile: File | null = null;
  selectedFileName: string = '';
  pessoaFile: PessoaFile = {};

  constructor(
    private pessoaService: PessoaService,
    private viaCepService: ViaCepService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadPessoa(parseInt(id));
    }
  }

  loadPessoa(id: number): void {
    this.loading = true;
    this.pessoaService.getPessoaById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (pessoa) => {
        this.pessoa = pessoa;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.notificationService.error('Erro do Servidor', 'Erro ao carregar dados do cliente. Tente novamente.');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  buscarCep(): void {
    if (!this.endereco.cep) {
      return;
    }

    this.loadingCep = true;
    this.viaCepService.buscarCep(this.endereco.cep).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.erro) {
          this.notificationService.warning('CEP não encontrado', 'Verifique o CEP informado e tente novamente.');
        } else {
          this.endereco.logradouro = response.logradouro;
          this.endereco.bairro = response.bairro;
          this.endereco.cidade = response.localidade;
          this.endereco.logradouro = response.logradouro;
          this.endereco.bairro = response.bairro;
          this.endereco.cidade = response.localidade;
          this.endereco.uf = response.uf;
        }
        this.loadingCep = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.notificationService.error('Erro do Servidor', 'Erro ao buscar CEP. Verifique sua conexão e tente novamente.');
        this.loadingCep = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    if (this.isEditMode) {
      this.updatePessoa();
    } else {
      this.createPessoa();
    }
  }

  createPessoa(): void {
    // Resolve o id do usuário da sessão (AuthService) ou do localStorage
  const uidFromAuth = this.authService.currentUserValue?.id;
  const uidFromStorage = Number(localStorage.getItem('userId') ?? NaN);
  const resolvedUserId = uidFromAuth && uidFromAuth > 0
    ? uidFromAuth
    : (Number.isFinite(uidFromStorage) && uidFromStorage > 0 ? uidFromStorage : undefined);

  this.pessoa.usuarioId = resolvedUserId;
    this.pessoaService.createPessoa(this.pessoa).pipe(takeUntil(this.destroy$)).subscribe({
      next: (pessoaCriada) => {
        const promises: Promise<unknown>[] = [];

        // Criar contato se preenchido
        if (this.contato.celular || this.contato.email) {
          this.contato.codigoPessoa = pessoaCriada.codigo;
          const jsonString = JSON.stringify(this.contato);
          const contatoPromise = new Promise((resolve, reject) => {
            this.pessoaService.createContato(this.contato).pipe(takeUntil(this.destroy$)).subscribe({
              next: (contatoCriado) => {
                resolve(contatoCriado);
              },
              error: (error) => {
                this.notificationService.warning('Aviso', 'Cliente criado, mas houve erro ao salvar o contato.');
                reject(error);
              }
            });
          });
          promises.push(contatoPromise);
        }

        // Criar endereço se preenchido
        if (this.endereco.cep || this.endereco.logradouro) {
          this.endereco.codigoPessoa = pessoaCriada.codigo;
          const jsonString = JSON.stringify(this.endereco);
          const enderecoPromise = new Promise((resolve, reject) => {
            this.pessoaService.createEndereco(this.endereco).pipe(takeUntil(this.destroy$)).subscribe({
              next: (enderecoCriado) => {
                resolve(enderecoCriado);
              },
              error: (error) => {
                this.notificationService.warning('Aviso', 'Cliente criado, mas houve erro ao salvar o endereço.');
                reject(error);
              }
            });
          });
          promises.push(enderecoPromise);
        }
        // Upload de arquivo se selecionado
       // if (this.selectedFile) {
         // console.log('📎 Enviando arquivo...');
          //this.uploadFile(pessoaCriada.codigo);
       // }
        // Aguardar todas as operações
        Promise.allSettled(promises).then(() => {
          this.notificationService.success('Sucesso!', 'Cliente cadastrado com sucesso!');
          this.loading = false;
          
          setTimeout(() => {
            this.router.navigate(['/pessoas']);
          }, 1500);
        });
      },
      error: () => {
        this.notificationService.error('Erro do Servidor', 'Erro ao cadastrar cliente. Verifique os dados e tente novamente.');
        this.loading = false;
      }
    });
  }

  updatePessoa(): void {
    this.pessoaService.updatePessoa(this.pessoa.codigo, this.pessoa).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Sucesso!', 'Cliente atualizado com sucesso!');
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/pessoas']);
        }, 1500);
      },
      error: () => {
        this.notificationService.error('Erro do Servidor', 'Erro ao atualizar cliente. Verifique os dados e tente novamente.');
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.pessoa.nome || !this.pessoa.documento) {
      this.error = 'Por favor, preencha todos os campos obrigatórios (Nome e Documento)';
      return false;
    }
    return true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  async uploadFile(codigoPessoa: number): Promise<void> {
    if (!this.selectedFile) {
      return;
    }

    try {
      // Gerar número aleatório (pasta)
      const numeroAleatorio = Math.floor(Math.random() * (1000000 - 100000) + 100000);
      
      // Converter arquivo para base64
      const base64 = await this.convertFileToBase64(this.selectedFile);
      
      // Gerar GUID para o arquivo
      const arquivoGuid = this.generateGuid();
      
      // Preparar objeto ArquivoImagem
      const arquivoImagem: ArquivoImagem = {
        codigo: arquivoGuid,
        image: base64,
        pasta: numeroAleatorio.toString()
      };

      // Enviar para o serviço de armazenamento
      this.http.post(`${environment.storageUrl}/ArmazenamentoDeObjeto`, arquivoImagem)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            // Salvar referência do arquivo
            this.pessoaFile.Arquivo = arquivoGuid;
            this.pessoaFile.Pasta = numeroAleatorio;
            this.pessoaFile.DataCriacao = new Date();
            this.pessoaFile.CodigoPessoa = codigoPessoa;
            
            // Persistir PessoaFile na API
            this.pessoaService.createPessoaUpload(this.pessoaFile).pipe(takeUntil(this.destroy$)).subscribe({
              next: (resp) => {
                this.notificationService.success('Sucesso', 'Arquivo anexado e registrado!');
              },
              error: () => {
                this.notificationService.warning('Aviso', 'Arquivo armazenado, mas falhou ao registrar no sistema.');
              }
            });
          },
          error: () => {
            this.notificationService.error('Erro', 'Falha ao anexar arquivo.');
          }
        });
    } catch (error) {
      this.notificationService.error('Erro', 'Falha ao processar arquivo.');
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  voltar(): void {
    this.router.navigate(['/pessoas']);
  }

  // Métodos para validação numérica
  onlyNumbers(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (field === 'documento') {
      // CPF: até 11 dígitos
      value = value.substring(0, 11);
      this.pessoa.documento = value;
    } else if (field === 'ddd') {
      // DDD: até 2 dígitos
      value = value.substring(0, 2);
      this.contato.ddd = value;
    } else if (field === 'celular') {
      // Celular: até 9 dígitos
      value = value.substring(0, 9);
      this.contato.celular = value;
    } else if (field === 'dddAdic') {
      // DDD adicional: até 2 dígitos
      value = value.substring(0, 2);
      this.contato.dddAdic = value;
    } else if (field === 'celularAdic') {
      // Celular adicional: até 9 dígitos
      value = value.substring(0, 9);
      this.contato.celularAdic = value;
    } else if (field === 'cep') {
      // CEP: até 8 dígitos
      value = value.substring(0, 8);
      this.endereco.cep = value;
    } else if (field === 'numero') {
      // Número: até 10 dígitos
      value = value.substring(0, 10);
      this.endereco.numrero = value;
    }
    
    input.value = value;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

