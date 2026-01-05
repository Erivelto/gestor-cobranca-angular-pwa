# Gestor Cobrança - AI Coding Guidelines

## Project Overview
Angular 20+ PWA for managing billing/collections ("cobranças") with Material Design. Uses module-based architecture (NOT standalone) with proxy-based API communication.

## Architecture

### Module System (Critical)
- **Non-standalone components**: All components use `standalone: false` (see [angular.json](../angular.json#L8-L16))
- Components MUST be declared in [app-module.ts](../src/app/app-module.ts)
- Imports handled at module level, not component level
- Shared components in `src/app/components/shared/` use standalone pattern with explicit imports

### API Communication Pattern
Development uses **proxy configuration** [proxy.conf.json](../proxy.conf.json) that forwards `/api/*` to Azure backend:
```json
{
  "/api/*": {
    "target": "https://controlepesssoalapi-d8g6bbhedcd3cvfk.eastus-01.azurewebsites.net"
  }
}
```

Services construct URLs with `environment.apiUrl + '/Endpoint'` - proxy rewrites `/api/` prefix automatically.

**Auth Flow**: [auth.service.ts](../src/app/services/auth.service.ts) stores JWT token in localStorage and uses BehaviorSubject pattern for reactive user state. Handle both `usuario` (pt-BR) and `user` (en) response formats from API.

### Component Structure
- **Feature components**: `src/app/components/{feature}/{action}/` (e.g., `cobrancas/lista/`, `pessoas/form/`)
- **Shared components**: Use standalone pattern with explicit Material imports (see [advanced-table.component.ts](../src/app/components/shared/advanced-table/advanced-table.component.ts))
- **Sidebar navigation**: [sidebar.component.ts](../src/app/components/shared/sidebar/sidebar.component.ts) drives main nav with badge support

### Data Models
All API models in [api.models.ts](../src/app/models/api.models.ts). Note quirks:
- API misspells `numrero` (should be `numero`) in `PessoaEndereco`
- Response formats vary: `usuario` vs `user` depending on endpoint

## Development Workflow

### Running the App
```bash
npm start  # Serves on 127.0.0.1:8080 with proxy
```

### Build & Deploy
```bash
npm run build          # Production build to dist/
npm run start:prod     # Run Express server (server.js) with proxy
```

Production uses [server.js](../server.js) with `http-proxy-middleware` to maintain API proxy in deployed environment.

### Testing
```bash
npm test  # Karma + Jasmine
```

## Coding Conventions

### TypeScript Files
- File naming: `{name}.component.ts`, `{name}.service.ts`
- Components use PascalCase classes without "Component" suffix (e.g., `export class PessoasLista`)

### Shared Components
When creating reusable components:
1. Make them standalone (`standalone: true`)
2. Explicitly import ALL Material modules used
3. Export via CommonModule in imports array
4. Example: [advanced-table.component.ts](../src/app/components/shared/advanced-table/advanced-table.component.ts#L33-L52)

### Material Design
Centralized Material imports in [material.module.ts](../src/app/material.module.ts) for module-based components. Standalone components import directly.

### Routing
[app-routing-module.ts](../src/app/app-routing-module.ts) uses `PreloadAllModules` strategy. Routes use data objects for tab state (e.g., `data: { tab: 'em-dia' }`).

## Common Patterns

### Service Injection
Use inject() function (modern Angular):
```typescript
private router = inject(Router);
private authService = inject(AuthService);
```

### Reactive State with BehaviorSubject
Pattern from [auth.service.ts](../src/app/services/auth.service.ts#L12-L15):
```typescript
private currentUserSubject: BehaviorSubject<Usuario | null>;
public currentUser: Observable<Usuario | null>;
```

### Error Handling
Components use try-catch with console logging. Auth service includes detailed logging (🔐 emojis) for debugging API calls.

## Environment Configuration
- **Dev**: Direct API URL in [environment.ts](../src/environments/environment.ts), proxy handles `/api` rewrite
- **Prod**: [environment.prod.ts](../src/environments/environment.prod.ts) + [server.js](../server.js) proxy

## Key Files Reference
- [package.json](../package.json): Node 18.19+, npm scripts
- [angular.json](../angular.json): Build config, standalone: false defaults
- [app-module.ts](../src/app/app-module.ts): Module declarations
- [proxy.conf.json](../proxy.conf.json): Dev server API proxy
- [server.js](../server.js): Production Express server with proxy

## Gotchas
- Always declare new components in AppModule (non-standalone default)
- API responses may use Portuguese keys (`usuario`, `codigoPessoa`)
- Proxy config only works with `npm start`, not direct `ng serve`
- PWA manifest in `public/manifest.json`, service worker in `public/sw.js`
