import { CashOutCategory } from './cash-out-category.model';
import { DatabaseObject } from './database-object.model';

export class CashOut extends DatabaseObject {
  label: string;
  cashOutCategory: CashOutCategory;
  total: number;

  constructor() {
    super();
    const today = new Date();
    this.createDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.updateDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.cashOutCategory = new CashOutCategory();
  }
}
