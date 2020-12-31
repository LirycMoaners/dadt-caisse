import { SaleArticle } from '../models/sale-article.model';
import { MathTools } from './math.tools';

export class SaleArticleTools {

  /**
   * Retourne le total d'une ligne d'article
   */
  public static getSaleArticleTotal(saleArticle: SaleArticle): number {
    const totalBeforeDiscount = MathTools.multiply(saleArticle.price, saleArticle.quantity);
    if (saleArticle.discount) {
      if (saleArticle.discountType === '%') {
        return MathTools.multiply(totalBeforeDiscount, MathTools.multiply(MathTools.sum(100, -saleArticle.discount), 0.01));
      } else {
        return MathTools.sum(totalBeforeDiscount, - saleArticle.discount);
      }
    }
    return totalBeforeDiscount;
  }

  /**
   * Retourne le total de la vente
   */
  public static getSaleArticlesTotal(saleArticles: SaleArticle[]): number {
    return saleArticles.reduce(
      (total, saleArticle) => MathTools.sum(total, this.getSaleArticleTotal(saleArticle)),
      0
    );
  }

  /**
   * Retourne le total de la vente avant les remises
   */
  public static getSaleArticlesTotalBeforeDiscount(saleArticles: SaleArticle[]): number {
    return saleArticles.reduce(
      (total, saleArticle) => MathTools.sum(total, MathTools.multiply(saleArticle.price, saleArticle.quantity)),
      0
    );
  }
}
