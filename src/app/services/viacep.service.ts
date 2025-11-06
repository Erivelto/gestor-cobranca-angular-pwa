import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ViaCepResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ViaCepService {
  private apiUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  buscarCep(cep: string): Observable<ViaCepResponse> {
    const cepLimpo = cep.replace(/\D/g, '');
    return this.http.get<ViaCepResponse>(`${this.apiUrl}/${cepLimpo}/json/`);
  }
}

