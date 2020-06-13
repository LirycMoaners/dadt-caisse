import { Pipe, PipeTransform } from '@angular/core';
import { ArticleCategory } from '../models/article-category.model';

@Pipe({
  name: 'articleCategoryLabel'
})
export class ArticleCategoryPipe implements PipeTransform {
  transform(categoryId: string, categories: ArticleCategory[]) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.label : null;
  }
}
