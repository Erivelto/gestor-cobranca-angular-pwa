import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
  standalone: false
})
export class TopBarComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();
  usuarioLogado: string = 'Usuário';
  
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.usuarioLogado = user?.username || 'Usuário';
  }

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
