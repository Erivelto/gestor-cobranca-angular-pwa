import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PessoaService } from './pessoa.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('PessoaService', () => {
  let service: PessoaService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/Pessoa`;
  const mockUserId = 42;

  beforeEach(() => {
    const authServiceMock = {
      getRequiredUserId: () => mockUserId,
      currentUserValue: { id: mockUserId }
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PessoaService,
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    service = TestBed.inject(PessoaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getPessoas without pagination params', () => {
    service.getPessoas().subscribe();

    const req = httpMock.expectOne(`${apiUrl}/usuario/${mockUserId}?includeDeleted=false`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call getPessoas with pagination params when provided', () => {
    service.getPessoas(false, { pageIndex: 0, pageSize: 10 }).subscribe();

    const req = httpMock.expectOne(
      `${apiUrl}/usuario/${mockUserId}?includeDeleted=false&pageIndex=0&pageSize=10`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should include sort params in getPessoas when provided', () => {
    service.getPessoas(false, { pageIndex: 0, pageSize: 20, sortField: 'nome', sortDirection: 'desc' }).subscribe();

    const req = httpMock.expectOne(
      `${apiUrl}/usuario/${mockUserId}?includeDeleted=false&pageIndex=0&pageSize=20&sortField=nome&sortDirection=desc`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should pass includeDeleted=true when requested', () => {
    service.getPessoas(true).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/usuario/${mockUserId}?includeDeleted=true`);
    expect(req.request.method).toBe('GET');
    req.flush([{ status: 0, excluido: true, nome: 'Test' }]);
  });

  it('should filter out excluido/status=0 when includeDeleted=false', () => {
    service.getPessoas(false).subscribe(result => {
      expect(result.length).toBe(1);
      expect(result[0].nome).toBe('Active');
    });

    const req = httpMock.expectOne(`${apiUrl}/usuario/${mockUserId}?includeDeleted=false`);
    req.flush([
      { nome: 'Active', status: 1, excluido: false },
      { nome: 'Deleted', status: 0, excluido: true }
    ]);
  });

  it('should call getPessoaById with correct URL', () => {
    service.getPessoaById(5).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/5`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
