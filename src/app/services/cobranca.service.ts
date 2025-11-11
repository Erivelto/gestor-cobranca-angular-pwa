import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cobranca } from '../models/api.models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CobrancaService {
  private apiUrl = `${environment.apiUrl}/Cobranca`;

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
        id: 1,
        pessoaId: 1,
        descricao: 'Serviços de consultoria',
        valor: 1500.00,
        dataVencimento: '2025-11-15',
        status: 1 // À Vencer
      },
      {
        id: 2,
        pessoaId: 2,
        descricao: 'Desenvolvimento de sistema',
        valor: 3000.00,
        dataVencimento: '2025-10-30',
        status: 2 // Devedor
      },
      {
        id: 3,
        pessoaId: 1,
        descricao: 'Manutenção mensal',
        valor: 800.00,
        dataVencimento: '2025-11-01',
        dataPagamento: '2025-11-01',
        status: 0 // Em dia
      },
      {
        id: 4,
        pessoaId: 3,
        descricao: 'Treinamento técnico',
        valor: 2200.00,
        dataVencimento: '2025-11-20',
        status: 1 // À Vencer
      },
      {
        id: 5,
        pessoaId: 2,
        descricao: 'Licença de software',
        valor: 500.00,
        dataVencimento: '2025-10-15',
        status: 2 // Devedor
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

  createCobranca(cobranca: Cobranca): Observable<Cobranca> {
    return this.http.post<Cobranca>(this.apiUrl, cobranca, { headers: this.getHeaders() });
  }

  updateCobranca(id: number, cobranca: Cobranca): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, cobranca, { headers: this.getHeaders() });
  }

  deleteCobranca(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

