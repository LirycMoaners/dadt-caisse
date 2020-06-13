import { ArticleCategory } from './article-category.model';

export class Article {
  id: string;
  reference: string;
  label: string;
  categoryId: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
}
