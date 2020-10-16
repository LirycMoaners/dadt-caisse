import { Injectable } from '@angular/core';
import { Customer } from 'src/app/shared/models/customer.model';
import { Observable, of } from 'rxjs';
import { SettingsService } from './settings.service';
import { first, mergeMap } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/database';
import { DatabaseCollectionService } from './database-collection.service';

@Injectable()
export class CustomerService extends DatabaseCollectionService<Customer> {
  constructor(
    private readonly settingsService: SettingsService,
    database: AngularFireDatabase
  ) {
    super(database, 'customers');
  }

  /**
   * Appel le service de mise à jour de donnée après avoir ajouté des points de fidélité
   * @param customer Le client à modifier
   * @param total Le total en euros devant être converti en points pour qu'ils soient ajoutés aux points du client
   */
  public addPoints(customer: Customer, total: number): Observable<boolean> {
    return this.settingsService.getSettings().pipe(
      first(),
      mergeMap(settings => {
        const newPoints = customer.loyaltyPoints + Math.round(Math.trunc(total) * settings.pointsToEuro / settings.eurosToPoint);
        const isFidelityDiscount = newPoints >= settings.pointsForDiscount;
        customer.loyaltyPoints = isFidelityDiscount ? newPoints - settings.pointsForDiscount : newPoints;
        return this.update(customer).pipe(mergeMap(() => of(isFidelityDiscount)));
      })
    );
  }
}
