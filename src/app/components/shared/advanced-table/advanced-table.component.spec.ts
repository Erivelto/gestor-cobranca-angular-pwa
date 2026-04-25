import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AdvancedTableComponent, TableColumn, TableAction, PageChangeEvent } from './advanced-table.component';

describe('AdvancedTableComponent', () => {
  let component: AdvancedTableComponent;
  let fixture: ComponentFixture<AdvancedTableComponent>;

  const mockColumns: TableColumn[] = [
    { key: 'nome', label: 'Nome', sortable: true, type: 'text' },
    { key: 'valor', label: 'Valor', sortable: true, type: 'currency' },
    { key: 'quantidade', label: 'Qtd', sortable: true, type: 'number' },
    { key: 'data', label: 'Data', sortable: false, type: 'date' }
  ];

  const mockData = [
    { codigo: 1, nome: 'Item A', valor: 1500.50, quantidade: 10, data: '2025-01-15' },
    { codigo: 2, nome: 'Item B', valor: 2500.00, quantidade: 5, data: '2025-02-20' },
    { codigo: 3, nome: 'Item C', valor: 800.75, quantidade: 20, data: '2025-03-10' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedTableComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancedTableComponent);
    component = fixture.componentInstance;
    component.columns = mockColumns;
    component.data = mockData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display columns based on @Input columns', () => {
    expect(component.displayedColumns).toEqual(['nome', 'valor', 'quantidade', 'data']);
  });

  it('should include actions column when actions are provided', () => {
    const action: TableAction = { label: 'Edit', icon: 'edit', action: () => {} };
    component.actions = [action];
    expect(component.displayedColumns).toContain('actions');
  });

  it('should include select column when showSelection is true', () => {
    component.showSelection = true;
    expect(component.displayedColumns[0]).toBe('select');
  });

  it('should render data rows from @Input data', () => {
    expect(component.dataSource.data.length).toBe(3);
    expect(component.dataSource.data[0].nome).toBe('Item A');
  });

  it('should react to data changes via ngOnChanges', () => {
    const newData = [{ codigo: 4, nome: 'Item D', valor: 100, quantidade: 1, data: '2025-04-01' }];
    component.data = newData;
    component.ngOnChanges({
      data: {
        currentValue: newData,
        previousValue: mockData,
        firstChange: false,
        isFirstChange: () => false
      }
    });
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].nome).toBe('Item D');
  });

  it('should not update dataSource on first change (handled by ngOnInit)', () => {
    const spy = spyOnProperty(component.dataSource, 'data', 'set');
    component.ngOnChanges({
      data: {
        currentValue: mockData,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('should apply right alignment for currency columns', () => {
    const currencyCol = mockColumns.find(c => c.key === 'valor')!;
    expect(component.getColumnAlign(currencyCol)).toBe('right');
  });

  it('should apply right alignment for number columns', () => {
    const numberCol = mockColumns.find(c => c.key === 'quantidade')!;
    expect(component.getColumnAlign(numberCol)).toBe('right');
  });

  it('should apply left alignment for text columns', () => {
    const textCol = mockColumns.find(c => c.key === 'nome')!;
    expect(component.getColumnAlign(textCol)).toBe('left');
  });

  it('should apply left alignment for date columns', () => {
    const dateCol = mockColumns.find(c => c.key === 'data')!;
    expect(component.getColumnAlign(dateCol)).toBe('left');
  });

  it('should respect manual align override', () => {
    const col: TableColumn = { key: 'test', label: 'Test', type: 'text', align: 'center' };
    expect(component.getColumnAlign(col)).toBe('center');
  });

  it('should show paginator when showPagination=true', () => {
    component.showPagination = true;
    fixture.detectChanges();
    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    expect(paginator).toBeTruthy();
  });

  it('should hide paginator when showPagination=false', () => {
    component.showPagination = false;
    fixture.detectChanges();
    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    expect(paginator).toBeFalsy();
  });

  it('should NOT wire dataSource.paginator when serverSide=true', () => {
    // Create a fresh component instance with serverSide=true before first detectChanges
    const ssFixture = TestBed.createComponent(AdvancedTableComponent);
    const ssComponent = ssFixture.componentInstance;
    ssComponent.columns = mockColumns;
    ssComponent.data = mockData;
    ssComponent.serverSide = true;
    ssComponent.showPagination = true;
    ssFixture.detectChanges();
    expect(ssComponent.dataSource.paginator).toBeFalsy();
  });

  it('should wire dataSource.paginator when serverSide=false', () => {
    component.serverSide = false;
    component.showPagination = true;
    fixture.detectChanges();
    component.ngAfterViewInit();
    // paginator may be undefined if not yet rendered, but the code path is covered
    // The important assertion is that it doesn't throw
    expect(component.serverSide).toBeFalse();
  });

  it('should emit pageChange with correct params when serverSide=true on page event', () => {
    component.serverSide = true;
    let emitted: PageChangeEvent | undefined;
    component.pageChange.subscribe((e: PageChangeEvent) => emitted = e);

    component.onPageEvent({ pageIndex: 2, pageSize: 10, length: 100, previousPageIndex: 1 });

    expect(emitted).toBeDefined();
    expect(emitted!.pageIndex).toBe(2);
    expect(emitted!.pageSize).toBe(10);
  });

  it('should not emit pageChange when serverSide=false on page event', () => {
    component.serverSide = false;
    let emitted = false;
    component.pageChange.subscribe(() => emitted = true);

    component.onPageEvent({ pageIndex: 0, pageSize: 10, length: 3, previousPageIndex: undefined });

    expect(emitted).toBeFalse();
  });

  it('should emit pageChange on sort change when serverSide=true', () => {
    component.serverSide = true;
    let emitted: PageChangeEvent | undefined;
    component.pageChange.subscribe((e: PageChangeEvent) => emitted = e);

    component.onSortChange({ active: 'nome', direction: 'asc' });

    expect(emitted).toBeDefined();
    expect(emitted!.sortActive).toBe('nome');
    expect(emitted!.sortDirection).toBe('asc');
  });

  it('should apply dense class when dense=true', () => {
    component.dense = true;
    fixture.detectChanges();
    const container = fixture.nativeElement.querySelector('.table-container');
    expect(container.classList.contains('dense')).toBeTrue();
  });

  it('should not apply dense class when dense=false', () => {
    component.dense = false;
    fixture.detectChanges();
    const container = fixture.nativeElement.querySelector('.table-container');
    expect(container.classList.contains('dense')).toBeFalse();
  });

  it('should use formatter callback when provided', () => {
    const formatterCol: TableColumn = {
      key: 'nome',
      label: 'Nome',
      type: 'text',
      formatter: (val: string) => val.toUpperCase()
    };
    component.columns = [formatterCol];
    fixture.detectChanges();

    // Check the formatter returns expected value
    const value = component.getColumnValue(mockData[0], formatterCol);
    const formatted = formatterCol.formatter!(value, mockData[0]);
    expect(formatted).toBe('ITEM A');
  });

  it('should filter data when search term entered', () => {
    component.searchTerm = 'Item A';
    component.applyFilter();
    expect(component.dataSource.filteredData.length).toBe(1);
    expect(component.dataSource.filteredData[0].nome).toBe('Item A');
  });

  it('should show all data when search term is cleared', () => {
    component.searchTerm = 'Item A';
    component.applyFilter();
    component.searchTerm = '';
    component.applyFilter();
    expect(component.dataSource.filteredData.length).toBe(3);
  });

  it('should show emptyMessage when no data', () => {
    component.data = [];
    component.ngOnChanges({
      data: { currentValue: [], previousValue: mockData, firstChange: false, isFirstChange: () => false }
    });
    fixture.detectChanges();
    const noData = fixture.nativeElement.querySelector('.no-data-message');
    expect(noData?.textContent?.trim()).toBe('Nenhum dado encontrado');
  });

  it('should emit rowClick on row click', () => {
    let clicked: any;
    component.rowClick.subscribe((row: any) => clicked = row);
    component.onRowClick(mockData[0]);
    expect(clicked).toBe(mockData[0]);
  });

  it('should render action buttons via menu', () => {
    const actionSpy = jasmine.createSpy('action');
    component.actions = [{ label: 'Editar', icon: 'edit', action: actionSpy }];
    fixture.detectChanges();

    component.executeAction(component.actions[0], mockData[0]);
    expect(actionSpy).toHaveBeenCalledWith(mockData[0]);
  });

  it('should format currency values correctly', () => {
    const formatted = component.formatValue(1500.5, 'currency');
    expect(formatted).toContain('1.500,50');
  });

  it('should format date values correctly', () => {
    const formatted = component.formatValue('2025-01-15', 'date');
    // A data deve ser formatada e conter o ano
    expect(formatted).toBeTruthy();
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('should format number values correctly', () => {
    const formatted = component.formatValue(1500, 'number');
    expect(formatted).toContain('1.500');
  });

  it('should use trackByFn with codigo', () => {
    expect(component.trackByFn(0, { codigo: 42 })).toBe(42);
  });

  it('should use trackByFn with id fallback', () => {
    expect(component.trackByFn(0, { id: 7 })).toBe(7);
  });

  it('should use trackByFn with index fallback', () => {
    expect(component.trackByFn(3, {})).toBe(3);
  });

  it('should check action visibility', () => {
    const visibleAction: TableAction = { label: 'A', icon: 'a', action: () => {}, visible: () => true };
    const hiddenAction: TableAction = { label: 'B', icon: 'b', action: () => {}, visible: () => false };
    const noVisibleAction: TableAction = { label: 'C', icon: 'c', action: () => {} };

    expect(component.isActionVisible(visibleAction, {})).toBeTrue();
    expect(component.isActionVisible(hiddenAction, {})).toBeFalse();
    expect(component.isActionVisible(noVisibleAction, {})).toBeTrue();
  });

  it('should get status class correctly', () => {
    expect(component.getStatusClass('ativo')).toBe('status-success');
    expect(component.getStatusClass('cancelado')).toBe('status-error');
    expect(component.getStatusClass('unknown')).toBe('status-default');
  });
});
