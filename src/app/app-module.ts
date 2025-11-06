import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// Services
import { AuthService } from './services/auth.service';
import { PessoaService } from './services/pessoa.service';
import { CobrancaService } from './services/cobranca.service';
import { ViaCepService } from './services/viacep.service';

// Components
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PessoasListaComponent } from './components/pessoas/lista/pessoas-lista.component';
import { PessoaFormComponent } from './components/pessoas/form/pessoa-form.component';
import { PessoaEditComponent } from './components/pessoas/edit/pessoa-edit.component';
import { CobrancasListaComponent } from './components/cobrancas/lista/cobrancas-lista.component';

@NgModule({
  declarations: [
    App,
    LoginComponent,
    DashboardComponent,
    PessoasListaComponent,
    PessoaFormComponent,
    PessoaEditComponent,
    CobrancasListaComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    AuthService,
    PessoaService,
    CobrancaService,
    ViaCepService
  ],
  bootstrap: [App]
})
export class AppModule { }
