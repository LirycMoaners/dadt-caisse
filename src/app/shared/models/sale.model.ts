import { Customer } from './customer.model';
import { DatabaseObject } from './database-object.model';
import { SaleArticle } from './sale-article.model';

export class Sale extends DatabaseObject {
  articles: SaleArticle[] = [];
  discount?: number;
  discountType?: '€' | '%';
  isFidelityDiscount = false;
  total = 0;
  cardTotal = 0;
  cashTotal = 0;
  checkTotal = 0;
  creditTotal = 0;
  customer?: Customer;
}
