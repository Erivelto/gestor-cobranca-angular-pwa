import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: 'primary' | 'accent' | 'white' = 'primary';
  @Input() message: string = 'Carregando...';
  @Input() showMessage: boolean = true;
  @Input() overlay: boolean = false;
  @Input() fullScreen: boolean = false;
  
  get spinnerClasses(): string {
    return `spinner spinner--${this.size} spinner--${this.color}`;
  }
  
  get containerClasses(): string {
    let classes = 'spinner-container';
    
    if (this.overlay) {
      classes += ' spinner-container--overlay';
    }
    
    if (this.fullScreen) {
      classes += ' spinner-container--fullscreen';
    }
    
    return classes;
  }
}