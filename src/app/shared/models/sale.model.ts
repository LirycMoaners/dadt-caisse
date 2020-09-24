export class Sale {
  id: string;
  articles: {id: string, sellPrice: number, quantity: number} [];
  total: number;
  creditCardTotal: number;
  cashTotal: number;
  checkTotal: number;
}
