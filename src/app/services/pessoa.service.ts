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

  // Contatos
  createContato(contato: PessoaContato): Observable<PessoaContato> {
    return this.http.post<PessoaContato>(
      'https://controlepesssoalapi-d8g6bbhedcd3cvfk.eastus-01.azurewebsites.net/api/PessoaContato',
      contato,
      { headers: this.getHeaders() }
    );
  }

  // Endereços
  createEndereco(endereco: PessoaEndereco): Observable<PessoaEndereco> {
    return this.http.post<PessoaEndereco>(
      'https://controlepesssoalapi-d8g6bbhedcd3cvfk.eastus-01.azurewebsites.net/api/PessoaEndereco',
      endereco,
      { headers: this.getHeaders() }
    );
  }
}

