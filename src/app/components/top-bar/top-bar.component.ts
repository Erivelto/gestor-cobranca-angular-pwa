import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
  standalone: false
})
export class TopBarComponent {
  @Output() menuToggle = new EventEmitter<void>();
  constructor(private router: Router, private authService: AuthService) {}

  navegar(rota: string): void {
    this.router.navigate([rota]);
  }

  onMenuClick(): void {
    this.menuToggle.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
