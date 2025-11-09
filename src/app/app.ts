import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SpinnerService, SpinnerState } from './services/spinner.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  isAuthenticated: boolean = false;
  mobileMenuOpen: boolean = false;
  spinnerState$: Observable<SpinnerState>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private spinnerService: SpinnerService
  ) {
    this.spinnerState$ = this.spinnerService.spinner$;
  }

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
