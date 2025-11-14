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
    codigo: 0,
    nome: '',
    documento: '',
    status: 1
  };

  contato: PessoaContato = {
    codigo: 0,
    codigopesssoa: 0,
    email: '',
    site: '',
    ddd: '',
    celular: '',
    excluido: false,
    tipo: ' '  // API espera espaço quando vazio
  };

  endereco: PessoaEndereco = {
    codigo: 0,
    codigopessoa: 0,
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

  /**
   * Obtém o userId do token JWT armazenado no localStorage
   */
  private getUserIdFromToken(): number | null {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token não encontrado no localStorage');
        return null;
      }

      // Decodificar o payload do JWT
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      // Extrair o userId do claim nameidentifier
      const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      
      if (userId) {
        const userIdNum = typeof userId === 'number' ? userId : parseInt(userId, 10);
        console.log('✅ userId extraído do token:', userIdNum);
        return userIdNum;
      }

      console.error('❌ userId não encontrado no token JWT');
      return null;
    } catch (error) {
      console.error('❌ Erro ao decodificar token JWT:', error);
      return null;
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
    console.log('onSubmit chamado!');
    console.log('Pessoa:', this.pessoa);
    console.log('Contato:', this.contato);
    console.log('Endereco:', this.endereco);

    if (!this.validateForm()) {
      console.log('Validação falhou');
      return;
    }

    console.log('Validação passou, iniciando gravação...');
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
    console.log('🆕 Iniciando criação de pessoa...');
    
    // Obter o userId do token JWT
    const userId = this.getUserIdFromToken();
    if (!userId) {
      this.notificationService.error('Erro de Autenticação', 'Não foi possível identificar o usuário logado. Faça login novamente.');
      this.loading = false;
      return;
    }
    
    // Definir o idUsuario na pessoa antes de enviar
    this.pessoa.idUsuario = userId;
    console.log('🆔 userId definido:', userId);
    console.log('📋 Dados da pessoa:', this.pessoa);
    
    this.pessoaService.createPessoa(this.pessoa).subscribe({
      next: (pessoaCriada) => {
        console.log('✅ Pessoa criada com sucesso:', pessoaCriada);
        
        const promises: Promise<any>[] = [];

        // Criar contato se preenchido
        if (this.contato.celular || this.contato.email) {
          console.log('📞 Criando contato...');
          this.contato.codigopesssoa = pessoaCriada.codigo;
          console.log('📋 Dados do contato:', this.contato);
          
          const contatoPromise = new Promise((resolve, reject) => {
            this.pessoaService.createContato(this.contato).subscribe({
              next: (contatoCriado) => {
                console.log('✅ Contato criado:', contatoCriado);
                resolve(contatoCriado);
              },
              error: (error) => {
                console.error('❌ Erro ao criar contato:', error);
                this.notificationService.warning('Aviso', 'Cliente criado, mas houve erro ao salvar o contato.');
                reject(error);
              }
            });
          });
          promises.push(contatoPromise);
        }

        // Criar endereço se preenchido
        if (this.endereco.cep || this.endereco.logradouro) {
          console.log('📍 Criando endereço...');
          this.endereco.codigopessoa = pessoaCriada.codigo;
          console.log('📋 Dados do endereço:', this.endereco);
          
          const enderecoPromise = new Promise((resolve, reject) => {
            this.pessoaService.createEndereco(this.endereco).subscribe({
              next: (enderecoCriado) => {
                console.log('✅ Endereço criado:', enderecoCriado);
                resolve(enderecoCriado);
              },
              error: (error) => {
                console.error('❌ Erro ao criar endereço:', error);
                this.notificationService.warning('Aviso', 'Cliente criado, mas houve erro ao salvar o endereço.');
                reject(error);
              }
            });
          });
          promises.push(enderecoPromise);
        }

        // Aguardar todas as operações
        Promise.allSettled(promises).then(() => {
          console.log('✅ Todas as operações concluídas');
          this.notificationService.success('Sucesso!', 'Cliente cadastrado com sucesso!');
          this.loading = false;
          
          setTimeout(() => {
            this.router.navigate(['/pessoas']);
          }, 1500);
        });
      },
      error: (error) => {
        console.error('❌ Erro ao criar pessoa:', error);
        console.error('Status:', error.status);
        console.error('Mensagem:', error.message);
        console.error('Erro completo:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao cadastrar cliente. Verifique os dados e tente novamente.');
        this.loading = false;
      }
    });
  }

  updatePessoa(): void {
    this.pessoaService.updatePessoa(this.pessoa.codigo, this.pessoa).subscribe({
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
    if (!this.pessoa.nome || !this.pessoa.documento) {
      this.error = 'Por favor, preencha todos os campos obrigatórios (Nome e Documento)';
      return false;
    }
    return true;
  }

  voltar(): void {
    this.router.navigate(['/pessoas']);
  }
}

