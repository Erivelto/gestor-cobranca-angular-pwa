import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent
  ],
  template: `
    <app-sidebar>
      <router-outlet></router-outlet>
    </app-sidebar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent { }