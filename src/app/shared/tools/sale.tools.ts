import { ValidatorFn } from '@angular/forms';
import { Sale } from '../models/sale.model';
import { Settings } from '../models/settings.model';
import { MathTools } from './math.tools';
import { SaleArticleTools } from './sale-article.tools';

export class SaleTools {

  /**
   * Retourne le validateur permettant de vérifier si le cumule des totaux par mode de paiement est égal au total de la vente en paramètre
   * @param sale La vente dont le total sert de comparaison
   */
  public static totalEqualToCumulatedValidator(sale: Sale): ValidatorFn {
    return (control) =>
      sale.total === MathTools.sum(
        MathTools.sum(control.get('cashTotal')?.value, control.get('cardTotal')?.value),
        MathTools.sum(control.get('checkTotal')?.value, control.get('creditTotal')?.value)
      ) ? null : {totalNotEqualToCumulated: 'La somme des totaux n\'est pas égale au total de la vente !'};
  }

  /**
   * Retourne le total de la vente avant application de la remise globale de la vente
   */
  public static getSaleTotalBeforeDiscount(sale: Sale): number {
    return sale.articles.reduce((total, saleArticle) => MathTools.sum(total, SaleArticleTools.getSaleArticleTotal(saleArticle)), 0);
  }

  /**
   * Retourne le total de la vente avant application de la TVA
   */
  public static getSaleTotalBeforeTaxe(sale: Sale, settings: Settings): number {
    return MathTools.multiply(sale.total, MathTools.multiply(MathTools.sum(100, -settings.taxeRate), 0.01));
  }
}
