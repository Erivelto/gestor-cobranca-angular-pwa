import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PessoaService } from '../../../services/pessoa.service';
import { ViaCepService } from '../../../services/viacep.service';
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
    tipo: 0,
    contato: ''
  };

  endereco: PessoaEndereco = {
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  };

  isEditMode: boolean = false;
  loading: boolean = false;
  loadingCep: boolean = false;
  success: string = '';
  error: string = '';

  constructor(
    private pessoaService: PessoaService,
    private viaCepService: ViaCepService,
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
        this.error = 'Erro ao carregar cliente';
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
          alert('CEP não encontrado');
        } else {
          this.endereco.logradouro = response.logradouro;
          this.endereco.bairro = response.bairro;
          this.endereco.cidade = response.localidade;
          this.endereco.estado = response.uf;
        }
        this.loadingCep = false;
      },
      error: (error) => {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP');
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
        if (this.contato.contato) {
          this.contato.pessoaId = pessoaCriada.id;
          this.pessoaService.createContato(this.contato).subscribe();
        }

        // Criar endereço se preenchido
        if (this.endereco.cep) {
          this.endereco.pessoaId = pessoaCriada.id;
          this.pessoaService.createEndereco(this.endereco).subscribe();
        }

        this.success = 'Cliente cadastrado com sucesso!';
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/pessoas']);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao criar pessoa:', error);
        this.error = 'Erro ao cadastrar cliente. Tente novamente.';
        this.loading = false;
      }
    });
  }

  updatePessoa(): void {
    this.pessoaService.updatePessoa(this.pessoa.id!, this.pessoa).subscribe({
      next: () => {
        this.success = 'Cliente atualizado com sucesso!';
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/pessoas']);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao atualizar pessoa:', error);
        this.error = 'Erro ao atualizar cliente. Tente novamente.';
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.pessoa.codigo || !this.pessoa.nome || !this.pessoa.documento) {
      this.error = 'Por favor, preencha todos os campos obrigatórios';
      return false;
    }
    return true;
  }

  voltar(): void {
    this.router.navigate(['/pessoas']);
  }
}

