import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../services/auth.service';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  badgeColor?: 'primary' | 'accent' | 'warn';
  tooltip?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      tooltip: 'Painel principal'
    },
    {
      label: 'Pessoas',
      icon: 'people',
      route: '/pessoas',
      badge: 12,
      badgeColor: 'primary',
      tooltip: 'Gerenciar pessoas'
    },
    {
      label: 'Cobranças',
      icon: 'receipt_long',
      route: '/cobrancas',
      badge: 5,
      badgeColor: 'warn',
      tooltip: 'Cobranças pendentes'
    },
    {
      label: 'Parcelamentos',
      icon: 'credit_card',
      route: '/parcelamento',
      tooltip: 'Gerenciar parcelamentos'
    },
    {
      label: 'Relatórios',
      icon: 'analytics',
      route: '/relatorios',
      tooltip: 'Relatórios e análises'
    },
    {
      label: 'Configurações',
      icon: 'settings',
      route: '/configuracoes',
      tooltip: 'Configurações do sistema'
    }
  ];

  userMenuItems: NavigationItem[] = [
    {
      label: 'Perfil',
      icon: 'account_circle',
      route: '/perfil',
      tooltip: 'Meu perfil'
    },
    {
      label: 'Notificações',
      icon: 'notifications',
      route: '/notificacoes',
      badge: 3,
      badgeColor: 'accent',
      tooltip: 'Notificações'
    }
  ];

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get currentUser() {
    return this.authService.currentUser;
  }
}