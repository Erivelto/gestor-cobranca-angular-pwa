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
    return this.http.get<Pessoa[]>(this.apiUrl, { headers: this.getHeaders() });
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
    return this.http.get<PessoaEndereco[]>(`${this.enderecoUrl}/pessoa/${pessoaId}`, { headers: this.getHeaders() });
  }

  updateEndereco(id: number, endereco: PessoaEndereco): Observable<any> {
    return this.http.put(`${this.enderecoUrl}/${id}`, endereco, { headers: this.getHeaders() });
  }

  deleteEndereco(id: number): Observable<any> {
    return this.http.delete(`${this.enderecoUrl}/${id}`, { headers: this.getHeaders() });
  }
}

