import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  username: string = '';
  senha: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redirecionar se já estiver autenticado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.username || !this.senha) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.senha).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Usuário ou senha inválidos';
        console.error('Erro no login:', error);
      }
    });
  }
}

