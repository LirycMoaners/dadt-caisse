import { CashOutCategory } from './cash-out-category.model';
import { DatabaseObject } from './database-object.model';

export class CashOut extends DatabaseObject {
  label = '';
  cashOutCategory: CashOutCategory;
  total = 0;

  constructor() {
    super();
    const today = new Date();
    this.createDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.updateDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.cashOutCategory = new CashOutCategory();
  }
}
