import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SpinnerState {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private spinnerSubject = new BehaviorSubject<SpinnerState>({
    isLoading: false,
    message: 'Carregando...',
    fullScreen: false,
    overlay: false
  });

  public spinner$: Observable<SpinnerState> = this.spinnerSubject.asObservable();

  constructor() {}

  /**
   * Mostra o spinner com configurações personalizadas
   */
  show(config?: Partial<SpinnerState>): void {
    const currentState = this.spinnerSubject.value;
    this.spinnerSubject.next({
      ...currentState,
      isLoading: true,
      ...config
    });
  }

  /**
   * Esconde o spinner
   */
  hide(): void {
    const currentState = this.spinnerSubject.value;
    this.spinnerSubject.next({
      ...currentState,
      isLoading: false
    });
  }

  /**
   * Mostra spinner em tela cheia
   */
  showFullScreen(message: string = 'Carregando...'): void {
    this.show({
      message,
      fullScreen: true,
      overlay: false
    });
  }

  /**
   * Mostra spinner com overlay
   */
  showOverlay(message: string = 'Carregando...'): void {
    this.show({
      message,
      fullScreen: false,
      overlay: true
    });
  }

  /**
   * Executa uma função async e mostra/esconde o spinner automaticamente
   */
  async withSpinner<T>(
    asyncOperation: () => Promise<T>, 
    config?: Partial<SpinnerState>
  ): Promise<T> {
    try {
      this.show(config);
      const result = await asyncOperation();
      return result;
    } finally {
      this.hide();
    }
  }

  /**
   * Verifica se o spinner está ativo
   */
  get isLoading(): boolean {
    return this.spinnerSubject.value.isLoading;
  }

  /**
   * Obtém o estado atual do spinner
   */
  get currentState(): SpinnerState {
    return this.spinnerSubject.value;
  }
}