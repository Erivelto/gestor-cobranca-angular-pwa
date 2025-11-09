import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PessoaService } from '../../../services/pessoa.service';
import { ViaCepService } from '../../../services/viacep.service';
import { Pessoa, PessoaContato, PessoaEndereco } from '../../../models/api.models';

@Component({
  selector: 'app-pessoa-edit',
  templateUrl: './pessoa-edit.component.html',
  styleUrls: ['./pessoa-edit.component.css'],
  standalone: false
})
export class PessoaEditComponent implements OnInit {
  pessoaId: string | null = null;
  pessoa: Pessoa = {
    codigo: 0,
    nome: '',
    documento: '',
    status: 1
  };

  contatos: PessoaContato[] = [];
  enderecos: PessoaEndereco[] = [];
  
  novoContato: PessoaContato = {
    codigo: 0,
    codigopesssoa: 0,
    email: '',
    site: '',
    ddd: '',
    celular: '',
    contato: ''
  };

  novoEndereco: PessoaEndereco = {
    codigo: 0,
    codigopessoa: 0,
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  };

  loading: boolean = false;
  loadingCep: boolean = false;
  success: string = '';
  error: string = '';
  
  // Controles de exibição
  showAddContato: boolean = false;
  showAddEndereco: boolean = false;
  
  // Dados para edição inline
  editingContato: number | null = null;
  editingEndereco: number | null = null;

