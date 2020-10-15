import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { CashOutCategory } from 'src/app/shared/models/cash-out-category.model';
import { DatabaseCollectionService } from './database-collection.service';

@Injectable()
export class CashOutCategoryService extends DatabaseCollectionService<CashOutCategory> {
  constructor(
    database: AngularFireDatabase
  ) {
    super(database, 'cash-out-categories');
  }
}
