import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-dialog',
  templateUrl: './loading-dialog.component.html',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
})
export class LoadingDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }) {}
}
