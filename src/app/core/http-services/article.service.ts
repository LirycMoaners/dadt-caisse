import { Injectable } from '@angular/core';
import { Article } from 'src/app/shared/models/article.model';
import { Observable, of, BehaviorSubject } from 'rxjs';

@Injectable()
export class ArticleService {
  private articles$: BehaviorSubject<Article[]> = new BehaviorSubject([
    {
      id: '1',
      reference: 'REF1',
      label: 'Article 1',
      categoryId: '1',
      buyPrice: 1,
      sellPrice: 1,
      quantity: 10
    },
    {
      id: '2',
      reference: 'REF2',
      label: 'Article 2',
      categoryId: '1',
      buyPrice: 2,
      sellPrice: 2,
      quantity: 20
    },
    {
      id: '3',
      reference: 'REF3',
      label: 'Article 3',
      categoryId: '2',
      buyPrice: 3,
      sellPrice: 3,
      quantity: 30
    },
    {
      id: '4',
      reference: 'REF4',
      label: 'Article 4',
      categoryId: '2',
      buyPrice: 4,
      sellPrice: 4,
      quantity: 40
    },
    {
      id: '5',
      reference: 'REF5',
      label: 'Article 5',
      categoryId: '3',
      buyPrice: 5,
      sellPrice: 5,
      quantity: 50
    }
  ]);

  constructor() { }

  /**
   * Retourne l'observable des articles
   */
  public getAll(): Observable<Article[]> {
    return this.articles$;
  }

  /**
   * Appel au service de création d'article
   * @param article L'article à créer
   */
  public create(article: Article): Observable<Article> {
    this.articles$.next([...this.articles$.getValue(), article]);
    return of(article);
  }

  /**
   * Appel au service de modification d'article
   * @param article Article modifié
   */
  public update(article: Article): Observable<Article> {
    const articles = this.articles$.getValue();
    const oldArticle = articles.find(c => c.id === article.id);

    if (oldArticle) {
      articles.splice(articles.indexOf(oldArticle), 1, article);
      this.articles$.next(articles);
      return of(article);
    }

    return of(null);
  }

  /**
   * Appel au service de suppression d'article
   * @param id Id de l'article à supprimer
   */
  public delete(id: string): Observable<Article> {
    const articles = this.articles$.getValue();
    const article = articles.find(c => c.id === id);

    if (article) {
      articles.splice(articles.indexOf(article), 1);
      this.articles$.next(articles);
      return of(article);
    }

    return of(null);
  }
}
