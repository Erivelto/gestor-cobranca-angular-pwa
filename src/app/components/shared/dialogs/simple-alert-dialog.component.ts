import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-simple-alert-dialog',
  templateUrl: './simple-alert-dialog.component.html',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class SimpleAlertDialog {
  constructor(
    public dialogRef: MatDialogRef<SimpleAlertDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; type: string; confirmText?: string; cancelText?: string }
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  close(): void {
    this.dialogRef.close();
  }
}
