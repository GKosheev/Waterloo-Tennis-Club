import {Component, AfterViewInit, ViewChild, OnInit} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {ITableData} from "../../../shared/interfaces/i-table-data";
import {TableService} from "../../../shared/services/player list/table.service";



@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements AfterViewInit, OnInit {

  constructor(private tableService: TableService) {
    this.dataLoaded = false;
  }

  dataLoaded: boolean;
  displayedColumns: string[] = ['fullName', 'phone', 'email', 'rating', 'message'];
  dataSource = new MatTableDataSource<ITableData>();

  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  ngOnInit() {
    this.tableService.loadTableData().subscribe(data => {
      this.dataSource.data = data
        this.dataLoaded = true;
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  redirectToSendEmail(id: string){
  }
}


