import { SimpleAlertDialog } from '../components/shared/dialogs/simple-alert-dialog.component';
import { LoadingDialog } from '../components/shared/dialogs/loading-dialog.component';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {}

  confirm(title: string, message: string, confirmText: string = 'OK', cancelText: string = 'Cancelar'): Promise<boolean> {
    const dialogRef = this.dialog.open(SimpleAlertDialog, {
      data: { title, message, confirmText, cancelText, type: 'question' }
    });
    return dialogRef.afterClosed().toPromise();
  }

  showLoading(title: string = 'Carregando...', message?: string): void {
    this.dialog.open(LoadingDialog, {
      data: { title, message }
    });
  }

  hideLoading(): void {
    this.dialog.closeAll();
  }

  successToast(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  errorToast(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 4000,
      panelClass: ['snackbar-error']
    });
  }

  warningToast(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3500,
      panelClass: ['snackbar-warning']
    });
  }

  infoToast(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      panelClass: ['snackbar-info']
    });
  }

  error(title: string, message: string): void {
    this.errorToast(`${title}: ${message}`);
  }

  success(title: string, message: string): void {
    this.successToast(`${title}: ${message}`);
  }

  warning(title: string, message: string): void {
    this.warningToast(`${title}: ${message}`);
  }

  confirmDelete(title: string, message: string): Promise<boolean> {
    return this.confirm(title, message, 'Excluir', 'Cancelar');
  }

  confirmAction(title: string, message: string, confirmText: string = 'Confirmar', cancelText: string = 'Cancelar'): Promise<boolean> {
    return this.confirm(title, message, confirmText, cancelText);
  }
}