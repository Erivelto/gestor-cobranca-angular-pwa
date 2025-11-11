import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CobrancaService } from '../../../services/cobranca.service';
import { NotificationService } from '../../../services/notification.service';
import { Cobranca } from '../../../models/api.models';

@Component({
  selector: 'app-cobrancas-lista',
  templateUrl: './cobrancas-lista.component.html',
  styleUrls: ['./cobrancas-lista.component.css'],
  standalone: false
})
export class CobrancasListaComponent implements OnInit {
  cobrancas: Cobranca[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private cobrancaService: CobrancaService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCobrancas();
  }

  loadCobrancas(): void {
    this.loading = true;
    this.error = '';

    this.cobrancaService.getCobrancas().subscribe({
      next: (cobrancas) => {
        this.cobrancas = cobrancas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cobranças:', error);
        this.notificationService.error('Erro do Servidor', 'Erro ao carregar cobranças. Verifique sua conexão e tente novamente.');
        this.loading = false;
      }
    });
  }

  novaCobranca(): void {
    this.router.navigate(['/cobrancas/nova']);
  }

  editarCobranca(id: number): void {
    this.router.navigate(['/cobrancas/editar', id]);
  }

  deletarCobranca(id: number): void {
    this.notificationService.confirmDelete('Tem certeza que deseja excluir esta cobrança?').then((result) => {
      if (result.isConfirmed) {
        this.cobrancaService.deleteCobranca(id).subscribe({
          next: () => {
            this.notificationService.success('Excluído!', 'Cobrança excluída com sucesso!');
            this.loadCobrancas();
          },
          error: (error) => {
            console.error('Erro ao excluir cobrança:', error);
            this.notificationService.error('Erro do Servidor', 'Erro ao excluir cobrança. Tente novamente.');
          }
        });
      }
    });
  }

  getStatusText(status?: number): string {
    switch (status) {
      case 0: return 'Pendente';
      case 1: return 'Pago';
      case 2: return 'Vencido';
      default: return 'Desconhecido';
    }
  }

  getStatusClass(status?: number): string {
    switch (status) {
      case 0: return 'badge-warning';
      case 1: return 'badge-success';
      case 2: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
}

