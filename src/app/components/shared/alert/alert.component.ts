import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class AlertComponent {
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'info';
  @Input() message: string = '';
  @Input() show: boolean = false;

  close() {
    this.show = false;
  }
}
