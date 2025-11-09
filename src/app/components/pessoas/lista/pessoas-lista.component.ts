import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PessoaService } from '../../../services/pessoa.service';
import { Pessoa } from '../../../models/api.models';

@Component({
  selector: 'app-pessoas-lista',
  templateUrl: './pessoas-lista.component.html',
  styleUrls: ['./pessoas-lista.component.css'],
  standalone: false
})
export class PessoasListaComponent implements OnInit {
  pessoas: Pessoa[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private pessoaService: PessoaService,
    private router: Router
  ) {}

  // Método de teste para debug da API
  testarAPI(): void {
    console.log('=== TESTE DIRETO DA API ===');
    this.pessoaService.getPessoas().subscribe({
      next: (response) => {
        console.log('Resposta direta da API:', response);
        console.log('Tipo da resposta:', typeof response);
        console.log('É array?', Array.isArray(response));
        if (Array.isArray(response) && response.length > 0) {
          console.log('Primeiro item:', response[0]);
          console.log('Propriedades do primeiro item:', Object.keys(response[0]));
        }
      },
      error: (error) => {
        console.error('Erro no teste da API:', error);
      }
    });
  }

  ngOnInit(): void {
    this.loadPessoas();
  }

  loadPessoas(): void {
    this.loading = true;
    this.error = '';

    this.pessoaService.getPessoas().subscribe({
      next: (response) => {
        console.log('=== RESPOSTA COMPLETA DA API ===');
        console.log('Response type:', typeof response);
        console.log('Response:', response);
        
        // Verificar se é array ou objeto
        let pessoas: Pessoa[] = [];
        
        if (Array.isArray(response)) {
          pessoas = response;
        } else if (response && typeof response === 'object' && 'data' in response) {
          // Se a API retornar um wrapper com propriedade 'data'
          pessoas = (response as any).data || [];
        } else if (response && typeof response === 'object' && 'pessoas' in response) {
          // Se a API retornar um wrapper com propriedade 'pessoas'
          pessoas = (response as any).pessoas || [];
        } else {
          pessoas = [];
        }
        
        console.log('=== PESSOAS PROCESSADAS ===');
        console.log('Quantidade de pessoas:', pessoas.length);
        pessoas.forEach((pessoa, index) => {
          console.log(`Pessoa ${index}:`, {
            objetoCompleto: pessoa,
            id: pessoa.id,
            nome: pessoa.nome,
            codigo: pessoa.codigo,
            tipoId: typeof pessoa.id,
            hasId: !!pessoa.id,
            propriedades: Object.keys(pessoa)
          });
        });
        
        this.pessoas = pessoas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pessoas:', error);
        this.error = 'Erro ao carregar clientes. Tente novamente.';
        this.loading = false;
      }
    });
  }

  novaPessoa(): void {
    this.router.navigate(['/pessoas/nova']);
  }

  editarPessoa(codigo: string | number | undefined): void {
    console.log('=== MÉTODO EDITAR PESSOA SIMPLES CHAMADO ===');
    console.log('Código recebido:', codigo);
    console.log('Tipo do código:', typeof codigo);
    console.log('Router disponível:', !!this.router);
    
    if (!codigo) {
      console.error('Código não fornecido ou inválido');
      alert('Erro: Código da pessoa não encontrado');
      return;
    }
    
    console.log('Navegando para:', ['/pessoas/editar', codigo]);
    
    try {
      this.router.navigate(['/pessoas/editar', codigo]).then(
        (success) => {
          console.log('Navegação bem-sucedida:', success);
        },
        (error) => {
          console.error('Erro na promise de navegação:', error);
        }
      );
    } catch (error) {
      console.error('Erro na navegação:', error);
    }
  }

  editarPessoaAvancado(codigo: string | number | undefined): void {
    console.log('=== MÉTODO EDITAR PESSOA AVANÇADO CHAMADO ===');
    console.log('Código recebido:', codigo);
    console.log('Tipo do código:', typeof codigo);
    console.log('Router disponível:', !!this.router);
    
    if (!codigo) {
      console.error('Código não fornecido ou inválido');
      alert('Erro: Código da pessoa não encontrado');
      return;
    }
    
    console.log('Navegando para:', ['/pessoas/edit', codigo]);
    
    try {
      this.router.navigate(['/pessoas/edit', codigo]).then(
        (success) => {
          console.log('Navegação bem-sucedida:', success);
        },
        (error) => {
          console.error('Erro na promise de navegação:', error);
        }
      );
    } catch (error) {
      console.error('Erro na navegação:', error);
    }
  }

  deletarPessoa(codigo: string | number | undefined): void {
    if (!codigo) {
      alert('Erro: Código da pessoa não encontrado');
      return;
    }
    
    // Converter para number se necessário
    const id = typeof codigo === 'string' ? parseInt(codigo) : codigo;
    
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.pessoaService.deletePessoa(id).subscribe({
        next: () => {
          this.loadPessoas();
        },
        error: (error) => {
          console.error('Erro ao excluir pessoa:', error);
          alert('Erro ao excluir cliente. Tente novamente.');
        }
      });
    }
  }

  getStatusText(status?: number): string {
    return status === 1 ? 'Ativo' : 'Inativo';
  }

  getStatusClass(status?: number): string {
    return status === 1 ? 'badge-success' : 'badge-secondary';
  }
}

