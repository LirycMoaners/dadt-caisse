import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ReplaySubject } from 'rxjs';
import { SaleArticle } from 'src/app/shared/models/sale-article.model';
import { Sale } from 'src/app/shared/models/sale.model';
import { AuthenticationService } from './authentication.service';
import { DatabaseCollectionService } from './database-collection.service';

@Injectable()
export class SaleService extends DatabaseCollectionService<Sale> {
  public currentSaleArticles$: ReplaySubject<SaleArticle[]> = new ReplaySubject(1);

  constructor(
    database: AngularFireDatabase,
    authenticationService: AuthenticationService
  ) {
    super(database, authenticationService, 'sales');
  }
}
