# Sistema de Spinner - Documentação

## 📋 Visão Geral

O sistema de spinner fornece uma solução completa e reutilizável para indicadores de carregamento em toda a aplicação Angular. É composto por:

- **SpinnerService**: Serviço global para gerenciar estados de loading
- **SpinnerComponent**: Componente standalone reutilizável  
- **Global Spinner**: Spinner integrado no app.component para operações globais

## 🔧 Arquitetura

### SpinnerService
**Localização**: `src/app/services/spinner.service.ts`

#### Métodos Principais:

```typescript
// Mostrar spinner básico
spinnerService.show({ message: 'Carregando...', overlay: true });

// Mostrar spinner em tela cheia
spinnerService.showFullScreen('Processando pagamento...');

// Mostrar spinner com overlay
spinnerService.showOverlay('Salvando dados...');

// Esconder spinner
spinnerService.hide();

// Executar operação async com spinner automático
await spinnerService.withSpinner(
  () => this.apiService.getData().toPromise(),
  { message: 'Buscando dados...', fullScreen: true }
);
```

#### Estados do Spinner:

```typescript
interface SpinnerState {
  isLoading: boolean;     // Se está carregando
  message?: string;       // Mensagem exibida
  fullScreen?: boolean;   // Ocupar tela inteira
  overlay?: boolean;      // Mostrar sobre conteúdo atual
}
```

### SpinnerComponent
**Localização**: `src/app/components/shared/spinner/spinner.component.ts`

#### Propriedades:

```typescript
@Input() size: 'small' | 'medium' | 'large' = 'medium';
@Input() color: 'primary' | 'accent' | 'white' = 'primary';
@Input() message: string = 'Carregando...';
@Input() showMessage: boolean = true;
@Input() overlay: boolean = false;
@Input() fullScreen: boolean = false;
```

#### Uso em Templates:

```html
<!-- Spinner básico -->
<app-spinner></app-spinner>

<!-- Spinner customizado -->
<app-spinner 
  size="large"
  color="accent"
  message="Processando..."
  [showMessage]="true"
  [overlay]="true">
</app-spinner>

<!-- Spinner condicional -->
<app-spinner 
  *ngIf="loading"
  message="Carregando dados..."
  [fullScreen]="true">
</app-spinner>
```

## 🎨 Variações Visuais

### Tamanhos:
- **small**: 8px dots, 4px gap
- **medium**: 12px dots, 6px gap  
- **large**: 16px dots, 8px gap

