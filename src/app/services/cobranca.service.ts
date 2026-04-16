import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cobranca } from '../models/api.models';
import { PessoaCobranca } from '../models/api.models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CobrancaService {
  private apiUrl = `${environment.apiUrl}/PessoaCobranca`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getUsuarioId(): number {
    const id = this.authService.currentUserValue?.id
      ?? Number(localStorage.getItem('userId'));
    if (!id || isNaN(id) || id <= 0) {
      throw new Error('Usuário não autenticado. Faça login novamente.');
    }
    return id;
  }

  // GET: Buscar todas as cobranças
  getCobrancas(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.http.get<Cobranca[]>(
      `${this.apiUrl}/usuario/${usuarioId}?includeDeleted=false`
    );
  }

  // GET: Buscar cobrança por ID
  getCobrancaById(id: number): Observable<Cobranca> {
    return this.http.get<Cobranca>(`${this.apiUrl}/${id}`);
  }

  // POST: Criar nova cobrança
  createCobranca(payload: PessoaCobranca): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  // PUT: Atualizar cobrança existente
  updateCobranca(cobranca: PessoaCobranca): Observable<any> {
    return this.http.put(`${this.apiUrl}`, cobranca);
  }

  // DELETE: Remover cobrança
  deleteCobranca(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAllCobrancas(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.http.get<Cobranca[]>(
      `${this.apiUrl}/usuario/${usuarioId}?includeDeleted=false`
    );
  }

  // Métodos para buscar cobranças por status
  getAllAtrasadaLista(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllAtrasadoLista/${usuarioId}`);
  }

  getAllEmDiaLista(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllEmDiaLista/${usuarioId}`);
  }

  getAllVenceHojeLista(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllVenceHojeLista/${usuarioId}`);
  }

  // Endpoints para Dashboard
  getAllEmDia(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllEmDia/${usuarioId}`);
  }

  getAllAtrasado(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllAtrasado/${usuarioId}`);
  }

  getAllVenceHoje(): Observable<Cobranca[]> {
    const usuarioId = this.getUsuarioId();
    return this.http.get<Cobranca[]>(`${this.apiUrl}/GetAllVenceHoje/${usuarioId}`);
  }

  getAllJuros(): Observable<number> {
    const usuarioId = this.getUsuarioId();
    return this.http.get<number>(`${this.apiUrl}/GetAllJuros/${usuarioId}`);
  }
}

