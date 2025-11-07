import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ],
  standalone: false
})
export class LoginComponent {
  @ViewChild('loginForm') loginForm!: NgForm;
  
  username: string = '';
  senha: string = '';
  loading: boolean = false;
  error: string = '';
  hidePassword: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    // Redirecionar se já estiver autenticado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private showErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '90%',
      maxWidth: '360px',
      data: { message },
      panelClass: 'error-dialog-panel'
    });
  }

  onSubmit(): void {
    if (!this.username || !this.senha) {
      this.showErrorDialog('Ops! Precisamos que você preencha seu usuário e senha para continuar.');
      return;
    }

    this.loading = true;
    this.error = '';

    console.log('Tentando login com:', { username: this.username });

    this.authService.login(this.username, this.senha).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido:', response);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Detalhes do erro:', error);
        
        let errorMessage: string;
        if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor. Por favor, verifique sua conexão com a internet e tente novamente.';
        } else if (error.status === 401) {
          errorMessage = 'O usuário ou senha informados não estão corretos. Por favor, verifique e tente novamente.';
        } else {
          errorMessage = 'Desculpe, ocorreu um problema inesperado. Por favor, tente novamente em alguns instantes.';
        }
        this.showErrorDialog(errorMessage);
      }
    });
  }
}

