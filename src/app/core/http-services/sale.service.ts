import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { SaleArticle } from 'src/app/shared/models/sale-article.model';
import { Sale } from 'src/app/shared/models/sale.model';
import { DatabaseCollectionService } from './database-collection.service';

@Injectable()
export class SaleService extends DatabaseCollectionService<Sale> {
  public dayTotal$: BehaviorSubject<number>;
  public currentSaleArticles$: ReplaySubject<SaleArticle[]> = new ReplaySubject(1);

  constructor(
    database: AngularFireDatabase
  ) {
    super(database, 'sales');
    const todayMidnight = new Date();
    todayMidnight.setHours(0);
    todayMidnight.setMinutes(0);
    todayMidnight.setSeconds(0);
    todayMidnight.setMilliseconds(0);
    this.getAll().pipe(first()).subscribe(
      sales => this.dayTotal$ = new BehaviorSubject(
        sales.filter(sale => sale.createDate.valueOf() >= todayMidnight.valueOf()).reduce((total, sale) => total + sale.total, 0)
      )
    );
  }
}
