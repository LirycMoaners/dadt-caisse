import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ArticleCategory } from 'src/app/shared/models/article-category.model';

@Injectable()
export class ArticleCategoryService {
  private articleCategories$: BehaviorSubject<ArticleCategory[]> = new BehaviorSubject([
    {
      id: '1',
      label: 'Fil à tricoter'
    },
    {
      id: '2',
      label: 'Prêt à porter'
    },
    {
      id: '3',
      label: 'Collants/Divers'
    }
  ]);

  constructor() { }

  /**
   * Retourne l'observable des catégories d'article
   */
  public getAll(): Observable<ArticleCategory[]> {
    return this.articleCategories$;
  }
}
