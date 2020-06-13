import { Injectable } from '@angular/core';
import { Customer } from 'src/app/shared/models/customer.model';
import { Observable, of, BehaviorSubject } from 'rxjs';

@Injectable()
export class CustomerService {
  private customers$: BehaviorSubject<Customer[]> = new BehaviorSubject([
    {
      id: '1',
      firstName: 'Prénom 1',
      lastName: 'Nom de famille 1',
      emailAddress: 'test.1@gmail.com',
      phoneNumber: '0123456789',
      loyaltyPoints: 10
    },
    {
      id: '2',
      firstName: 'Prénom 2',
      lastName: 'Nom de famille 2',
      emailAddress: 'test.2@gmail.com',
      phoneNumber: '0123456789',
      loyaltyPoints: 20
    },
    {
      id: '3',
      firstName: 'Prénom 3',
      lastName: 'Nom de famille 3',
      emailAddress: 'test.3@gmail.com',
      phoneNumber: '0123456789',
      loyaltyPoints: 30
    },
    {
      id: '4',
      firstName: 'Prénom 4',
      lastName: 'Nom de famille 4',
      emailAddress: 'test.4@gmail.com',
      phoneNumber: '0123456789',
      loyaltyPoints: 40
    },
    {
      id: '5',
      firstName: 'Prénom 5',
      lastName: 'Nom de famille 5',
      emailAddress: 'test.5@gmail.com',
      phoneNumber: '0123456789',
      loyaltyPoints: 50
    },
  ]);

  constructor() { }

  /**
   * Retourne l'observable des clients
   */
  public getAll(): Observable<Customer[]> {
    return this.customers$;
  }

  /**
   * Appel le service de création de client
   * @param customer Le client à ajouter
   */
  public create(customer: Customer): Observable<Customer> {
    this.customers$.next([...this.customers$.getValue(), customer]);
    return of(customer);
  }

  /**
   * Appel le service de mise de modification de client
   * @param customer Le client mis à jour
   */
  public update(customer: Customer): Observable<Customer> {
    const customers = this.customers$.getValue();
    const oldCustomer = customers.find(c => c.id === customer.id);

    if (oldCustomer) {
      customers.splice(customers.indexOf(oldCustomer), 1, customer);
      this.customers$.next(customers);
      return of(customer);
    }

    return of(null);
  }

  /**
   * Appel le service de suppression de client
   * @param id Id du client à supprimer
   */
  public delete(id: string): Observable<Customer> {
    const customers = this.customers$.getValue();
    const customer = customers.find(c => c.id === id);

    if (customer) {
      customers.splice(customers.indexOf(customer), 1);
      this.customers$.next(customers);
      return of(customer);
    }

    return of(null);
  }
}
