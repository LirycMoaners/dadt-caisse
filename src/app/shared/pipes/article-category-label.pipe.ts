import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ArticleCategoryService } from '../../core/http-services/article-category.service';


@Pipe({
  name: 'articleCategoryLabel'
})
export class ArticleCategoryPipe implements PipeTransform {
  constructor(
    private articleCategoryService: ArticleCategoryService
  ) {}

  transform(categoryId: string): Observable<string> {
    return this.articleCategoryService.getAll().pipe(
      map(articleCategories => articleCategories.find(articleCategory => articleCategory.id === categoryId)),
      map(articleCategory => articleCategory ? articleCategory.label : null)
    );
  }
}
