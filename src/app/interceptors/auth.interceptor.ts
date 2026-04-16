import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Não adicionar token em APIs externas públicas (ViaCep, etc.)
    const isExternalPublic = req.url.includes('viacep.com.br');
    const token = this.authService.token;

    let authReq = req;
    if (token && !isExternalPublic) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            // Token expirado ou inválido — redirecionar para login
            this.authService.logout();
            this.router.navigate(['/login']);
            this.notification.errorToast('Sessão expirada. Faça login novamente.');
            break;

          case 403:
            this.notification.errorToast('Acesso negado. Você não tem permissão para esta ação.');
            break;

          case 500:
            this.notification.errorToast('Erro interno do servidor. Tente novamente mais tarde.');
            break;

          case 0:
            this.notification.errorToast('Sem conexão com o servidor. Verifique sua internet.');
            break;
        }

        return throwError(() => error);
      })
    );
  }
}
