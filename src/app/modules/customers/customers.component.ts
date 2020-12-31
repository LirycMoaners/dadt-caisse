import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
export class CustomersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatTable, {read: ElementRef}) table?: ElementRef;
  public dataSource: MatTableDataSource<Customer> = new MatTableDataSource();
  public displayedColumns: string[] = ['firstName', 'lastName', 'emailAddress', 'phoneNumber', 'loyaltyPoints', 'lastDiscountGaveDate', 'lastDiscountUsedDate', 'actions'];

  constructor(
    private readonly dialog: MatDialog,
    private readonly customerService: CustomerService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.customerService.getAll().subscribe(customers => {
        this.dataSource.paginator = this.paginator as MatPaginator;
        this.dataSource.sort = this.sort as MatSort;
        this.dataSource.sortingDataAccessor = (data, attribute) => {
          switch (attribute) {
            case 'lastDiscountGaveDate':
            case 'lastDiscountUsedDate':
              return (data[attribute] as Date).toString();
            case 'loyaltyPoints':
              return data[attribute];
            default:
              return data[attribute as 'firstName' | 'lastName' | 'emailAddress' | 'phoneNumber'].toLocaleUpperCase();
          }
        };
        this.dataSource.data = [...customers].sort((customerA, customerB) => {
          let result = customerA.firstName.toLocaleUpperCase().localeCompare(customerB.firstName.toLocaleUpperCase());
          if (result === 0) {
            result = customerA.lastName.toLocaleUpperCase().localeCompare(customerB.lastName.toLocaleUpperCase());
          }
          return result;
        });
        this.paginator?.page.subscribe(() => this.table?.nativeElement.scrollIntoView(true));
      });
    }, 0);
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
      mergeMap((newCustomer: Customer) => !!newCustomer ? this.customerService.update(newCustomer) : of(null))
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
