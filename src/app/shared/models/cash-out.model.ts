import { CashOutCategory } from './cash-out-category.model';

export class CashOut {
  id: string;
  label: string;
  cashOutCategory: CashOutCategory;
  total: number;
  date: Date;

  constructor() {
    const today = new Date();
    this.date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.cashOutCategory = new CashOutCategory();
  }
}
