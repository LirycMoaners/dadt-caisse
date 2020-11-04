import { Customer } from './customer.model';
import { DatabaseObject } from './database-object.model';
import { SaleArticle } from './sale-article.model';

export class Sale extends DatabaseObject {
  articles: SaleArticle[];
  discount: number;
  discountType: '€' | '%';
  isFidelityDiscount: boolean;
  total: number;
  cardTotal: number;
  cashTotal: number;
  checkTotal: number;
  creditTotal: number;
  customer?: Customer;
}
