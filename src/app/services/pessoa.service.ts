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
  private contatoUrl = `${environment.apiUrl}/PessoaContato`;
  private enderecoUrl = `${environment.apiUrl}/PessoaEndereco`;

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
    const usuarioId = this.authService.currentUserValue?.id ?? 1;
    const listaEndpoint = `${this.apiUrl}/usuario/${usuarioId}?includeDeleted=false`;
    console.log('👤 UsuarioId:', usuarioId);
    console.log('🌐 URL da API (lista pessoas):', listaEndpoint);
    console.log('🔑 Token disponível:', !!this.authService.token);
    
    return this.http.get<Pessoa[]>(listaEndpoint, { headers: this.getHeaders() });
  }

  getPessoaById(id: number): Observable<Pessoa> {
    return this.http.get<Pessoa>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createPessoa(pessoa: Pessoa): Observable<Pessoa> {
    console.log('📝 PessoaService.createPessoa() - Iniciando');
    console.log('👤 currentUserValue:', this.authService.currentUserValue);
    console.log('🔑 Token disponível:', !!this.authService.token);
    
    // Tentar obter o userId de múltiplas fontes
    const userIdFromAuth = this.authService.currentUserValue?.id;
    const userIdFromStorage = localStorage.getItem('userId');
    const userIdParsed = userIdFromStorage ? parseInt(userIdFromStorage, 10) : null;
    
    console.log('🆔 userId do AuthService:', userIdFromAuth);
    console.log('💾 userId do localStorage (raw):', userIdFromStorage);
    console.log('💾 userId do localStorage (parsed):', userIdParsed);
    
    // Usar o primeiro valor válido encontrado
    let userId: number | undefined;
    if (userIdFromAuth && userIdFromAuth > 0) {
      userId = userIdFromAuth;
    } else if (userIdParsed && userIdParsed > 0) {
      userId = userIdParsed;
    } else {
      console.warn('⚠️ AVISO: userId não encontrado! Usando undefined.');
      userId = undefined;
    }
    
    console.log('✅ userId final que será enviado:', userId);
    
    const payload: Pessoa = {
      ...pessoa,
      idUsuario: userId
    };
    
    console.log('📦 Payload completo:', payload);
    return this.http.post<Pessoa>(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  updatePessoa(id: number, pessoa: Pessoa): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, pessoa, { headers: this.getHeaders() });
  }

  deletePessoa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // === MÉTODOS DE CONTATO ===
  createContato(contato: PessoaContato): Observable<PessoaContato> {
    // A API espera o formato com 'codigoPessoa', 'excluido' e 'tipo' (espaco quando vazio)
    const payload: any = {
      codigo: contato.codigo ?? 0,
      codigoPessoa: (contato as any).codigoPessoa ?? contato.codigopesssoa ?? (contato as any).codigopessoa ?? 0,
      email: contato.email ?? '',
      site: contato.site ?? '',
      ddd: contato.ddd ?? '',
      celular: contato.celular ?? '',
      excluido: false,
      // A API requisitou tipo = " " (um espaço) quando não informado
      tipo: (contato.tipo !== undefined && contato.tipo !== null)
        ? (String(contato.tipo).trim() === '' ? ' ' : String(contato.tipo))
        : ' '
    };

    return this.http.post<PessoaContato>(this.contatoUrl, payload, { headers: this.getHeaders() });
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
    // Normalizar payload para a API
    const payload: any = {
      codigo: endereco.codigo ?? 0,
      codigoPessoa: endereco.codigopessoa ?? 0,
      tipo: endereco.tipo ?? 'R',
      logradouro: endereco.logradouro ?? '',
      numrero: endereco.numrero ?? '',  // API usa "numrero" (com erro ortográfico)
      complemento: endereco.complemento ?? '',
      bairro: endereco.bairro ?? '',
      cidade: endereco.cidade ?? '',
      uf: endereco.uf ?? '',
      cep: endereco.cep ?? '',
      excluido: false
    };
    
    console.log('📍 Payload de endereço normalizado:', payload);
    return this.http.post<PessoaEndereco>(this.enderecoUrl, payload, { headers: this.getHeaders() });
  }

  getEnderecosByPessoaId(pessoaId: number): Observable<PessoaEndereco[]> {
    return this.http.get<PessoaEndereco[]>(`${this.enderecoUrl}/pessoa/${pessoaId}`, { headers: this.getHeaders() });
  }

  updateEndereco(id: number, endereco: PessoaEndereco): Observable<any> {
    return this.http.put(`${this.enderecoUrl}/${id}`, endereco, { headers: this.getHeaders() });
  }

  deleteEndereco(id: number): Observable<any> {
    return this.http.delete(`${this.enderecoUrl}/${id}`, { headers: this.getHeaders() });
  }
}

