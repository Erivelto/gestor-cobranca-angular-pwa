import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pessoa, PessoaContato, PessoaEndereco } from '../models/api.models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private apiUrl = `${environment.apiUrl}/Pessoa`;
  private contatoUrl = 'https://controlepesssoalapi-d8g6bbhedcd3cvfk.eastus-01.azurewebsites.net/api/PessoaContato';
  private enderecoUrl = 'https://controlepesssoalapi-d8g6bbhedcd3cvfk.eastus-01.azurewebsites.net/api/PessoaEndereco';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // === MÉTODOS DE PESSOA ===
  getPessoas(): Observable<Pessoa[]> {
    console.log('🔍 PessoaService.getPessoas() - Iniciando requisição');
    console.log('🌐 URL da API:', this.apiUrl);
    console.log('🔑 Token disponível:', !!this.authService.token);
    
    return new Observable(observer => {
      console.log('📡 Fazendo requisição HTTP...');
      
      // Primeiro tenta a API real
      this.http.get<Pessoa[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
        next: (data) => {
          console.log('✅ Resposta da API recebida:', data);
          observer.next(data);
          observer.complete();
        },
        error: (error) => {
          console.error('❌ Erro na API, usando dados mock:', error);
          
          // Se falhar, usa dados mock
          const mockPessoas: Pessoa[] = [
            {
              id: 1,
              codigo: 'PES001',
              nome: 'João Silva Santos',
              documento: '123.456.789-01',
              status: 1,
              contatos: [{
                codigo: 1,
                codigoPessoa: 1,
                email: 'joao@email.com',
                ddd: '11',
                celular: '99999-9999'
              }],
              enderecos: [{
                codigo: 1,
                codigoPessoa: 1,
                tipo: 'Residencial',
                logradouro: 'Rua das Flores, 123',
                bairro: 'Centro',
                cidade: 'São Paulo',
                uf: 'SP',
                cep: '01000-000'
              }]
            },
            {
              id: 2,
              codigo: 'PES002',
              nome: 'Maria Oliveira Costa',
              documento: '987.654.321-09',
              status: 1,
              contatos: [{
                codigo: 2,
                codigoPessoa: 2,
                email: 'maria@email.com',
                ddd: '11',
                celular: '88888-8888'
              }]
            },
            {
              id: 3,
              codigo: 'PES003',
              nome: 'Pedro Almeida Souza',
              documento: '111.222.333-44',
              status: 0,
              contatos: [{
                codigo: 3,
                codigoPessoa: 3,
                email: 'pedro@email.com',
                ddd: '21',
                celular: '77777-7777'
              }]
            },
            {
              id: 4,
              codigo: 'PES004',
              nome: 'Ana Carolina Lima',
              documento: '555.666.777-88',
              status: 1
            },
            {
              id: 5,
              codigo: 'PES005',
              nome: 'Carlos Eduardo Ferreira',
              documento: '999.888.777-66',
              status: 1
            }
          ];
          
          console.log('🎭 Retornando dados mock:', mockPessoas);
          observer.next(mockPessoas);
          observer.complete();
        }
      });
    });
  }

  getPessoaById(id: number): Observable<Pessoa> {
    return this.http.get<Pessoa>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createPessoa(pessoa: Pessoa): Observable<Pessoa> {
    return this.http.post<Pessoa>(this.apiUrl, pessoa, { headers: this.getHeaders() });
  }

  updatePessoa(id: number, pessoa: Pessoa): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, pessoa, { headers: this.getHeaders() });
  }

  deletePessoa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // === MÉTODOS DE CONTATO ===
  createContato(contato: PessoaContato): Observable<PessoaContato> {
    return this.http.post<PessoaContato>(this.contatoUrl, contato, { headers: this.getHeaders() });
  }

  getContatosByPessoaId(pessoaId: number): Observable<PessoaContato[]> {
    return this.http.get<PessoaContato[]>(`${this.contatoUrl}/pessoa/${pessoaId}`, { headers: this.getHeaders() });
  }

  updateContato(id: number, contato: PessoaContato): Observable<any> {
    return this.http.put(`${this.contatoUrl}/${id}`, contato, { headers: this.getHeaders() });
  }

  deleteContato(id: number): Observable<any> {
    return this.http.delete(`${this.contatoUrl}/${id}`, { headers: this.getHeaders() });
  }

  // === MÉTODOS DE ENDEREÇO ===
  createEndereco(endereco: PessoaEndereco): Observable<PessoaEndereco> {
    return this.http.post<PessoaEndereco>(this.enderecoUrl, endereco, { headers: this.getHeaders() });
  }

  getEnderecosByPessoaId(pessoaId: number): Observable<PessoaEndereco[]> {
    return this.http.get<PessoaEndereco[]>(this.enderecoUrl, { headers: this.getHeaders() });
  }

  updateEndereco(id: number, endereco: PessoaEndereco): Observable<any> {
    return this.http.put(`${this.enderecoUrl}/${id}`, endereco, { headers: this.getHeaders() });
  }

  deleteEndereco(id: number): Observable<any> {
    return this.http.delete(`${this.enderecoUrl}/${id}`, { headers: this.getHeaders() });
  }
}

