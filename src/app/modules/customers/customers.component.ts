import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { CustomerService } from 'src/app/core/http-services/customer.service';
import { Customer } from 'src/app/shared/models/customer.model';
import { CustomerDialogComponent } from './customer-dialog/customer-dialog.component';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable, {read: ElementRef}) table: ElementRef;
  public dataSource: MatTableDataSource<Customer> = new MatTableDataSource();
  public displayedColumns: string[] = ['firstName', 'lastName', 'emailAddress', 'phoneNumber', 'loyaltyPoints', 'lastDiscountGaveDate', 'lastDiscountUsedDate', 'actions'];

  constructor(
    private readonly dialog: MatDialog,
    private readonly customerService: CustomerService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.customerService.getAll().subscribe(customers => {
        this.dataSource = new MatTableDataSource(
          [...customers].sort((customerA, customerB) => {
            let result = customerA.firstName.localeCompare(customerB.firstName);
            if (result === 0) {
              result = customerA.lastName.localeCompare(customerB.lastName);
            }
            return result;
          })
        );
        this.dataSource.paginator = this.paginator;
        this.paginator.page.subscribe(() => this.table.nativeElement.scrollIntoView(true));
      });
    }, 0);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.dataSource.data = this.dataSource.sortData(this.dataSource.data, this.sort));
  }

  /**
   * Applique le filtre saisie par l'utilisateur
   * @param event Evénement déclenché à chaque saisie clavier
   */
  public applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Ouverture de la modale d'ajout et appel au service pour l'ajout
   */
  public addCustomer(): void {
    const dialogRef = this.dialog.open(CustomerDialogComponent);

    dialogRef.afterClosed().pipe(
      mergeMap((customer: Customer) => customer ? this.customerService.create(customer) : of(null))
    ).subscribe();
  }

  /**
   * Ouverture de la modale pour modifier le client et appel au service pour la modification
   * @param customer Le client devant être modifié
   */
  public editCustomer(customer: Customer): void {
    const dialogRef = this.dialog.open(CustomerDialogComponent, {data: customer});

    dialogRef.afterClosed().pipe(
      mergeMap((newCustomer: Customer) => this.customerService.update(newCustomer))
    ).subscribe();
  }

  /**
   * Appel au service de suppression
   * @param customer Le client devant être supprimé
   */
  public deleteCustomer(customer: Customer): void {
    if (confirm('Souhaitez-vous réellement supprimer le/la client(e) ' + customer.lastName + ' ' + customer.firstName + ' ?')) {
      this.customerService.delete(customer).subscribe();
    }
  }

}
