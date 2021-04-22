import { Injectable } from '@angular/core';
import { Customer } from 'src/app/shared/models/customer.model';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { SettingsService } from './settings.service';
import { concatMap, delay, first, map, mergeMap } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/database';
import { DatabaseCollectionService } from './database-collection.service';
import { GoogleService } from './google.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class CustomerService extends DatabaseCollectionService<Customer> {
  constructor(
    private readonly settingsService: SettingsService,
    database: AngularFireDatabase,
    authenticationService: AuthenticationService,
    private readonly googleService: GoogleService
  ) {
    super(database, authenticationService, 'customers');
  }

  /**
   * Retourne le stream de tous les clients
   */
  public getAll(): Observable<Customer[]> {
    return super.getAll().pipe(
      map(customers => customers.map(customer => {
        customer.lastDiscountGaveDate = customer.lastDiscountGaveDate && customer.lastDiscountGaveDate !== 'N/A'
          ? new Date(customer.lastDiscountGaveDate)
          : null;
        customer.lastDiscountUsedDate = customer.lastDiscountUsedDate && customer.lastDiscountUsedDate !== 'N/A'
          ? new Date(customer.lastDiscountUsedDate)
          : null;
        return customer;
      }))
    );
  }

  /**
   * Retourne l'observable de tous les clients
   */
  public getAllOneTime(): Observable<Customer[] | undefined> {
    return super.getAllOneTime().pipe(
      map(customers => customers?.map(customer => {
        customer.lastDiscountGaveDate = customer.lastDiscountGaveDate && customer.lastDiscountGaveDate !== 'N/A'
          ? new Date(customer.lastDiscountGaveDate)
          : null;
        customer.lastDiscountUsedDate = customer.lastDiscountUsedDate && customer.lastDiscountUsedDate !== 'N/A'
          ? new Date(customer.lastDiscountUsedDate)
          : null;
        return customer;
      }))
    );
  }

  /**
   * Appel le service de mise à jour de donnée après avoir ajouté des points de fidélité
   * @param customer Le client à modifier
   * @param total Le total en euros devant être converti en points pour qu'ils soient ajoutés aux points du client
   */
  public addPoints(customer: Customer, total: number, isFidelityDiscount: boolean): Observable<boolean> {
    return this.settingsService.getSettings().pipe(
      first(),
      mergeMap(settings => {
        if (settings.pointsForDiscount) {
          const newPoints = customer.loyaltyPoints + Math.round(Math.trunc(total) * settings.pointsToEuro / settings.eurosToPoint);
          const isDiscountGave = newPoints >= settings.pointsForDiscount;
          customer.loyaltyPoints = isDiscountGave ? newPoints - settings.pointsForDiscount : newPoints;
          customer.lastDiscountGaveDate = isDiscountGave ? new Date() : customer.lastDiscountGaveDate;
          customer.lastDiscountUsedDate = isFidelityDiscount ? new Date() : customer.lastDiscountUsedDate;
          return this.update(customer).pipe(mergeMap(() => of(isDiscountGave)));
        }
        return of(false);
      })
    );
  }

  /**
   * Retourne l'observable de la création du client en paramètre
   * @param customer Le client à créer
   * @param isOnlyFirebase Défini si la création doit se faire seulement dans firebase ou également dans les contacts Google
   */
  public create(customer: Customer, isOnlyFirebase = false): Observable<Customer> {
    customer.lastDiscountGaveDate = customer.lastDiscountGaveDate ? (customer.lastDiscountGaveDate as Date).toJSON() : 'N/A';
    customer.lastDiscountUsedDate = customer.lastDiscountUsedDate ? (customer.lastDiscountUsedDate as Date).toJSON() : 'N/A';
    return (isOnlyFirebase ? super.create(customer) : this.settingsService.getSettings().pipe(
      first(),
      mergeMap(settings => {
        if (!settings.contactGroup) {
          return super.create(customer);
        }
        return this.googleService.createContact(customer).pipe(
          mergeMap(person => {
            customer.resourceName = person.resourceName;
            customer.etag = (person.metadata?.sources as gapi.client.people.Source[])[0].etag;
            return super.create(customer);
          })
        );
      })
    )).pipe(
      map(c => {
        c.lastDiscountGaveDate = c.lastDiscountGaveDate && c.lastDiscountGaveDate !== 'N/A'
          ? new Date(c.lastDiscountGaveDate)
          : null;
        c.lastDiscountUsedDate = c.lastDiscountUsedDate && c.lastDiscountUsedDate !== 'N/A'
          ? new Date(c.lastDiscountUsedDate)
          : null;
        return c;
      })
    );
  }

  /**
   * Retourne l'observable de la mise à jour du client en paramètre
   * @param customer Le client à mettre à jour
   * @param isOnlyFirebase Défini si la mise à jour doit se faire seulement dans firebase ou également dans les contacts Google
   */
  public update(customer: Customer, isOnlyFirebase = false): Observable<Customer> {
    customer.lastDiscountGaveDate = customer.lastDiscountGaveDate ? (customer.lastDiscountGaveDate as Date).toJSON() : 'N/A';
    customer.lastDiscountUsedDate = customer.lastDiscountUsedDate ? (customer.lastDiscountUsedDate as Date).toJSON() : 'N/A';
    return (isOnlyFirebase ? super.update(customer) : this.settingsService.getSettings().pipe(
      first(),
      mergeMap(settings => {
        if (!settings.contactGroup) {
          return super.update(customer);
        }
        return this.googleService.updateContact(customer).pipe(
          mergeMap(person => {
            customer.etag = (person.metadata?.sources as gapi.client.people.Source[])[0].etag;
            return super.update(customer);
          })
        );
      })
    )).pipe(
      map(c => {
        c.lastDiscountGaveDate = c.lastDiscountGaveDate && c.lastDiscountGaveDate !== 'N/A'
          ? new Date(c.lastDiscountGaveDate)
          : null;
        c.lastDiscountUsedDate = c.lastDiscountUsedDate && c.lastDiscountUsedDate !== 'N/A'
          ? new Date(c.lastDiscountUsedDate)
          : null;
        return c;
      })
    );
  }

  /**
   * Retourne l'observable de la suppression du client en paramètre
   * @param customer Le client à supprimer
   */
  public delete(customer: Customer): Observable<void> {
    return this.settingsService.getSettings().pipe(
      first(),
      mergeMap(settings => {
        if (!settings.contactGroup) {
          return super.delete(customer);
        }
        return combineLatest([
          this.googleService.deleteContact(customer),
          super.delete(customer)
        ]).pipe(
          map(() => {})
        );
      })
    );
  }

  /**
   * Synchronise les contacts de Google et les clients de Firebase
   * @param customerService Le service des clients
   */
  public syncContactsWithGoogle(): Observable<unknown> {
    return combineLatest([
      this.googleService.getAllContact(),
      this.getAllOneTime()
    ]).pipe(
      mergeMap(([googleCustomers, firebaseCustomers]: [Customer[], Customer[] | undefined]) => {
        firebaseCustomers = !!firebaseCustomers ? firebaseCustomers : [];
        const customersToAddInGoogle = firebaseCustomers.filter(firebaseCustomer =>
          !firebaseCustomer.resourceName
          || googleCustomers.every(googleCustomer => googleCustomer.resourceName !== firebaseCustomer.resourceName)
        );
        const customersToUpdateInGoogle = firebaseCustomers.filter(firebaseCustomer => googleCustomers.some(
          googleCustomer => googleCustomer.resourceName === firebaseCustomer.resourceName
            && (googleCustomer.updateDate as Date).getTime() < (firebaseCustomer.updateDate as Date).getTime()
        ));
        return concat(
          ...customersToAddInGoogle.map(customer => this.googleService.createContact(customer).pipe(
            concatMap(person => {
              customer.resourceName = person.resourceName;
              customer.etag = (person.metadata?.sources as gapi.client.people.Source[])[0].etag;
              return this.update(customer, true);
            }),
            map(t => t),
            delay(750)
          )),
          ...customersToUpdateInGoogle.map(customer => this.googleService.updateContact(customer).pipe(delay(750)))
        );
      })
    );
  }
}
