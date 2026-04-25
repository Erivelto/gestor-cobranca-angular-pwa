import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { Pessoa, PessoaContato, PessoaEndereco, PessoaFile, PaginatedRequest } from '../models/api.models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const CACHE_TTL = 30_000; // 30 seconds

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private apiUrl = `${environment.apiUrl}/Pessoa`;
  private contatoUrl = `${environment.apiUrl}/PessoaContato`;
  private enderecoUrl = `${environment.apiUrl}/PessoaEndereco`;
  private uploadUrl = `${environment.apiUrl}/PessoaUpload`;
  private cache = new Map<string, { obs: Observable<unknown>; ts: number }>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getUsuarioId(): number {
    return this.authService.getRequiredUserId();
  }

  private cached<T>(key: string, factory: () => Observable<T>): Observable<T> {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) {
      return entry.obs as Observable<T>;
    }
    const obs = factory().pipe(shareReplay({ bufferSize: 1, refCount: false }));
    this.cache.set(key, { obs, ts: Date.now() });
    return obs;
  }

  clearCache(): void {
    this.cache.clear();
  }

  // === MÉTODOS DE PESSOA ===
  getPessoas(includeDeleted: boolean = false, params?: PaginatedRequest): Observable<Pessoa[]> {
    const usuarioId = this.getUsuarioId();
    let listaEndpoint = `${this.apiUrl}/usuario/${usuarioId}?includeDeleted=${includeDeleted}`;
    if (params) {
      listaEndpoint += `&pageIndex=${params.pageIndex}&pageSize=${params.pageSize}`;
      if (params.sortField) listaEndpoint += `&sortField=${params.sortField}`;
      if (params.sortDirection) listaEndpoint += `&sortDirection=${params.sortDirection}`;
    }

    const key = `pessoas_${usuarioId}_${includeDeleted}_${params?.pageIndex ?? ''}_${params?.pageSize ?? ''}`;
    return this.cached(key, () =>
      this.http.get<Pessoa[]>(listaEndpoint).pipe(
        map((data) => includeDeleted ? data : data.filter((p) => p?.status !== 0 && p?.excluido !== true))
      )
    );
  }

  getPessoaById(id: number): Observable<Pessoa> {
    return this.http.get<Pessoa>(`${this.apiUrl}/${id}`);
  }

  createPessoa(pessoa: Pessoa): Observable<Pessoa> {
    return this.http.post<Pessoa>(this.apiUrl, pessoa).pipe(
      tap(() => this.clearCache())
    );
  }

  updatePessoa(id: number, pessoa: Pessoa): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, pessoa).pipe(
      tap(() => this.clearCache())
    );
  }

  deletePessoa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  // === MÉTODOS DE CONTATO ===
  createContato(contato: PessoaContato): Observable<PessoaContato> {
    return this.http.post<PessoaContato>(this.contatoUrl, contato);
  }

  getContatosByPessoaId(pessoaId: number): Observable<PessoaContato[]> {
    return this.http.get<PessoaContato[]>(`${this.contatoUrl}/pessoa/${pessoaId}`);
  }

  updateContato(id: number, contato: PessoaContato): Observable<void> {
    return this.http.put<void>(`${this.contatoUrl}/${id}`, contato);
  }

  deleteContato(id: number): Observable<void> {
    return this.http.delete<void>(`${this.contatoUrl}/${id}`);
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

  updateEndereco(id: number, endereco: PessoaEndereco): Observable<void> {
    return this.http.put<void>(`${this.enderecoUrl}/${id}`, endereco);
  }

  deleteEndereco(id: number): Observable<void> {
    return this.http.delete<void>(`${this.enderecoUrl}/${id}`);
  }

  // === MÉTODOS DE UPLOAD (PessoaFile) ===
  createPessoaUpload(pessoaFile: PessoaFile): Observable<PessoaFile> {
    return this.http.post<PessoaFile>(this.uploadUrl, pessoaFile);
  }
}

