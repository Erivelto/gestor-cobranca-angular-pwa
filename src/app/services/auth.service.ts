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

    // Garante que o userId esteja disponível mesmo após recarregar a página
    const existingUserId = localStorage.getItem('userId');
    if (!existingUserId) {
      const backfillId = parsedUser?.id ?? this.tryDecodeUserIdFromToken(this.token);
      if (backfillId != null) {
        localStorage.setItem('userId', String(backfillId));
      }
    }
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem('token');
  }

  login(username: string, senha: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { user: username, password: senha };
    const loginUrl = `${this.apiUrl}/Autenticacao/login`;
    
    console.log('🔐 AuthService.login() - Iniciando login');
    console.log('👤 Username:', username);
    console.log('🌐 URL completa:', loginUrl);
    console.log('📦 Payload:', JSON.stringify(loginRequest));
    console.log('🔧 Environment apiUrl:', this.apiUrl);
    
    return this.http.post<LoginResponse>(
      loginUrl, 
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
          console.log('✅ Login bem-sucedido!');
          console.log('📩 Resposta completa:', response);
          if (response && response.token) {
            // Sempre guardar o token
            localStorage.setItem('token', response.token);

            // Tentar obter o usuário tanto em 'usuario' (pt-BR) quanto em 'user' (en)
            const anyResp: any = response as any;
            const rawUser = anyResp?.usuario ?? anyResp?.user ?? null;
            
            console.log('👤 rawUser extraído:', rawUser);

            // Tentar identificar o ID do usuário via objeto de usuário ou via JWT
            const userIdFromObject: number | null = rawUser?.id ?? null;
            const userIdFromToken: number | null = this.tryDecodeUserIdFromToken(response.token);
            const resolvedUserId = userIdFromObject ?? userIdFromToken;
            
            console.log('🆔 userIdFromObject:', userIdFromObject);
            console.log('🔐 userIdFromToken:', userIdFromToken);
            console.log('✅ resolvedUserId final:', resolvedUserId);

            // Normalizar o usuário para o formato do app
            const normalizedUser: Usuario = {
              id: resolvedUserId ?? undefined,
              username: rawUser?.username ?? rawUser?.user ?? username,
              // tipo pode vir como número ou string do backend; manter sem transformação
              tipo: rawUser?.tipo as any
            };
            
            console.log('📝 normalizedUser:', normalizedUser);

            // Persistir usuário e ID para uso em toda a aplicação
            localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
            if (resolvedUserId != null && resolvedUserId > 0) {
              localStorage.setItem('userId', String(resolvedUserId));
              console.log('💾 userId salvo no localStorage:', resolvedUserId);
            } else {
              console.warn('⚠️ AVISO: userId não foi salvo (valor inválido):', resolvedUserId);
            }

            // Atualizar o estado reativo
            this.currentUserSubject.next(normalizedUser);
            console.log('🔄 currentUserSubject atualizado');
          }
        },
        error: (error) => {
          console.error('❌ Erro no login!');
          console.error('Status:', error.status);
          console.error('StatusText:', error.statusText);
          console.error('URL:', error.url);
          console.error('Mensagem:', error.message);
          console.error('Erro completo:', error);
          throw error;
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Extrai o payload do JWT e tenta obter o ID do usuário a partir de claims comuns
  private tryDecodeUserIdFromToken(token: string | null): number | null {
    if (!token) return null;
    try {
      const payload = this.parseJwt(token);
      if (!payload) return null;

      // Chaves comuns para identificar o ID do usuário em tokens JWT
      const candidates = [
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
        'nameid',
        'sub',
        'uid',
      ];

      for (const key of candidates) {
        const v = payload[key];
        if (typeof v === 'number' && Number.isFinite(v)) return v;
        if (typeof v === 'string') {
          const parsed = parseInt(v, 10);
          if (!Number.isNaN(parsed)) return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // Decodifica um JWT sem validar assinatura (uso apenas no cliente)
  private parseJwt(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}
