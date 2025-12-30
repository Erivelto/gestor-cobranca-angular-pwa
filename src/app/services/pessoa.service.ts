import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Pessoa, PessoaContato, PessoaEndereco, PessoaFile } from '../models/api.models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private apiUrl = `${environment.apiUrl}/Pessoa`;
  private contatoUrl = 'https://controlepesssoalapi-d8g6bbhedcd3cvfk.eastus-01.azurewebsites.net/api/PessoaContato';
  private enderecoUrl = 'https://controlepesssoalapi-d8g6bbhedcd3cvfk.eastus-01.azurewebsites.net/api/PessoaEndereco';
  private uploadUrl = 'https://controlepesssoalapi-d8g6bbhedcd3cvfk.eastus-01.azurewebsites.net/api/PessoaUpload';

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
  getPessoas(includeDeleted: boolean = false): Observable<Pessoa[]> {
    const usuarioId = this.authService.currentUserValue?.id ?? 1;
    const listaEndpoint = `${this.apiUrl}/usuario/${usuarioId}?includeDeleted=${includeDeleted}`;

    return this.http.get<Pessoa[]>(listaEndpoint, { headers: this.getHeaders() }).pipe(
      map((data) => includeDeleted ? data : data.filter((p: any) => p?.status !== 0 && p?.excluido !== true))
    );
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
    // Tenta o endpoint específico; se 404, cai para a lista completa e filtra pelo código da pessoa
    const headers = this.getHeaders();
    return this.http.get<PessoaEndereco[]>(`${this.enderecoUrl}/pessoa/${pessoaId}`, { headers }).pipe(
      catchError((err) => {
        if (err.status === 404) {
          return this.http.get<PessoaEndereco[]>(this.enderecoUrl, { headers });
        }
        return throwError(() => err);
      }),
      map((enderecos) => (enderecos || []).filter((e) => Number(e.codigoPessoa) === Number(pessoaId)))
    );
  }

  updateEndereco(id: number, endereco: PessoaEndereco): Observable<any> {
    return this.http.put(`${this.enderecoUrl}/${id}`, endereco, { headers: this.getHeaders() });
  }

  deleteEndereco(id: number): Observable<any> {
    return this.http.delete(`${this.enderecoUrl}/${id}`, { headers: this.getHeaders() });
  }

  // === MÉTODOS DE UPLOAD (PessoaFile) ===
  createPessoaUpload(pessoaFile: PessoaFile): Observable<any> {
    return this.http.post<any>(this.uploadUrl, pessoaFile, { headers: this.getHeaders() });
  }
}

