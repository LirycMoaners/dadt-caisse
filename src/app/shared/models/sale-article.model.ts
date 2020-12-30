import { Article } from './article.model';

export class SaleArticle {
  id: string | null;
  reference: string;
  label: string;
  categoryId: string;
  price: number;
  quantity: number;
  discount?: number;
  discountType?: '%' | '€';

  constructor(article: Article) {
    this.id = article.id;
    this.reference = article.reference;
    this.label = article.label;
    this.categoryId = article.categoryId;
    this.price = article.sellPrice;
    this.quantity = article.quantity;
  }
}
