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

  getCobrancas(): Observable<Cobranca[]> {
    // Como o endpoint de Cobrança não existe na API, vamos retornar dados simulados
    const cobrancasSimuladas: Cobranca[] = [
      {
        codigo: 1,
        codigoPessoa: 1,
        tipoCobranca: 'Serviços de consultoria',
        valor: 1500.00,
        juros: 0,
        dataVencimento: '2025-11-15T00:00:00.000Z',
        dataPagamento: null,
        status: 1,
        excluido: false
      },
      {
        codigo: 2,
        codigoPessoa: 2,
        tipoCobranca: 'Desenvolvimento de sistema',
        valor: 3000.00,
        juros: 0,
        dataVencimento: '2025-10-30T00:00:00.000Z',
        dataPagamento: null,
        status: 2,
        excluido: false
      },
      {
        codigo: 3,
        codigoPessoa: 1,
        tipoCobranca: 'Manutenção mensal',
        valor: 800.00,
        juros: 0,
        dataVencimento: '2025-11-01T00:00:00.000Z',
        dataPagamento: '2025-11-01T00:00:00.000Z',
        status: 0,
        excluido: false
      },
      {
        codigo: 4,
        codigoPessoa: 3,
        tipoCobranca: 'Treinamento técnico',
        valor: 2200.00,
        juros: 0,
        dataVencimento: '2025-11-20T00:00:00.000Z',
        dataPagamento: null,
        status: 1,
        excluido: false
      },
      {
        codigo: 5,
        codigoPessoa: 2,
        tipoCobranca: 'Licença de software',
        valor: 500.00,
        juros: 0,
        dataVencimento: '2025-10-15T00:00:00.000Z',
        dataPagamento: null,
        status: 2,
        excluido: false
      }
    ];
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(cobrancasSimuladas);
        observer.complete();
      }, 1000); // Simula delay da API
    });
  }

  getCobrancaById(id: number): Observable<Cobranca> {
    return this.http.get<Cobranca>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createCobranca(payload: PessoaCobranca): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  updateCobranca(id: number, cobranca: Cobranca): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, cobranca, { headers: this.getHeaders() });
  }

  deleteCobranca(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

