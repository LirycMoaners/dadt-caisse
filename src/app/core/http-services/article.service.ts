import { Injectable } from '@angular/core';
import { Article } from 'src/app/shared/models/article.model';
import { DatabaseCollectionService } from './database-collection.service';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable()
export class ArticleService extends DatabaseCollectionService<Article> {
  constructor(
    database: AngularFireDatabase
  ) {
    super(database, 'articles');
  }
}
