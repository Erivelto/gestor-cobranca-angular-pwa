import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Pessoa, PessoaContato, PessoaEndereco, PessoaFile } from '../models/api.models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private apiUrl = `${environment.apiUrl}/Pessoa`;
  private contatoUrl = `${environment.apiUrl}/PessoaContato`;
  private enderecoUrl = `${environment.apiUrl}/PessoaEndereco`;
  private uploadUrl = `${environment.apiUrl}/PessoaUpload`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getUsuarioId(): number {
    return this.authService.getRequiredUserId();
  }

  // === MÉTODOS DE PESSOA ===
  getPessoas(includeDeleted: boolean = false): Observable<Pessoa[]> {
    const usuarioId = this.getUsuarioId();
    const listaEndpoint = `${this.apiUrl}/usuario/${usuarioId}?includeDeleted=${includeDeleted}`;

    return this.http.get<Pessoa[]>(listaEndpoint).pipe(
      map((data) => includeDeleted ? data : data.filter((p: any) => p?.status !== 0 && p?.excluido !== true))
    );
  }

  getPessoaById(id: number): Observable<Pessoa> {
    return this.http.get<Pessoa>(`${this.apiUrl}/${id}`);
  }

  createPessoa(pessoa: Pessoa): Observable<Pessoa> {
    return this.http.post<Pessoa>(this.apiUrl, pessoa);
  }

  updatePessoa(id: number, pessoa: Pessoa): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, pessoa);
  }

  deletePessoa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // === MÉTODOS DE CONTATO ===
  createContato(contato: PessoaContato): Observable<PessoaContato> {
    return this.http.post<PessoaContato>(this.contatoUrl, contato);
  }

  getContatosByPessoaId(pessoaId: number): Observable<PessoaContato[]> {
    return this.http.get<PessoaContato[]>(`${this.contatoUrl}/pessoa/${pessoaId}`);
  }

  updateContato(id: number, contato: PessoaContato): Observable<any> {
    return this.http.put(`${this.contatoUrl}/${id}`, contato);
  }

  deleteContato(id: number): Observable<any> {
    return this.http.delete(`${this.contatoUrl}/${id}`);
  }

  // === MÉTODOS DE ENDEREÇO ===
  createEndereco(endereco: PessoaEndereco): Observable<PessoaEndereco> {
    return this.http.post<PessoaEndereco>(this.enderecoUrl, endereco);
  }

  getEnderecosByPessoaId(pessoaId: number): Observable<PessoaEndereco[]> {
    return this.http.get<PessoaEndereco[]>(this.enderecoUrl).pipe(
      map((enderecos) => (enderecos || []).filter((e) => Number(e.codigoPessoa) === Number(pessoaId)))
    );
  }

  updateEndereco(id: number, endereco: PessoaEndereco): Observable<any> {
    return this.http.put(`${this.enderecoUrl}/${id}`, endereco);
  }

  deleteEndereco(id: number): Observable<any> {
    return this.http.delete(`${this.enderecoUrl}/${id}`);
  }

  // === MÉTODOS DE UPLOAD (PessoaFile) ===
  createPessoaUpload(pessoaFile: PessoaFile): Observable<any> {
    return this.http.post<any>(this.uploadUrl, pessoaFile);
  }
}

