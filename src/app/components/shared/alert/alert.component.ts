import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  standalone: true,
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