### Cores:
- **primary**: Azul Material Design (#1976d2)
- **accent**: Laranja Material Design (#ff5722)
- **white**: Branco (para fundos escuros)

### Modos:
- **overlay**: Sobrepõe conteúdo atual com backdrop
- **fullScreen**: Ocupa tela inteira com backdrop
- **inline**: Exibição normal no fluxo do documento

## 💡 Padrões de Uso

### 1. Carregamento de Listas
```typescript
loadPessoas(): void {
  this.spinnerService.showOverlay('Carregando lista de clientes...');
  
  this.pessoaService.getPessoas().subscribe({
    next: (pessoas) => {
      this.pessoas = pessoas;
      this.spinnerService.hide();
    },
    error: (error) => {
      this.spinnerService.hide();
      this.notificationService.error('Erro', 'Falha ao carregar dados');
    }
  });
}
```

### 2. Operações CRUD
```typescript
async salvarPessoa(): Promise<void> {
  try {
    const resultado = await this.spinnerService.withSpinner(
      () => this.pessoaService.create(this.pessoa).toPromise(),
      { message: 'Salvando cliente...', fullScreen: true }
    );
    
    this.notificationService.success('Sucesso!', 'Cliente salvo com sucesso!');
    this.router.navigate(['/pessoas']);
    
  } catch (error) {
    this.notificationService.error('Erro', 'Falha ao salvar cliente');
  }
}
```

### 3. Login/Autenticação
```typescript
async onSubmit(): Promise<void> {
  try {
    await this.spinnerService.withSpinner(
      () => this.authService.login(this.username, this.senha).toPromise(),
      { message: 'Realizando login...', fullScreen: true }
    );
    
    this.router.navigate(['/dashboard']);
    
  } catch (error) {
    this.notificationService.error('Erro', 'Credenciais inválidas');
  }
}
```

### 4. Exclusões com Confirmação
```typescript
deletarPessoa(codigo: string): void {
  this.notificationService.confirmDelete().then((result) => {
    if (result.isConfirmed) {
      this.spinnerService.showFullScreen('Excluindo cliente...');
      
      this.pessoaService.deletePessoa(codigo).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.notificationService.success('Excluído!', 'Cliente removido com sucesso!');
          this.loadPessoas();
        },
        error: (error) => {
          this.spinnerService.hide();
          this.notificationService.error('Erro', 'Falha ao excluir cliente');
        }
      });
    }
  });
}
```

## 🎯 Boas Práticas

### ✅ Faça:

1. **Use mensagens descritivas**: "Carregando clientes...", "Salvando dados..."
2. **Escolha o modo correto**:
   - `overlay` para operações na página atual
   - `fullScreen` para operações críticas (login, salvamento)
3. **Sempre esconda o spinner**: Use try/finally ou complete callback
4. **Use withSpinner()** para operações async simples
5. **Combine com notificações**: Spinner → Resultado → Notificação

### ❌ Evite:

1. **Spinners múltiplos simultâneos**
2. **Mensagens genéricas**: "Carregando..." sem contexto
3. **Esquecer de esconder**: Sempre call hide() ou use withSpinner()
4. **Overlay para operações longas**: Use fullScreen
5. **Spinners para operações instantâneas**

## 🔄 Integração com RxJS

### Operadores Úteis:

```typescript
// Com finalize para garantir que o spinner seja escondido
loadData(): void {
  this.spinnerService.show({ message: 'Carregando...' });
  
  this.dataService.getData()
    .pipe(
      finalize(() => this.spinnerService.hide())
    )
    .subscribe({
      next: (data) => this.data = data,
      error: (error) => this.handleError(error)
    });
}

// Com catchError para tratamento de erro
saveData(): void {
  this.spinnerService.showFullScreen('Salvando...');
  
  this.dataService.save(this.data)
    .pipe(
      catchError((error) => {
        this.spinnerService.hide();
        this.notificationService.error('Erro', 'Falha ao salvar');
        return EMPTY;
      }),
      finalize(() => this.spinnerService.hide())
    )
    .subscribe({
      next: () => {
        this.notificationService.success('Sucesso!', 'Dados salvos!');
        this.router.navigate(['/lista']);
      }
    });
}
```

## 🎨 Customização CSS

### Variáveis CSS Disponíveis:
```css
:root {
  --spinner-color-primary: #1976d2;
  --spinner-color-accent: #ff5722;
  --spinner-size-small: 8px;
  --spinner-size-medium: 12px;
  --spinner-size-large: 16px;
  --spinner-backdrop: rgba(255, 255, 255, 0.9);
}
```

### Classes CSS:
- `.global-spinner-container`: Container principal
- `.global-spinner-container--overlay`: Modo overlay
- `.global-spinner-container--fullscreen`: Modo tela cheia
- `.global-spinner`: Container dos dots
- `.global-spinner__dot`: Cada dot do spinner

## 📱 Responsividade

O sistema é totalmente responsivo:
- **Mobile**: Ajuste automático de tamanhos e espaçamentos
- **Tablet**: Otimizado para telas médias
- **Desktop**: Experiência completa

## ♿ Acessibilidade

- **Reduced Motion**: Respeita preferência do usuário
- **Screen Readers**: Mensagens acessíveis
- **Alto Contraste**: Cores adequadas
- **Keyboard Navigation**: Não interfere na navegação

## 🚀 Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **Animações Otimizadas**: CSS transforms para melhor performance
- **Memory Leaks**: Prevenção com unsubscribe automático
- **Bundle Size**: Componentes standalone para tree-shaking

## 🧪 Testes

### Teste de Integração:
```typescript
// Verificar se spinner aparece
spinnerService.show();
expect(fixture.debugElement.query(By.css('.global-spinner'))).toBeTruthy();

// Verificar se spinner desaparece
spinnerService.hide();
fixture.detectChanges();
expect(fixture.debugElement.query(By.css('.global-spinner'))).toBeFalsy();
```

---

**Desenvolvido com ❤️ para uma melhor experiência do usuário**