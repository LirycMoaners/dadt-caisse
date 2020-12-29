import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ArticleCategory } from 'src/app/shared/models/article-category.model';
import { AuthenticationService } from './authentication.service';
import { DatabaseCollectionService } from './database-collection.service';

@Injectable()
export class ArticleCategoryService extends DatabaseCollectionService<ArticleCategory> {
  constructor(
    database: AngularFireDatabase,
    authenticationService: AuthenticationService
  ) {
    super(database, authenticationService, 'article-categories');
  }
}
