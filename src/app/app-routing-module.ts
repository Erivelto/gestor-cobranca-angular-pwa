import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PessoasListaComponent } from './components/pessoas/lista/pessoas-lista.component';
import { PessoaFormComponent } from './components/pessoas/form/pessoa-form.component';
import { PessoaEditComponent } from './components/pessoas/edit/pessoa-edit.component';
import { CobrancasListaComponent } from './components/cobrancas/lista/cobrancas-lista.component';
import { NovaCobrancaComponent } from './components/cobrancas/nova/nova-cobranca.component';
import { CobrancaDetalhesComponent } from './components/cobrancas/detalhes/cobranca-detalhes.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pessoas', component: PessoasListaComponent },
  { path: 'pessoas/nova', component: PessoaFormComponent },
  { path: 'pessoas/editar/:id', component: PessoaFormComponent },
  { path: 'pessoas/edit/:id', component: PessoaEditComponent },
  { path: 'cobrancas', component: CobrancasListaComponent },
  { path: 'cobrancas/em-dia', component: CobrancasListaComponent, data: { tab: 'em-dia' } },
  { path: 'cobrancas/vence-hoje', component: CobrancasListaComponent, data: { tab: 'vence-hoje' } },
  { path: 'cobrancas/devedor', component: CobrancasListaComponent, data: { tab: 'devedor' } },
  { path: 'cobrancas/nova', component: NovaCobrancaComponent },
  { path: 'cobrancas/detalhes/:id', component: CobrancaDetalhesComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Performance optimizations
    preloadingStrategy: PreloadAllModules,
    enableTracing: false,
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
