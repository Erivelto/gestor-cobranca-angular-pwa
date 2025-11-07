import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingComponent } from '../components/shared/loading/loading.component';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private dialogRef: MatDialogRef<LoadingComponent> | null = null;

  constructor(private dialog: MatDialog) {}

  show(message?: string): void {
    // avoid opening multiple dialogs
    if (this.dialogRef) {
      // update message if already open
      try { this.dialogRef.componentInstance.data = { message }; } catch {}
      return;
    }

    this.dialogRef = this.dialog.open(LoadingComponent, {
      data: { message },
      panelClass: 'app-loading-dialog',
      disableClose: true,
      hasBackdrop: false,
      autoFocus: false,
      width: '100vw',
      maxWidth: '100vw'
    });
  }

  hide(): void {
    if (this.dialogRef) {
      try { this.dialogRef.close(); } catch {}
      this.dialogRef = null;
    }
  }

  isVisible(): boolean {
    return !!this.dialogRef;
  }
}
