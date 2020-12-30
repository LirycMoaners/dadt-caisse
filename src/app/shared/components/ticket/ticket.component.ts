import { Component, Input } from '@angular/core';
import { SaleArticle } from '../../models/sale-article.model';
import { Sale } from '../../models/sale.model';
import { Settings } from '../../models/settings.model';
import { MathTools } from '../../tools/math.tools';
import { SaleArticleTools } from '../../tools/sale-article.tools';
import { SaleTools } from '../../tools/sale.tools';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent {
  @Input() sale: Sale = new Sale();
  @Input() settings: Settings = new Settings();
  @Input() isDuplicata = false;

  constructor() { }

  /**
   * Retourne le total d'une ligne d'article
   */
  public getSaleArticleTotal(saleArticle: SaleArticle): number {
    return SaleArticleTools.getSaleArticleTotal(saleArticle);
  }

  /**
   * Retourne le total de la vente
   */
  public getSaleArticlesTotal(): number {
    return SaleArticleTools.getSaleArticlesTotal(this.sale.articles);
  }

  /**
   * Retourne le total de la vente avant les remises
   */
  public getSaleArticlesTotalBeforeDiscount(): number {
    return SaleArticleTools.getSaleArticlesTotalBeforeDiscount(this.sale.articles);
  }

  /**
   * Retourne le total des remises appliquées à la vente
   */
  public getTotalDiscounts(): number {
    return MathTools.sum(this.sale.total, -this.getSaleArticlesTotalBeforeDiscount());
  }

  /**
   * Retourne le total de la vente avant application de la TVA
   */
  public getSaleTotalBeforeTaxe(): number {
    return SaleTools.getSaleTotalBeforeTaxe(this.sale, this.settings);
  }

  /**
   * Retourne le montant de TVA de la vente
   */
  public getTaxe(): number {
    return MathTools.sum(this.sale.total, -this.getSaleTotalBeforeTaxe());
  }

  /**
   * Retourne le nombre de points cumulés sur la vente
   */
  public getLoyaltyPoints(): number {
    const totalString = this.sale.total.toString();
    if (totalString.includes('.')) {
      return Number(totalString.substring(0, totalString.length - 2));
    }
    return this.sale.total;
  }

  /**
   * Retourne le nombre de points total d'un client juste après la vente
   */
  public getTotalLoyaltyPoints(): number {
    const sum = MathTools.sum(this.getLoyaltyPoints(), this.sale.customer?.loyaltyPoints as number);
    return sum >= (this.settings.pointsForDiscount as number) ? MathTools.sum(sum, -(this.settings.pointsForDiscount as number)) : sum;
  }

}
