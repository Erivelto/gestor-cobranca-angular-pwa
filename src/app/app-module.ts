import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Módulos do Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';


import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// Serviços
import { AuthService } from './services/auth.service';
import { PessoaService } from './services/pessoa.service';
import { CobrancaService } from './services/cobranca.service';
import { ViaCepService } from './services/viacep.service';
import { ParcelamentoService } from './services/parcelamento.service';

// Componentes
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PessoasListaComponent } from './components/pessoas/lista/pessoas-lista.component';
import { PessoaFormComponent } from './components/pessoas/form/pessoa-form.component';
import { PessoaEditComponent } from './components/pessoas/edit/pessoa-edit.component';
import { NovaCobrancaComponent } from './components/cobrancas/nova/nova-cobranca.component';
import { CobrancasListaComponent } from './components/cobrancas/lista/cobrancas-lista.component';
import { CobrancaDetalhesComponent } from './components/cobrancas/detalhes/cobranca-detalhes.component';
import { ParcelamentoListaComponent } from './components/parcelamento/lista/parcelamento-lista.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';


@NgModule({
  declarations: [
    App,
    LoginComponent,
    PessoaFormComponent,
    TopBarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatMenuModule,
    MatSelectModule,
    MatTooltipModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    AuthService,
    PessoaService,
    CobrancaService,
    ViaCepService,
    ParcelamentoService
  ],
  bootstrap: [App]
})
export class AppModule { }
