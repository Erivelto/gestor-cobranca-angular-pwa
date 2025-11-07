import { Component, Inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatDialogModule],
  template: `
    <div class="loading-overlay">
      <div class="loading-box">
        <mat-progress-spinner mode="indeterminate" diameter="56"></mat-progress-spinner>
        <div class="loading-text">{{ data?.message || 'Carregando...' }}</div>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.32);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 2000;
    }

    .loading-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 20px 28px;
      background: rgba(255,255,255,0.98);
      border-radius: 8px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.2);
    }

    .loading-text {
      font-size: 16px;
      color: #333;
      text-align: center;
      min-width: 140px;
    }
  `]
})
export class LoadingComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { message?: string } | null) {}
}
