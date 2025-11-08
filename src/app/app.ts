import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  isAuthenticated: boolean = false;
  mobileMenuOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // top-bar controla a navegação; não há mais sidenav aqui

  isLoginRoute(): boolean {
    return this.router.url === '/login';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.mobileMenuOpen = false;
  }
}
