import { ValidatorFn } from '@angular/forms';
import { Sale } from '../models/sale.model';

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
}
