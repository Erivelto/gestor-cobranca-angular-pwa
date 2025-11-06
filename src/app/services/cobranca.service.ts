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
    return this.http.get<Cobranca[]>(this.apiUrl, { headers: this.getHeaders() });
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

