import { ValidatorFn } from '@angular/forms';
import { Sale } from '../models/sale.model';
import { Settings } from '../models/settings.model';
import { SaleArticleTools } from './sale-article.tools';

export class SaleTools {

  /**
   * Retourne le validateur permettant de vérifier si le cumule des totaux par mode de paiement est égal au total de la vente en paramètre
   * @param sale La vente dont le total sert de comparaison
   */
  public static totalEqualToCumulatedValidator(sale: Sale): ValidatorFn {
    return (control) =>
      Math.round(sale.total * 100).toString() === (
        Math.round(control.get('cashTotal').value * 100)
        + Math.round(control.get('cardTotal').value * 100)
        + Math.round(control.get('checkTotal').value * 100)
        + Math.round(control.get('creditTotal').value * 100)
      ).toString()
        ? null
        : {totalNotEqualToCumulated: 'La somme des totaux n\'est pas égale au total de la vente !'};
  }

  /**
   * Retourne le total de la vente avant application de la remise globale de la vente
   */
  public static getSaleTotalBeforeDiscount(sale: Sale): number {
    return sale.articles.reduce((total, saleArticle) => total + SaleArticleTools.getSaleArticleTotal(saleArticle), 0);
  }

  /**
   * Retourne le total de la vente avant application de la TVA
   */
  public static getSaleTotalBeforeTaxe(sale: Sale, settings: Settings): number {
    const total = Math.round(Math.round(sale.total * 100) - Math.round(sale.total * settings.taxeRate)).toString();
    return Number(total.substring(0, total.length - 2) + '.' + total.substring(total.length - 2, total.length));
  }
}
