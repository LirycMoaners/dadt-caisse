import { Component, Input, OnInit } from '@angular/core';
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
export class BillComponent implements OnInit {
  @Input() sale: Sale;
  @Input() settings: Settings;
  public today = new Date();

  constructor() { }

  ngOnInit(): void { }

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

}
