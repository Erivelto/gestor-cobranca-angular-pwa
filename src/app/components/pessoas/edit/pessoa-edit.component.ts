import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { Pessoa, PessoaContato, PessoaEndereco } from '../../../models/api.models';
import { EditErrorModalComponent } from './error-dialog/edit-error-modal.component';
import { EditSuccessModalComponent } from './error-dialog/edit-success-modal.component';

@Component({
  selector: 'app-pessoa-edit',
  templateUrl: './pessoa-edit.component.html',
  styleUrls: ['./pessoa-edit.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
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
    codigo: '',
    nome: '',
    documento: '',
    status: 1
  };

  contatos: PessoaContato[] = [];
  enderecos: PessoaEndereco[] = [];
  
  novoContato: PessoaContato = {
    email: '',
    site: '',
    ddd: '',
    celular: '',
    excluido: false,
    tipo: 'celular'
  };

  novoEndereco: PessoaEndereco = {
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
  showAddEndereco: boolean = false;
  
  // Dados para edição inline
  editingContato: number | null = null;
  editingEndereco: number | null = null;

  constructor(
    private pessoaService: PessoaService,
    private viaCepService: ViaCepService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
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
        this.showErrorModal('Erro ao carregar os dados do cliente. Tente novamente.', 'Erro do Servidor');
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
    console.log('updatePessoa() chamado');
    
    if (!this.validatePessoa()) {
      console.log('Validação falhou');
      return;
    }

    console.log('Iniciando atualização...');
    this.loading = true;
    // Usar codigo em vez de id, pois a API retorna apenas codigo
    const pessoaId = this.pessoa.codigo ? parseInt(this.pessoa.codigo) : null;
    if (!pessoaId) {
      this.showErrorModal('ID da pessoa não encontrado. Não é possível salvar as alterações.', 'Dados Inválidos');
      this.loading = false;
      return;
    }

    this.pessoaService.updatePessoa(pessoaId, this.pessoa).subscribe({
      next: () => {
        console.log('Sucesso na atualização, chamando modal...');
        this.showSuccessModal('Cliente atualizado com sucesso!', 'Sucesso', 'Ótimo');
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar pessoa:', error); 
        this.showErrorModal('Erro ao atualizar o cliente. Verifique os dados e tente novamente.', 'Erro do Servidor');
        this.loading = false;
      }
    });
  }

  // === MÉTODOS DE CONTATO ===
  addContato(): void {
    if (!this.validateContato()) {
      return;
    }

    // Usar codigo convertido para number
    const pessoaId = this.pessoa.codigo ? parseInt(this.pessoa.codigo) : null;
    if (!pessoaId) {
      this.error = 'ID da pessoa não encontrado';
      this.clearMessages();
      return;
    }

    this.novoContato.codigoPessoa = pessoaId;
    
    // Log para debug
    console.log('Enviando contato:', JSON.stringify(this.novoContato, null, 2));
    console.log('Pessoa ID:', pessoaId);
    
    // Garantir que os campos obrigatórios não sejam undefined
    const contatoParaEnviar = {
      codigoPessoa: pessoaId,
      email: this.novoContato.email || '',
      site: this.novoContato.site || '',
      ddd: this.novoContato.ddd || '',
      celular: this.novoContato.celular || '',
      excluido: false,
      tipo: this.novoContato.tipo || 'celular'
    };
    
    console.log('Payload final:', JSON.stringify(contatoParaEnviar, null, 2));
    
    this.pessoaService.createContato(contatoParaEnviar).subscribe({
      next: (contato) => {
        this.contatos.push(contato);
        this.resetNovoContato();
        this.showAddContato = false;
        this.showSuccessModal('Contato adicionado com sucesso!', 'Sucesso', 'Ótimo');
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
    this.pessoaService.updateContato(contato.codigo!, contato).subscribe({
      next: () => {
        this.editingContato = null;
        this.showSuccessModal('Contato atualizado com sucesso!', 'Sucesso', 'Ótimo');
      },
      error: (error) => {
        console.error('Erro ao atualizar contato:', error);
        this.error = 'Erro ao atualizar contato';
        this.clearMessages();
      }
    });
  }

  deleteContato(id: number, index: number): void {
    if (confirm('Deseja realmente excluir este contato?')) {
      this.pessoaService.deleteContato(id).subscribe({
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

    // Usar codigo convertido para number
    const pessoaId = this.pessoa.codigo ? parseInt(this.pessoa.codigo) : null;
    if (!pessoaId) {
      this.error = 'ID da pessoa não encontrado';
      this.clearMessages();
      return;
    }

    this.novoEndereco.codigoPessoa = pessoaId;
    
    // Garantir que os campos obrigatórios não sejam undefined
    const enderecoParaEnviar = {
      codigoPessoa: pessoaId,
      tipo: this.novoEndereco.tipo || 'R',
      logradouro: this.novoEndereco.logradouro || '',
      numrero: this.novoEndereco.numrero || '',
      complemento: this.novoEndereco.complemento || '',
      bairro: this.novoEndereco.bairro || '',
      cidade: this.novoEndereco.cidade || '',
      uf: this.novoEndereco.uf || '',
      cep: this.novoEndereco.cep || '',
      excluido: false
    };
    
    console.log('Enviando endereço:', JSON.stringify(enderecoParaEnviar, null, 2));
    
    this.pessoaService.createEndereco(enderecoParaEnviar).subscribe({
      next: (endereco) => {
        this.enderecos.push(endereco);
        this.resetNovoEndereco();
        this.showAddEndereco = false;
        this.showSuccessModal('Endereço adicionado com sucesso!', 'Sucesso', 'Ótimo');
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
    this.pessoaService.updateEndereco(endereco.codigo!, endereco).subscribe({
      next: () => {
        this.editingEndereco = null;
        this.showSuccessModal('Endereço atualizado com sucesso!', 'Sucesso', 'Ótimo');
      },
      error: (error) => {
        console.error('Erro ao atualizar endereço:', error);
        this.error = 'Erro ao atualizar endereço';
        this.clearMessages();
      }
    });
  }

  deleteEndereco(id: number, index: number): void {
    if (confirm('Deseja realmente excluir este endereço?')) {
      this.pessoaService.deleteEndereco(id).subscribe({
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
          endereco.uf = response.uf;
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

  formatTelefone(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    event.target.value = value;
    this.novoContato.celular = value;
  }

  // === VALIDAÇÕES ===
  validatePessoa(): boolean {
    if (!this.pessoa.codigo || !this.pessoa.nome || !this.pessoa.documento) {
      this.showErrorModal('Por favor, preencha todos os campos obrigatórios: Código, Nome e Documento.', 'Dados Inválidos', 'Corrigir');
      return false;
    }
    return true;
  }

  validateContato(): boolean {
    // Validar DDD (obrigatório para telefone/celular)
    if (!this.novoContato.ddd || this.novoContato.ddd.length !== 2) {
      this.showErrorModal('Por favor, preencha o DDD com 2 dígitos (exemplo: 11).', 'Dados Inválidos', 'Corrigir');
      return false;
    }

    // Validar celular (obrigatório)
    if (!this.novoContato.celular || this.novoContato.celular.length < 8) {
      this.showErrorModal('Por favor, preencha o número do telefone com pelo menos 8 dígitos.', 'Dados Inválidos', 'Corrigir');
      return false;
    }

    // Validar email se o tipo for email
    if (this.novoContato.tipo === 'email') {
      if (!this.novoContato.email || !this.novoContato.email.includes('@')) {
        this.showErrorModal('Por favor, preencha um email válido (exemplo: nome@email.com).', 'Dados Inválidos', 'Corrigir');
        return false;
      }
    }

    return true;
  }

  validateEndereco(): boolean {
    if (!this.novoEndereco.cep || !this.novoEndereco.logradouro) {
      this.showErrorModal('Por favor, preencha pelo menos o CEP e o logradouro do endereço.', 'Dados Inválidos', 'Corrigir');
      return false;
    }
    
    if (!this.novoEndereco.numrero) {
      this.showErrorModal('Por favor, preencha o número do endereço.', 'Dados Inválidos', 'Corrigir');
      return false;
    }
    
    return true;
  }

  // === RESET E LIMPEZA ===
  resetNovoContato(): void {
    this.novoContato = {
      email: '',
      site: '',
      ddd: '',
      celular: '',
      excluido: false,
      tipo: 'celular'
    };
  }

  resetNovoEndereco(): void {
    this.novoEndereco = {
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

  private showErrorModal(message: string, title?: string, buttonText?: string): void {
    console.log('showErrorModal chamado');
    try {
      const dialogRef = this.dialog.open(EditErrorModalComponent, {
        width: '90%',
        maxWidth: '360px',
        data: { message, title, buttonText },
        panelClass: 'error-modal-panel'
      });
      console.log('Modal de erro aberto:', dialogRef);
    } catch (error) {
      console.error('Erro ao abrir modal de erro:', error);
      alert('ERRO: ' + message);
    }
  }

  private showSuccessModal(message: string, title?: string, buttonText?: string): void {
    console.log('showSuccessModal chamado com:', message, title, buttonText);
    try {
      const dialogRef = this.dialog.open(EditSuccessModalComponent, {
        width: '90%',
        maxWidth: '360px',
        data: { message, title, buttonText },
        panelClass: 'success-modal-panel'
      });
      console.log('Modal aberto:', dialogRef);
    } catch (error) {
      console.error('Erro ao abrir modal:', error);
      alert('FALLBACK: ' + message);
    }
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