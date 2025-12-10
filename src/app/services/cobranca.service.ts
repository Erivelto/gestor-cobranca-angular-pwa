import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // GET: Buscar todas as cobranças
getCobrancas(): Observable<Cobranca[]> {
  const usuarioId = this.authService.currentUserValue?.id ?? 
                    Number(localStorage.getItem('userId')) ?? 1;
  const url = `${this.apiUrl}/usuario/${usuarioId}?includeDeleted=false`;
  
  console.log('🔍 CobrancaService.getCobrancas() - usuarioId:', usuarioId);
  console.log('📡 URL:', url);
  
  return this.http.get<Cobranca[]>(url, { headers: this.getHeaders() });
}

  // GET: Buscar cobrança por ID
  getCobrancaById(id: number): Observable<Cobranca> {
    return this.http.get<Cobranca>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // POST: Criar nova cobrança
  createCobranca(payload: PessoaCobranca): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  // PUT: Atualizar cobrança existente
  updateCobranca( cobranca: PessoaCobranca): Observable<any> {
    return this.http.put(`${this.apiUrl}`, cobranca, { headers: this.getHeaders() });
  }

  // DELETE: Remover cobrança
  deleteCobranca(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Método para buscar todas as cobranças (usa o endpoint existente)
  // O backend fará a filtragem por status quando os endpoints específicos estiverem disponíveis
  getAllCobrancas(): Observable<Cobranca[]> {
    const usuarioId = this.authService.currentUserValue?.id ?? Number(localStorage.getItem('userId')) ?? 1;
    const url = `${this.apiUrl}/usuario/${usuarioId}?includeDeleted=false`;
    return this.http.get<Cobranca[]>(url, { headers: this.getHeaders() });
  }

  // Métodos para buscar cobranças por status específicos (agora disponíveis no backend)
  getAllAtrasadaLista(): Observable<Cobranca[]> {
    const usuarioId = this.authService.currentUserValue?.id ?? Number(localStorage.getItem('userId')) ?? 1;
    const url = `${this.apiUrl}/GetAllAtrasadoLista/${usuarioId}`;
    console.log('📡 Chamando endpoint de atrasados:', url);
    return this.http.get<Cobranca[]>(url, { headers: this.getHeaders() });
  }

  getAllEmDiaLista(): Observable<Cobranca[]> {
    const usuarioId = this.authService.currentUserValue?.id ?? Number(localStorage.getItem('userId')) ?? 1;
    const url = `${this.apiUrl}/GetAllEmDiaLista/${usuarioId}`;
    console.log('📡 Chamando endpoint em dia:', url);
    return this.http.get<Cobranca[]>(url, { headers: this.getHeaders() });
  }

  getAllVenceHojeLista(): Observable<Cobranca[]> {
    const usuarioId = this.authService.currentUserValue?.id ?? Number(localStorage.getItem('userId')) ?? 1;
    const url = `${this.apiUrl}/GetAllVenceHojeLista/${usuarioId}`;
    console.log('📡 Chamando endpoint vence hoje:', url);
    return this.http.get<Cobranca[]>(url, { headers: this.getHeaders() });
  }

  // Endpoints para Dashboard (sem "Lista")
  getAllEmDia(): Observable<Cobranca[]> {
    const usuarioId = this.authService.currentUserValue?.id ?? Number(localStorage.getItem('userId')) ?? 1;
    const url = `${this.apiUrl}/GetAllEmDia/${usuarioId}`;
    console.log('📡 Chamando endpoint em dia (dashboard):', url);
    return this.http.get<Cobranca[]>(url, { headers: this.getHeaders() });
  }

  getAllAtrasado(): Observable<Cobranca[]> {
    const usuarioId = this.authService.currentUserValue?.id ?? Number(localStorage.getItem('userId')) ?? 1;
    const url = `${this.apiUrl}/GetAllAtrasado/${usuarioId}`;
    console.log('📡 Chamando endpoint atrasado (dashboard):', url);
    return this.http.get<Cobranca[]>(url, { headers: this.getHeaders() });
  }

  getAllVenceHoje(): Observable<Cobranca[]> {
    const usuarioId = this.authService.currentUserValue?.id ?? Number(localStorage.getItem('userId')) ?? 1;
    const url = `${this.apiUrl}/GetAllVenceHoje/${usuarioId}`;
    console.log('📡 Chamando endpoint vence hoje (dashboard):', url);
    return this.http.get<Cobranca[]>(url, { headers: this.getHeaders() });
  }
}

