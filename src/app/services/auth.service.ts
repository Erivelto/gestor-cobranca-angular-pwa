import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, Usuario } from '../models/api.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;

  constructor(private http: HttpClient) {
    const storedUserRaw = localStorage.getItem('currentUser');

    // Handle cases where localStorage contains the string "undefined" or invalid JSON
    let parsedUser: Usuario | null = null;
    if (storedUserRaw && storedUserRaw !== 'undefined' && storedUserRaw !== 'null') {
      try {
        parsedUser = JSON.parse(storedUserRaw) as Usuario;
      } catch (err) {
        // Invalid JSON stored — remove the bad value to avoid repeated errors
        console.warn('AuthService: invalid stored currentUser JSON, clearing localStorage entry.', err);
        localStorage.removeItem('currentUser');
        parsedUser = null;
      }
    }

    this.currentUserSubject = new BehaviorSubject<Usuario | null>(parsedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem('token');
  }

  login(username: string, senha: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { user: username, password: senha };
    console.log('Enviando requisição para:', `${this.apiUrl}/Autenticacao/login`);
    console.log('Dados da requisição:', loginRequest);
    
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/Autenticacao/login`, 
      loginRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    ).pipe(
      tap({
        next: (response) => {
          console.log('Resposta do servidor:', response);
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.usuario));
            this.currentUserSubject.next(response.usuario);
          }
        },
        error: (error) => {
          console.error('Erro na requisição:', error);
          throw error;
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}
