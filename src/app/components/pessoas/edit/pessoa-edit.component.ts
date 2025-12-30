import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PessoaService } from '../../../services/pessoa.service';
import { ViaCepService } from '../../../services/viacep.service';
import { NotificationService } from '../../../services/notification.service';
import { Pessoa, PessoaContato, PessoaEndereco } from '../../../models/api.models';

@Component({
  selector: 'app-pessoa-edit',
  templateUrl: './pessoa-edit.component.html',
  styleUrls: ['./pessoa-edit.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ]
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
    codigoPessoa: 0,
    email: '',
    site: '',
    ddd: '',
    celular: '',
    excluido: false,
    tipo: 'celular',
    dddAdic: '',
    celularAdic: '',
    descricaoAdic: ''
  };

  novoContatoAdic: PessoaContato = {
    codigo: 0,
    codigoPessoa: 0,
    email: '',
    site: '',
    ddd: '',
    celular: '',
    excluido: false,
    tipo: 'celular',
    dddAdic: '',
    celularAdic: '',
    descricaoAdic: ''
  };

  novoEndereco: PessoaEndereco = {
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

  loading: boolean = false;
  loadingCep: boolean = false;
  success: string = '';
  error: string = '';
  
  // Controles de exibição
  showAddContato: boolean = false;
  showAddContatoAdic: boolean = false;
  showAddEndereco: boolean = false;
  
  // Dados para edição inline
  editingContato: number | null = null;
  editingContatoAdic: number | null = null;
  editingEndereco: number | null = null;

  // Getter para contatos principais (que possuem dados principais preenchidos)
  get contatosPrincipais(): PessoaContato[] {
    return this.contatos.filter(c => c.ddd || c.celular || c.email || c.site);
  }

  // Getter para contatos com dados adicionais
  get contatosAdicionais(): PessoaContato[] {
    return this.contatos.filter(c => c.dddAdic || c.celularAdic || c.descricaoAdic);
  }

  constructor(
    private pessoaService: PessoaService,
    private viaCepService: ViaCepService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
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
        this.notificationService.error('Erro do Servidor', 'Erro ao carregar os dados do cliente. Tente novamente.');
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
        // Filtrar endereços da pessoa específica (usando codigopessoa conforme api.models.ts)
        this.enderecos = enderecos.filter(endereco => endereco.codigoPessoa === pessoaId);
      },
      error: (error) => {
        console.error('Erro ao carregar endereços:', error);
      }
    });
  }

  // === MÉTODOS DE PESSOA ===
  updatePessoa(): void {
    console.log('updatePessoa() chamado');
    
    if (!this.validatePessoa()) {
      console.log('Validação falhou');
      return;
    }

    console.log('Iniciando atualização...');
    this.loading = true;
    this.pessoaService.updatePessoa(this.pessoa.codigo, this.pessoa).subscribe({
      next: () => {
        console.log('Sucesso na atualização, chamando notificação...');
        this.notificationService.success('Sucesso!', 'Cliente atualizado com sucesso!');
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar pessoa:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao atualizar o cliente. Verifique os dados e tente novamente.');
        this.loading = false;
      }
    });
  }

  // === MÉTODOS DE CONTATO ===
  addContato(): void {
    if (!this.validateContato()) {
      return;
    }

    this.novoContato.codigoPessoa = this.pessoa.codigo;
    this.pessoaService.createContato(this.novoContato).subscribe({
      next: (contato) => {
        this.contatos.push(contato);
        this.resetNovoContato();
        this.showAddContato = false;
        this.notificationService.success('Sucesso!', 'Contato adicionado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao adicionar contato:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao adicionar contato. Tente novamente.');
      }
    });
  }

  editContato(index: number): void {
    this.editingContato = index;
  }

  saveContato(contato: PessoaContato): void {
    this.pessoaService.updateContato(contato.codigo!, contato).subscribe({
      next: () => {
        this.editingContato = null;
        this.notificationService.success('Sucesso!', 'Contato atualizado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao atualizar contato:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao atualizar contato. Tente novamente.');
      }
    });
  }

  deleteContato(id: number, index: number): void {
    this.notificationService.confirmDelete('Excluir contato', 'Deseja realmente excluir este contato?').then((result) => {
      if (result) {
        this.pessoaService.deleteContato(id).subscribe({
          next: () => {
            this.contatos.splice(index, 1);
            this.notificationService.success('Excluído!', 'Contato excluído com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao excluir contato:', error);
            this.notificationService.error('Erro do Servidor', 'Erro ao excluir contato. Tente novamente.');
          }
        });
      }
    });
  }

  // === MÉTODOS DE CONTATO ADICIONAL ===
  addContatoAdic(): void {
    if (!this.validateContatoAdic()) {
      return;
    }

    this.novoContatoAdic.codigoPessoa = this.pessoa.codigo;
    // Garantir que campos principais estejam vazios ao criar contato adicional
    this.novoContatoAdic.ddd = '';
    this.novoContatoAdic.celular = '';
    this.novoContatoAdic.email = '';
    this.novoContatoAdic.site = '';
    
    this.pessoaService.createContato(this.novoContatoAdic).subscribe({
      next: (contato) => {
        this.contatos.push(contato);
        this.resetNovoContatoAdic();
        this.showAddContatoAdic = false;
        this.notificationService.success('Sucesso!', 'Contato adicional adicionado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao adicionar contato adicional:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao adicionar contato adicional. Tente novamente.');
      }
    });
  }

  deleteContatoAdic(contato: PessoaContato): void {
    this.notificationService.confirmDelete('Excluir contato adicional', 'Deseja realmente excluir este contato adicional?').then((result) => {
      if (result) {
        // Limpar apenas os campos adicionais
        contato.dddAdic = '';
        contato.celularAdic = '';
        contato.descricaoAdic = '';

        // Atualizar o contato no servidor
        this.pessoaService.updateContato(contato.codigo!, contato).subscribe({
          next: () => {
            this.editingContatoAdic = null;
            this.notificationService.success('Excluído!', 'Contato adicional excluído com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao excluir contato adicional:', error);
            this.notificationService.error('Erro do Servidor', 'Erro ao excluir contato adicional. Tente novamente.');
          }
        });
      }
    });
  }

  // === MÉTODOS DE ENDEREÇO ===
  addEndereco(): void {
    if (!this.validateEndereco()) {
      return;
    }

    this.novoEndereco.codigoPessoa = this.pessoa.codigo;
    this.pessoaService.createEndereco(this.novoEndereco).subscribe({
      next: (endereco) => {
        this.enderecos.push(endereco);
        this.resetNovoEndereco();
        this.showAddEndereco = false;
        this.notificationService.success('Sucesso!', 'Endereço adicionado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao adicionar endereço:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao adicionar endereço. Tente novamente.');
      }
    });
  }

  editEndereco(index: number): void {
    this.editingEndereco = index;
  }

  saveEndereco(endereco: PessoaEndereco): void {
    this.pessoaService.updateEndereco(endereco.codigo!, endereco).subscribe({
      next: () => {
        this.editingEndereco = null;
        this.notificationService.success('Sucesso!', 'Endereço atualizado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao atualizar endereço:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao atualizar endereço. Tente novamente.');
      }
    });
  }

  deleteEndereco(id: number, index: number): void {
    this.notificationService.confirmDelete('Excluir endereço', 'Deseja realmente excluir este endereço?').then((result) => {
      if (result) {
        this.pessoaService.deleteEndereco(id).subscribe({
          next: () => {
            this.enderecos.splice(index, 1);
            this.notificationService.success('Excluído!', 'Endereço excluído com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao excluir endereço:', error);
            this.notificationService.error('Erro do Servidor', 'Erro ao excluir endereço. Tente novamente.');
          }
        });
      }
    });
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
          endereco.uf = response.uf;
        }
        this.loadingCep = false;
        this.clearMessages();
      },
      error: (error) => {
        console.error('Erro ao buscar CEP:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao buscar CEP. Verifique o CEP e tente novamente.');
        this.loadingCep = false;
      }
    });
  }

  getTipoContatoText(tipo?: string): string {
    if (!tipo) return 'Não informado';
    const tipos: {[key: string]: string} = {
      'celular': 'Celular',
      'telefone': 'Telefone', 
      'email': 'E-mail',
      'whatsapp': 'WhatsApp'
    };
    return tipos[tipo.toLowerCase()] || tipo;
  }

  formatDDD(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (value.length > 2) {
      value = value.substring(0, 2);
    }
    event.target.value = value;
    this.novoContato.ddd = value;
  }

  formatDDDAdic(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2);
    }
    event.target.value = value;
    this.novoContatoAdic.dddAdic = value;
  }

  formatTelefone(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    event.target.value = value;
    this.novoContato.celular = value;
  }

  formatTelefoneAdic(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    event.target.value = value;
    this.novoContatoAdic.celularAdic = value;
  }

  // === VALIDAÇÕES ===
  validatePessoa(): boolean {
    if (!this.pessoa.codigo || !this.pessoa.nome || !this.pessoa.documento) {
      this.notificationService.error('Dados Inválidos', 'Por favor, preencha todos os campos obrigatórios: Código, Nome e Documento.');
      return false;
    }
    return true;
  }

  validateContato(): boolean {
    // Validar DDD (obrigatório para telefone/celular)
    if (!this.novoContato.ddd || this.novoContato.ddd.length !== 2) {
      this.notificationService.error('Dados Inválidos', 'Por favor, preencha o DDD com 2 dígitos (exemplo: 11).');
      return false;
    }

    // Validar celular (obrigatório)
    if (!this.novoContato.celular || this.novoContato.celular.length < 8) {
      this.notificationService.error('Dados Inválidos', 'Por favor, preencha o número do telefone com pelo menos 8 dígitos.');
      return false;
    }

    // Validar email se o tipo for email
    if (this.novoContato.tipo === 'email') {
      if (!this.novoContato.email || !this.novoContato.email.includes('@')) {
        this.notificationService.error('Dados Inválidos', 'Por favor, preencha um email válido (exemplo: nome@email.com).');
        return false;
      }
    }

    return true;
  }

  validateContatoAdic(): boolean {
    // Validar se pelo menos DDD e celular adicional estão preenchidos
    if (!this.novoContatoAdic.dddAdic || this.novoContatoAdic.dddAdic.length !== 2) {
      this.notificationService.error('Dados Inválidos', 'Por favor, preencha o DDD adicional com 2 dígitos.');
      return false;
    }

    if (!this.novoContatoAdic.celularAdic || this.novoContatoAdic.celularAdic.length < 8) {
      this.notificationService.error('Dados Inválidos', 'Por favor, preencha o número do celular adicional.');
      return false;
    }

    return true;
  }

  validateEndereco(): boolean {
    if (!this.novoEndereco.cep || !this.novoEndereco.logradouro) {
      this.notificationService.error('Dados Inválidos', 'Por favor, preencha pelo menos o CEP e o logradouro do endereço.');
      return false;
    }
    
    if (!this.novoEndereco.numrero) {
      this.notificationService.error('Dados Inválidos', 'Por favor, preencha o número do endereço.');
      return false;
    }
    
    return true;
  }

  // === RESET E LIMPEZA ===
  resetNovoContato(): void {
    this.novoContato = {
      codigo: 0,
      codigoPessoa: 0,
      email: '',
      site: '',
      ddd: '',
      celular: '',
      excluido: false,
      tipo: 'celular',
      dddAdic: '',
      celularAdic: '',
      descricaoAdic: ''
    };
  }

  resetNovoContatoAdic(): void {
    this.novoContatoAdic = {
      codigo: 0,
      codigoPessoa: 0,
      email: '',
      site: '',
      ddd: '',
      celular: '',
      excluido: false,
      tipo: 'celular',
      dddAdic: '',
      celularAdic: '',
      descricaoAdic: ''
    };
  }

  resetNovoEndereco(): void {
    this.novoEndereco = {
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