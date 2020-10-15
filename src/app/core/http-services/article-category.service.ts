import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ArticleCategory } from 'src/app/shared/models/article-category.model';
import { DatabaseCollectionService } from './database-collection.service';

@Injectable()
export class ArticleCategoryService extends DatabaseCollectionService<ArticleCategory> {
  constructor(
    database: AngularFireDatabase
  ) {
    super(database, 'article-categories');
  }
}
