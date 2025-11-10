import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-success-modal',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './edit-success-modal.component.html',
  styleUrls: ['./edit-success-modal.component.css']
})
export class EditSuccessModalComponent {
  constructor(
    public dialogRef: MatDialogRef<EditSuccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message: string; buttonText?: string }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}