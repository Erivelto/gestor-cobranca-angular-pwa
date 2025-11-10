import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-error-modal',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './edit-error-modal.component.html',
  styleUrls: ['./edit-error-modal.component.css']
})
export class EditErrorModalComponent {
  constructor(
    public dialogRef: MatDialogRef<EditErrorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message: string; buttonText?: string }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}