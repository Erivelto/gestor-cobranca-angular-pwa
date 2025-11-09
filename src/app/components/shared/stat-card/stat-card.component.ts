import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

export interface StatCardData {
  title: string;
  value: number | string;
  icon: string;
  color: 'primary' | 'accent' | 'warn' | 'success' | 'info';
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  progress?: number;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: string;
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  @Input() data!: StatCardData;
  @Input() loading = false;

  get cardClass(): string {
    return `stat-card stat-card--${this.data.color}`;
  }

  get progressClass(): string {
    return `progress-bar progress-bar--${this.data.color}`;
  }
}