  constructor(
    private pessoaService: PessoaService,
    private viaCepService: ViaCepService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('PessoaEditComponent inicializado');
    const id = this.route.snapshot.paramMap.get('id');
    this.pessoaId = id;
    console.log('ID da pessoa para edição:', id);
    if (id) {
      this.loadPessoa(parseInt(id));
      this.loadContatos(parseInt(id));
      this.loadEnderecos(parseInt(id));
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

  loadContatos(pessoaId: number): void {
    this.pessoaService.getContatosByPessoaId(pessoaId).subscribe({
      next: (contatos) => {
        this.contatos = contatos;
      },
      error: (error) => {
        console.error('Erro ao carregar contatos:', error);
      }
    });
  }

  loadEnderecos(pessoaId: number): void {
    this.pessoaService.getEnderecosByPessoaId(pessoaId).subscribe({
      next: (enderecos) => {
        this.enderecos = enderecos;
      },
      error: (error) => {
        console.error('Erro ao carregar endereços:', error);
      }
    });
  }

  // === MÉTODOS DE PESSOA ===
  updatePessoa(): void {
    if (!this.validatePessoa()) {
      return;
    }

    this.loading = true;
    this.pessoaService.updatePessoa(this.pessoa.codigo, this.pessoa).subscribe({
      next: () => {
        this.success = 'Cliente atualizado com sucesso!';
        this.loading = false;
        this.clearMessages();
      },
      error: (error) => {
        console.error('Erro ao atualizar pessoa:', error);
        this.error = 'Erro ao atualizar cliente';
        this.loading = false;
        this.clearMessages();
      }
    });
  }

  // === MÉTODOS DE CONTATO ===
  addContato(): void {
    if (!this.validateContato()) {
      return;
    }

    this.novoContato.codigopesssoa = this.pessoa.codigo;
    this.pessoaService.createContato(this.novoContato).subscribe({
      next: (contato) => {
        this.contatos.push(contato);
        this.resetNovoContato();
        this.showAddContato = false;
        this.success = 'Contato adicionado com sucesso!';
        this.clearMessages();
      },
      error: (error) => {
        console.error('Erro ao adicionar contato:', error);
        this.error = 'Erro ao adicionar contato';
        this.clearMessages();
      }
    });
  }

  editContato(index: number): void {
    this.editingContato = index;
  }

  saveContato(contato: PessoaContato): void {
    this.pessoaService.updateContato(contato.codigo, contato).subscribe({
      next: () => {
        this.editingContato = null;
        this.success = 'Contato atualizado com sucesso!';
        this.clearMessages();
      },
      error: (error) => {
        console.error('Erro ao atualizar contato:', error);
        this.error = 'Erro ao atualizar contato';
        this.clearMessages();
      }
    });
  }

  deleteContato(codigo: number, index: number): void {
    if (confirm('Deseja realmente excluir este contato?')) {
      this.pessoaService.deleteContato(codigo).subscribe({
        next: () => {
          this.contatos.splice(index, 1);
          this.success = 'Contato excluído com sucesso!';
          this.clearMessages();
        },
        error: (error) => {
          console.error('Erro ao excluir contato:', error);
          this.error = 'Erro ao excluir contato';
          this.clearMessages();
        }
      });
    }
  }

  // === MÉTODOS DE ENDEREÇO ===
  addEndereco(): void {
    if (!this.validateEndereco()) {
      return;
    }

    this.novoEndereco.codigopessoa = this.pessoa.codigo;
    this.pessoaService.createEndereco(this.novoEndereco).subscribe({
      next: (endereco) => {
        this.enderecos.push(endereco);
        this.resetNovoEndereco();
        this.showAddEndereco = false;
        this.success = 'Endereço adicionado com sucesso!';
        this.clearMessages();
      },
      error: (error) => {
        console.error('Erro ao adicionar endereço:', error);
        this.error = 'Erro ao adicionar endereço';
        this.clearMessages();
      }
    });
  }

  editEndereco(index: number): void {
    this.editingEndereco = index;
  }

  saveEndereco(endereco: PessoaEndereco): void {
    this.pessoaService.updateEndereco(endereco.codigo, endereco).subscribe({
      next: () => {
        this.editingEndereco = null;
        this.success = 'Endereço atualizado com sucesso!';
        this.clearMessages();
      },
      error: (error) => {
        console.error('Erro ao atualizar endereço:', error);
        this.error = 'Erro ao atualizar endereço';
        this.clearMessages();
      }
    });
  }

  deleteEndereco(codigo: number, index: number): void {
    if (confirm('Deseja realmente excluir este endereço?')) {
      this.pessoaService.deleteEndereco(codigo).subscribe({
        next: () => {
          this.enderecos.splice(index, 1);
          this.success = 'Endereço excluído com sucesso!';
          this.clearMessages();
        },
        error: (error) => {
          console.error('Erro ao excluir endereço:', error);
          this.error = 'Erro ao excluir endereço';
          this.clearMessages();
        }
      });
    }
  }

  // === MÉTODOS AUXILIARES ===
  buscarCep(endereco: PessoaEndereco): void {
    if (!endereco.cep) return;

    this.loadingCep = true;
    this.viaCepService.buscarCep(endereco.cep).subscribe({
      next: (response) => {
        if (response.erro) {
          this.error = 'CEP não encontrado';
        } else {
          endereco.logradouro = response.logradouro;
          endereco.bairro = response.bairro;
          endereco.cidade = response.localidade;
          endereco.estado = response.uf;
        }
        this.loadingCep = false;
        this.clearMessages();
      },
      error: (error) => {
        console.error('Erro ao buscar CEP:', error);
        this.error = 'Erro ao buscar CEP';
        this.loadingCep = false;
        this.clearMessages();
      }
    });
  }

  getTipoContatoText(tipo?: number): string {
    // Método removido - não mais necessário com nova estrutura
    return '';
  }

  // === VALIDAÇÕES ===
  validatePessoa(): boolean {
    if (!this.pessoa.codigo || !this.pessoa.nome || !this.pessoa.documento) {
      this.error = 'Por favor, preencha todos os campos obrigatórios da pessoa';
      this.clearMessages();
      return false;
    }
    return true;
  }

  validateContato(): boolean {
    if (!this.novoContato.contato && !this.novoContato.email && !this.novoContato.celular) {
      this.error = 'Por favor, preencha pelo menos um campo de contato';
      this.clearMessages();
      return false;
    }
    return true;
  }

  validateEndereco(): boolean {
    if (!this.novoEndereco.cep || !this.novoEndereco.logradouro) {
      this.error = 'Por favor, preencha pelo menos o CEP e logradouro';
      this.clearMessages();
      return false;
    }
    return true;
  }

  // === RESET E LIMPEZA ===
  resetNovoContato(): void {
    this.novoContato = {
      codigo: 0,
      codigopesssoa: 0,
      email: '',
      site: '',
      ddd: '',
      celular: '',
      contato: ''
    };
  }

  resetNovoEndereco(): void {
    this.novoEndereco = {
      codigo: 0,
      codigopessoa: 0,
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    };
  }

  clearMessages(): void {
    setTimeout(() => {
      this.success = '';
      this.error = '';
    }, 3000);
  }

  voltar(): void {
    this.router.navigate(['/pessoas']);
  }
}