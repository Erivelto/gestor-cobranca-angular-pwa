import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-simple-alert-dialog',
  templateUrl: './simple-alert-dialog.component.html',
})
export class SimpleAlertDialog {
  constructor(
    public dialogRef: MatDialogRef<SimpleAlertDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; type: string }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
