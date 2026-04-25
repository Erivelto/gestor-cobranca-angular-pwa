import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ParcelamentoService } from './parcelamento.service';
import { environment } from '../../environments/environment';

describe('ParcelamentoService', () => {
  let service: ParcelamentoService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ParcelamentoService
      ]
    });

    service = TestBed.inject(ParcelamentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getParcelamentos without pagination params', () => {
    service.getParcelamentos().subscribe();

    const req = httpMock.expectOne(`${apiUrl}/PessoaParcelamento`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call getParcelamentos with pagination params when provided', () => {
    service.getParcelamentos({ pageIndex: 0, pageSize: 10 }).subscribe();

    const req = httpMock.expectOne(
      `${apiUrl}/PessoaParcelamento?pageIndex=0&pageSize=10`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should include sort params in getParcelamentos when provided', () => {
    service.getParcelamentos({ pageIndex: 1, pageSize: 20, sortField: 'valorTotal', sortDirection: 'asc' }).subscribe();

    const req = httpMock.expectOne(
      `${apiUrl}/PessoaParcelamento?pageIndex=1&pageSize=20&sortField=valorTotal&sortDirection=asc`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call getParcelamentoById with correct URL', () => {
    service.getParcelamentoById(5).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/PessoaParcelamento/5`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call criarParcelamento with correct URL and body', () => {
    const parcelamento = { codigo: 0, codigoPessoa: 1, quantidadeParcelas: 3, valorTotal: 900, excluido: false } as any;
    service.criarParcelamento(parcelamento).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/PessoaParcelamento`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(parcelamento);
    req.flush(parcelamento);
  });

  it('should call excluirParcelamento with correct URL', () => {
    service.excluirParcelamento(10).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/PessoaParcelamento/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should create parcelamento with detalhes using switchMap', () => {
    const parcelamento = { codigo: 0, codigoPessoa: 1, quantidadeParcelas: 2, valorTotal: 200, excluido: false } as any;

    service.criarParcelamentoComDetalhes(parcelamento, '2025-01-01').subscribe(result => {
      expect(result.codigo).toBe(99);
    });

    // First: POST to create parcelamento
    const parcelamentoReq = httpMock.expectOne(`${apiUrl}/PessoaParcelamento`);
    expect(parcelamentoReq.request.method).toBe('POST');
    parcelamentoReq.flush({ ...parcelamento, codigo: 99 });

    // Then: 2 sequential POSTs for detalhes (concatMap)
    const detalhe1Req = httpMock.expectOne(`${apiUrl}/PessoaParcelamento/detalhes`);
    expect(detalhe1Req.request.method).toBe('POST');
    expect(detalhe1Req.request.body.numeroParcela).toBe(1);
    detalhe1Req.flush({ codigo: 1 });

    const detalhe2Req = httpMock.expectOne(`${apiUrl}/PessoaParcelamento/detalhes`);
    expect(detalhe2Req.request.method).toBe('POST');
    expect(detalhe2Req.request.body.numeroParcela).toBe(2);
    detalhe2Req.flush({ codigo: 2 });
  });
});
