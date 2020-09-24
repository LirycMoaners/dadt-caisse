import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Sale } from 'src/app/shared/models/sale.model';

@Injectable()
export class SaleService {
  private sales$: BehaviorSubject<Sale[]> = new BehaviorSubject([]);

  constructor() { }

  /**
   * Retourne l'observable des ventes
   */
  public getAll(): Observable<Sale[]> {
    return this.sales$;
  }

  /**
   * Appel au service de création d'une vente
   * @param sale La vente à créer
   */
  public create(sale: Sale): Observable<Sale> {
    this.sales$.next([...this.sales$.getValue(), sale]);
    return of(sale);
  }
}
