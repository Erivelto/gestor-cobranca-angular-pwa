import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { Cobranca } from '../models/api.models';
import { PessoaCobranca } from '../models/api.models';
import { PaginatedRequest } from '../models/api.models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const CACHE_TTL = 30_000; // 30 seconds

@Injectable({
  providedIn: 'root'
})
export class CobrancaService {
  private apiUrl = `${environment.apiUrl}/PessoaCobranca`;
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

  // GET: Buscar todas as cobranças
  getCobrancas(params?: PaginatedRequest): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    let url = `${this.apiUrl}/usuario/${usuarioId}?includeDeleted=false`;
    if (params) {
      url += `&pageIndex=${params.pageIndex}&pageSize=${params.pageSize}`;
      if (params.sortField) url += `&sortField=${params.sortField}`;
      if (params.sortDirection) url += `&sortDirection=${params.sortDirection}`;
    }
    const key = `cobrancas_${usuarioId}_${params?.pageIndex ?? ''}_${params?.pageSize ?? ''}`;
    return this.cached(key, () => this.http.get<Cobranca[]>(url));
  }

  // GET: Buscar cobrança por ID
  getCobrancaById(id: number): Observable<Cobranca> {
    return this.http.get<Cobranca>(`${this.apiUrl}/${id}`);
  }

  // POST: Criar nova cobrança
  createCobranca(payload: PessoaCobranca): Observable<PessoaCobranca> {
    return this.http.post<PessoaCobranca>(this.apiUrl, payload).pipe(
      tap(() => this.clearCache())
    );
  }

  // PUT: Atualizar cobrança existente
  updateCobranca(cobranca: PessoaCobranca | Cobranca): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, cobranca).pipe(
      tap(() => this.clearCache())
    );
  }

  // DELETE: Remover cobrança
  deleteCobranca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  // Métodos para buscar cobranças por status
  getAllAtrasadaLista(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.cached('atrasadaLista', () =>
      this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllAtrasadoLista/${usuarioId}`)
    );
  }

  getAllEmDiaLista(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.cached('emDiaLista', () =>
      this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllEmDiaLista/${usuarioId}`)
    );
  }

  getAllVenceHojeLista(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.cached('venceHojeLista', () =>
      this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllVenceHojeLista/${usuarioId}`)
    );
  }

  // Endpoints para Dashboard
  getAllEmDia(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.cached('emDia', () =>
      this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllEmDia/${usuarioId}`)
    );
  }

  getAllAtrasado(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.cached('atrasado', () =>
      this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllAtrasado/${usuarioId}`)
    );
  }

  getAllVenceHoje(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.cached('venceHoje', () =>
      this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllVenceHoje/${usuarioId}`)
    );
  }

  getAllJuros(): Observable<number> {
    const usuarioId = this.getUsuarioId();
    return this.cached('juros', () =>
      this.http.get<number>(`${this.apiUrl}/GetAllJuros/${usuarioId}`)
    );
  }
}

