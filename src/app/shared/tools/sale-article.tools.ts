import { SaleArticle } from '../models/sale-article.model';

export class SaleArticleTools {

  /**
   * Retourne le total d'une ligne d'article
   */
  public static getSaleArticleTotal(saleArticle: SaleArticle): number {
    let total: string;
    if (saleArticle.discount) {
      if (saleArticle.discountType === '%') {
        total = (
          Math.round(saleArticle.price * 100 * saleArticle.quantity)
          - Math.round(saleArticle.price * saleArticle.discount * saleArticle.quantity)
        ).toString();
      } else {
        total = (Math.round(saleArticle.price * saleArticle.quantity * 100) - Math.round(saleArticle.discount * 100)).toString();
      }
    } else {
      total = Math.round(saleArticle.price * 100 * saleArticle.quantity).toString();
    }
    total = total.substring(0, total.length - 2) + '.' + total.substring(total.length - 2, total.length);
    return Number(total);
  }

  /**
   * Retourne le total de la vente
   */
  public static getSaleArticlesTotal(saleArticles: SaleArticle[]): number {
    let totalString: string = saleArticles.reduce((total, saleArticle) => {
      return total + Math.round(this.getSaleArticleTotal(saleArticle) * 100);
    }, 0).toString();
    totalString = totalString.substring(0, totalString.length - 2)
      + '.'
      + totalString.substring(totalString.length - 2, totalString.length);
    return Number(totalString);
  }
}
