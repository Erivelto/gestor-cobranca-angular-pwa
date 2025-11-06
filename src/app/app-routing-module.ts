import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PessoasListaComponent } from './components/pessoas/lista/pessoas-lista.component';
import { PessoaFormComponent } from './components/pessoas/form/pessoa-form.component';
import { PessoaEditComponent } from './components/pessoas/edit/pessoa-edit.component';
import { CobrancasListaComponent } from './components/cobrancas/lista/cobrancas-lista.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pessoas', component: PessoasListaComponent },
  { path: 'pessoas/nova', component: PessoaFormComponent },
  { path: 'pessoas/editar/:id', component: PessoaFormComponent },
  { path: 'pessoas/edit/:id', component: PessoaEditComponent },
  { path: 'cobrancas', component: CobrancasListaComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
