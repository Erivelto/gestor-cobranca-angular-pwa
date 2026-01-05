import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PessoaParcelamento, PessoaParcelamentoDetalhe } from '../models/api.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParcelamentoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obter todos os parcelamentos
  getParcelamentos(): Observable<PessoaParcelamento[]> {
    const url = `${this.apiUrl}/PessoaParcelamento`;
    console.log('📋 ParcelamentoService.getParcelamentos() - URL:', url);
    return this.http.get<PessoaParcelamento[]>(url);
  }

  // Obter parcelamento por ID
  getParcelamentoById(codigo: number): Observable<PessoaParcelamento> {
    const url = `${this.apiUrl}/PessoaParcelamento/${codigo}`;
    console.log('📋 ParcelamentoService.getParcelamentoById() - URL:', url);
    return this.http.get<PessoaParcelamento>(url);
  }

  // Obter parcelamentos por pessoa
  getParcelamentosPorPessoa(codigoPessoa: number): Observable<PessoaParcelamento[]> {
    const url = `${this.apiUrl}/PessoaParcelamento/pessoa/${codigoPessoa}`;
    console.log('📋 ParcelamentoService.getParcelamentosPorPessoa() - URL:', url);
    return this.http.get<PessoaParcelamento[]>(url);
  }

  // Criar novo parcelamento
  criarParcelamento(parcelamento: PessoaParcelamento): Observable<PessoaParcelamento> {
    const url = `${this.apiUrl}/PessoaParcelamento`;
    console.log('✏️ ParcelamentoService.criarParcelamento() - URL:', url);
    console.log('📦 Dados:', parcelamento);
    return this.http.post<PessoaParcelamento>(url, parcelamento);
  }

  // Atualizar parcelamento
  atualizarParcelamento(codigo: number, parcelamento: PessoaParcelamento): Observable<PessoaParcelamento> {
    const url = `${this.apiUrl}/PessoaParcelamento/${codigo}`;
    console.log('✏️ ParcelamentoService.atualizarParcelamento() - URL:', url);
    console.log('📦 Dados:', parcelamento);
    return this.http.put<PessoaParcelamento>(url, parcelamento);
  }

  // Excluir parcelamento
  excluirParcelamento(codigo: number): Observable<void> {
    const url = `${this.apiUrl}/PessoaParcelamento/${codigo}`;
    console.log('🗑️ ParcelamentoService.excluirParcelamento() - URL:', url);
    return this.http.delete<void>(url);
  }

  // Obter detalhes do parcelamento
  getDetalhesParcelamento(codigoParcelamento: number): Observable<PessoaParcelamentoDetalhe[]> {
    const url = `${this.apiUrl}/PessoaParcelamento/${codigoParcelamento}/detalhes`;
    console.log('📋 ParcelamentoService.getDetalhesParcelamento() - URL:', url);
    return this.http.get<PessoaParcelamentoDetalhe[]>(url);
  }

  // Criar detalhe de parcelamento
  criarDetalheParcelamento(detalhe: PessoaParcelamentoDetalhe): Observable<PessoaParcelamentoDetalhe> {
    const url = `${this.apiUrl}/PessoaParcelamento/detalhe`;
    console.log('✏️ ParcelamentoService.criarDetalheParcelamento() - URL:', url);
    console.log('📦 Dados:', detalhe);
    return this.http.post<PessoaParcelamentoDetalhe>(url, detalhe);
  }

  // Atualizar detalhe de parcelamento
  atualizarDetalheParcelamento(codigo: number, detalhe: PessoaParcelamentoDetalhe): Observable<PessoaParcelamentoDetalhe> {
    const url = `${this.apiUrl}/PessoaParcelamento/detalhe/${codigo}`;
    console.log('✏️ ParcelamentoService.atualizarDetalheParcelamento() - URL:', url);
    console.log('📦 Dados:', detalhe);
    return this.http.put<PessoaParcelamentoDetalhe>(url, detalhe);
  }
}
