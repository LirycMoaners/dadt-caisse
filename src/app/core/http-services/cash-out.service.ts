import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { CashOut } from 'src/app/shared/models/cash-out.model';
import { AuthenticationService } from './authentication.service';
import { DatabaseCollectionService } from './database-collection.service';

@Injectable()
export class CashOutService extends DatabaseCollectionService<CashOut> {
  constructor(
    database: AngularFireDatabase,
    authenticationService: AuthenticationService
  ) {
    super(database, authenticationService, 'cash-outs');
  }
}
