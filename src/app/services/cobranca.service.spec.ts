import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CobrancaService } from './cobranca.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('CobrancaService', () => {
  let service: CobrancaService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/PessoaCobranca`;
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
        CobrancaService,
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    service = TestBed.inject(CobrancaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getCobrancas without pagination params', () => {
    service.getCobrancas().subscribe();

    const req = httpMock.expectOne(`${apiUrl}/usuario/${mockUserId}?includeDeleted=false`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call getCobrancas with pagination params when provided', () => {
    service.getCobrancas({ pageIndex: 0, pageSize: 10 }).subscribe();

    const req = httpMock.expectOne(
      `${apiUrl}/usuario/${mockUserId}?includeDeleted=false&pageIndex=0&pageSize=10`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should include sort params in getCobrancas when provided', () => {
    service.getCobrancas({ pageIndex: 1, pageSize: 20, sortField: 'nome', sortDirection: 'asc' }).subscribe();

    const req = httpMock.expectOne(
      `${apiUrl}/usuario/${mockUserId}?includeDeleted=false&pageIndex=1&pageSize=20&sortField=nome&sortDirection=asc`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call getCobrancaById with correct URL', () => {
    service.getCobrancaById(5).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/5`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call deleteCobranca with correct URL', () => {
    service.deleteCobranca(10).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should call getAllEmDiaLista with correct URL', () => {
    service.getAllEmDiaLista().subscribe();

    const req = httpMock.expectOne(`${apiUrl}/GetAllEmDiaLista/${mockUserId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call getAllAtrasadaLista with correct URL', () => {
    service.getAllAtrasadaLista().subscribe();

    const req = httpMock.expectOne(`${apiUrl}/GetAllAtrasadoLista/${mockUserId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call getAllVenceHojeLista with correct URL', () => {
    service.getAllVenceHojeLista().subscribe();

    const req = httpMock.expectOne(`${apiUrl}/GetAllVenceHojeLista/${mockUserId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
