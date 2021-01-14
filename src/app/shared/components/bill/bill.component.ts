import { Component, Input } from '@angular/core';
import { SaleArticle } from '../../models/sale-article.model';
import { Sale } from '../../models/sale.model';
import { Settings } from '../../models/settings.model';
import { SaleArticleTools } from '../../tools/sale-article.tools';
import { SaleTools } from '../../tools/sale.tools';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})
export class BillComponent {
  @Input() sale: Sale = new Sale();
  @Input() settings: Settings = new Settings();
  public today = new Date();

  constructor() { }

  /**
   * Retourne le total d'un article d'une vente
   * @param saleArticle L'article d'une vente dont le total est à calculer
   */
  public getSaleArticleTotal(saleArticle: SaleArticle): number {
    return SaleArticleTools.getSaleArticleTotal(saleArticle);
  }

  /**
   * Retourne le total de la vente avant application de la remise globale de la vente
   */
  public getSaleTotalBeforeDiscount(): number {
    return SaleTools.getSaleTotalBeforeDiscount(this.sale);
  }

  /**
   * Retourne le total de la vente avant application de la TVA
   */
  public getSaleTotalBeforeTaxe(): number {
    return SaleTools.getSaleTotalBeforeTaxe(this.sale, this.settings);
  }

  public getPayementMethods(): string {
    return Object.entries(this.sale).reduce((result, entry) => {
      if (entry[1]) {
        switch (entry[0]) {
          case 'cardTotal':
            result += result ? ', carte' : 'Payé par carte';
            break;
          case 'checkTotal':
            result += result ? ', chèque' : 'Payé par chèque';
            break;
          case 'cashTotal':
            result += result ? ', espèces' : 'Payé en espèces';
            break;
          case 'creditTotal':
            result += result ? ', avoir' : 'Payé par avoir';
            break;
          default:
        }
      }
      return result;
    }, '');
  }

  /**
   * Imprime le ticket
   */
  public print(): void {
    setTimeout(() => print(), 0);
  }

}
