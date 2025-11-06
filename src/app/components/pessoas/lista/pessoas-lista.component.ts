import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PessoaService } from '../../../services/pessoa.service';
import { Pessoa } from '../../../models/api.models';

@Component({
  selector: 'app-pessoas-lista',
  templateUrl: './pessoas-lista.component.html',
  styleUrls: ['./pessoas-lista.component.css'],
  standalone: false
})
export class PessoasListaComponent implements OnInit {
  pessoas: Pessoa[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private pessoaService: PessoaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPessoas();
  }

  loadPessoas(): void {
    this.loading = true;
    this.error = '';

    this.pessoaService.getPessoas().subscribe({
      next: (pessoas) => {
        this.pessoas = pessoas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pessoas:', error);
        this.error = 'Erro ao carregar clientes. Tente novamente.';
        this.loading = false;
      }
    });
  }

  novaPessoa(): void {
    this.router.navigate(['/pessoas/nova']);
  }

  editarPessoa(id: number): void {
    this.router.navigate(['/pessoas/editar', id]);
  }

  deletarPessoa(id: number): void {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.pessoaService.deletePessoa(id).subscribe({
        next: () => {
          this.loadPessoas();
        },
        error: (error) => {
          console.error('Erro ao excluir pessoa:', error);
          alert('Erro ao excluir cliente. Tente novamente.');
        }
      });
    }
  }

  getStatusText(status?: number): string {
    return status === 1 ? 'Ativo' : 'Inativo';
  }

  getStatusClass(status?: number): string {
    return status === 1 ? 'badge-success' : 'badge-secondary';
  }
}

