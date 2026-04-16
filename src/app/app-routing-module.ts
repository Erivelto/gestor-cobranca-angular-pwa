import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { PessoaFormComponent } from './components/pessoas/form/pessoa-form.component';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'pessoas', canActivate: [authGuard], loadComponent: () => import('./components/pessoas/lista/pessoas-lista.component').then(m => m.PessoasListaComponent) },
  { path: 'pessoas/nova', canActivate: [authGuard], component: PessoaFormComponent },
  { path: 'pessoas/editar/:id', canActivate: [authGuard], component: PessoaFormComponent },
  { path: 'pessoas/edit/:id', canActivate: [authGuard], loadComponent: () => import('./components/pessoas/edit/pessoa-edit.component').then(m => m.PessoaEditComponent) },
  { path: 'cobrancas', canActivate: [authGuard], loadComponent: () => import('./components/cobrancas/lista/cobrancas-lista.component').then(m => m.CobrancasListaComponent) },
  { path: 'cobrancas/em-dia', canActivate: [authGuard], loadComponent: () => import('./components/cobrancas/lista/cobrancas-lista.component').then(m => m.CobrancasListaComponent), data: { tab: 'em-dia' } },
  { path: 'cobrancas/vence-hoje', canActivate: [authGuard], loadComponent: () => import('./components/cobrancas/lista/cobrancas-lista.component').then(m => m.CobrancasListaComponent), data: { tab: 'vence-hoje' } },
  { path: 'cobrancas/devedor', canActivate: [authGuard], loadComponent: () => import('./components/cobrancas/lista/cobrancas-lista.component').then(m => m.CobrancasListaComponent), data: { tab: 'devedor' } },
  { path: 'cobrancas/nova', canActivate: [authGuard], loadComponent: () => import('./components/cobrancas/nova/nova-cobranca.component').then(m => m.NovaCobrancaComponent) },
  { path: 'cobrancas/detalhes/:id', canActivate: [authGuard], loadComponent: () => import('./components/cobrancas/detalhes/cobranca-detalhes.component').then(m => m.CobrancaDetalhesComponent) },
  { path: 'parcelamento', canActivate: [authGuard], loadComponent: () => import('./components/parcelamento/lista/parcelamento-lista.component').then(m => m.ParcelamentoListaComponent) },
  { path: 'parcelamento/novo', canActivate: [authGuard], loadComponent: () => import('./components/parcelamento/novo/novo-parcelamento.component').then(m => m.NovoParcelamentoComponent) },
  { path: 'parcelamento/editar/:id', canActivate: [authGuard], loadComponent: () => import('./components/parcelamento/novo/novo-parcelamento.component').then(m => m.NovoParcelamentoComponent) },
  { path: 'parcelamento/detalhes/:id', canActivate: [authGuard], loadComponent: () => import('./components/parcelamento/detalhes/parcelamento-detalhes.component').then(m => m.ParcelamentoDetalhesComponent) },
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
