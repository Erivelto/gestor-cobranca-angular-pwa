import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private defaultConfig = {
    confirmButtonColor: '#1976d2',
    cancelButtonColor: '#757575',
    customClass: {
      popup: 'sweet-popup',
      title: 'sweet-title',
      content: 'sweet-content',
      confirmButton: 'sweet-confirm-btn',
      cancelButton: 'sweet-cancel-btn'
    }
  };

  constructor() {}

  // Sucesso
  success(title: string, message?: string, timer: number = 3000): Promise<any> {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      timer: timer,
      timerProgressBar: true,
      showConfirmButton: timer === 0,
      ...this.defaultConfig
    });
  }

  // Erro
  error(title: string, message?: string): Promise<any> {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      ...this.defaultConfig
    });
  }

  // Aviso
  warning(title: string, message?: string): Promise<any> {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      ...this.defaultConfig
    });
  }

  // Informação
  info(title: string, message?: string): Promise<any> {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      ...this.defaultConfig
    });
  }

  // Confirmação de exclusão
  confirmDelete(title: string = 'Tem certeza?', message: string = 'Esta ação não poderá ser desfeita!'): Promise<any> {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
      ...this.defaultConfig,
      confirmButtonColor: '#dc3545'
    });
  }

  // Confirmação genérica
  confirm(title: string, message?: string, confirmText: string = 'Confirmar', cancelText: string = 'Cancelar'): Promise<any> {
    return Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      ...this.defaultConfig
    });
  }

  // Loading personalizado
  showLoading(title: string = 'Carregando...', message?: string): void {
    Swal.fire({
      title: title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      ...this.defaultConfig
    });
  }

  // Fechar loading
  hideLoading(): void {
    Swal.close();
  }

  // Toast notifications (pequenas notificações no canto)
  successToast(message: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'success',
      title: message
    });
  }

  errorToast(message: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'error',
      title: message
    });
  }

  warningToast(message: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'warning',
      title: message
    });
  }

  infoToast(message: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'info',
      title: message
    });
  }

  // Método para notificações personalizadas
  custom(config: any): Promise<any> {
    return Swal.fire({
      ...this.defaultConfig,
      ...config
    });
  }
}