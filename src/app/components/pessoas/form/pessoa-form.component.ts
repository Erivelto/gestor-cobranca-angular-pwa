import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PessoaService } from '../../../services/pessoa.service';
import { ViaCepService } from '../../../services/viacep.service';
import { NotificationService } from '../../../services/notification.service';
import { Pessoa, PessoaContato, PessoaEndereco } from '../../../models/api.models';

@Component({
  selector: 'app-pessoa-form',
  templateUrl: './pessoa-form.component.html',
  styleUrls: ['./pessoa-form.component.css'],
  standalone: false
})
export class PessoaFormComponent implements OnInit {
  pessoa: Pessoa = {
    codigo: '',
    nome: '',
    documento: '',
    status: 1
  };

  contato: PessoaContato = {
    email: '',
    site: '',
    ddd: '',
    celular: '',
    excluido: false,
    tipo: 'celular'
  };

  endereco: PessoaEndereco = {
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

  constructor(
    private pessoaService: PessoaService,
    private viaCepService: ViaCepService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
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
    this.pessoaService.getPessoaById(id).subscribe({
      next: (pessoa) => {
        this.pessoa = pessoa;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pessoa:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao carregar dados do cliente. Tente novamente.');
        this.loading = false;
      }
    });
  }

  buscarCep(): void {
    if (!this.endereco.cep) {
      return;
    }

    this.loadingCep = true;
    this.viaCepService.buscarCep(this.endereco.cep).subscribe({
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
      },
      error: (error) => {
        console.error('Erro ao buscar CEP:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao buscar CEP. Verifique sua conexão e tente novamente.');
        this.loadingCep = false;
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
    this.pessoaService.createPessoa(this.pessoa).subscribe({
      next: (pessoaCriada) => {
        // Criar contato se preenchido
        if (this.contato.celular || this.contato.email) {
          this.contato.codigoPessoa = parseInt(pessoaCriada.codigo);
          this.pessoaService.createContato(this.contato).subscribe();
        }

        // Criar endereço se preenchido
        if (this.endereco.cep) {
          this.endereco.codigoPessoa = parseInt(pessoaCriada.codigo);
          this.pessoaService.createEndereco(this.endereco).subscribe();
        }

        this.notificationService.success('Sucesso!', 'Cliente cadastrado com sucesso!');
        this.loading = false;
        
        setTimeout(() => {
          this.router.navigate(['/pessoas']);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao criar pessoa:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao cadastrar cliente. Verifique os dados e tente novamente.');
        this.loading = false;
      }
    });
  }

  updatePessoa(): void {
    this.pessoaService.updatePessoa(this.pessoa.id!, this.pessoa).subscribe({
      next: () => {
        this.notificationService.success('Sucesso!', 'Cliente atualizado com sucesso!');
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/pessoas']);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao atualizar pessoa:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao atualizar cliente. Verifique os dados e tente novamente.');
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.pessoa.codigo || !this.pessoa.nome || !this.pessoa.documento) {
      this.notificationService.error('Dados Inválidos', 'Por favor, preencha todos os campos obrigatórios: Código, Nome e Documento.');
      return false;
    }
    return true;
  }

  voltar(): void {
    this.router.navigate(['/pessoas']);
  }
}

