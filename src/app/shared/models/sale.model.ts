import { Customer } from './customer.model';
import { SaleArticle } from './sale-article.model';

export class Sale {
  id: string;
  articles: SaleArticle[];
  discount: number;
  discountType: '€' | '%';
  total: number;
  cardTotal: number;
  cashTotal: number;
  checkTotal: number;
  creditTotal: number;
  date: Date;
  customer?: Customer;
}
