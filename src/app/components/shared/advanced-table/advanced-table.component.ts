import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'currency' | 'status' | 'actions';
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  label: string;
  icon: string;
  color?: 'primary' | 'accent' | 'warn';
  action: (item: any) => void;
  visible?: (item: any) => boolean;
}

@Component({
  selector: 'app-advanced-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './advanced-table.component.html',
  styleUrls: ['./advanced-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvancedTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() showSelection = false;
  @Input() showSearch = true;
  @Input() showPagination = true;
  @Input() pageSize = 10;
  @Input() loading = false;
  @Input() emptyMessage = 'Nenhum dado encontrado';

  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() rowClick = new EventEmitter<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  searchTerm = '';

  get displayedColumns(): string[] {
    const cols = this.showSelection ? ['select'] : [];
    cols.push(...this.columns.map(col => col.key));
    if (this.actions.length > 0) {
      cols.push('actions');
    }
    return cols;
  }

  ngOnInit() {
    this.dataSource.data = this.data;
    this.setupTableFeatures();
  }

  private setupTableFeatures() {
    // Setup pagination
    if (this.showPagination) {
      this.dataSource.paginator = this.paginator;
    }

    // Setup sorting
    this.dataSource.sort = this.sort;

    // Setup search filter
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
        return currentTerm + (data as {[key: string]: any})[key] + '◬';
      }, '').toLowerCase();
      
      const transformedFilter = filter.trim().toLowerCase();
      return searchStr.indexOf(transformedFilter) !== -1;
    };
  }

  applyFilter() {
    this.dataSource.filter = this.searchTerm;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
    this.selectionChange.emit(this.selection.selected);
  }

  toggleRow(row: any) {
    this.selection.toggle(row);
    this.selectionChange.emit(this.selection.selected);
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  executeAction(action: TableAction, item: any) {
    action.action(item);
  }

  isActionVisible(action: TableAction, item: any): boolean {
    return action.visible ? action.visible(item) : true;
  }

  getColumnValue(item: any, column: TableColumn): any {
    return item[column.key];
  }

  formatValue(value: any, type: string): string {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR');
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(value);
      default:
        return value?.toString() || '';
    }
  }

  getStatusClass(value: string): string {
    const statusClasses: {[key: string]: string} = {
      'ativo': 'status-success',
      'inativo': 'status-warning',
      'pendente': 'status-info',
      'cancelado': 'status-error',
      'concluido': 'status-success',
      'em_andamento': 'status-info'
    };
    return statusClasses[value?.toLowerCase()] || 'status-default';
  }
}