import { Component, Input, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/core/http-services/settings.service';
import { SaleArticle } from '../../models/sale-article.model';
import { Sale } from '../../models/sale.model';
import { Settings } from '../../models/settings.model';
import { SaleArticleTools } from '../../tools/sale-article.tools';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit {
  @Input() sale: Sale;
  public settings: Settings;
  public today = new Date();

  constructor(
    private readonly settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(settings => this.settings = settings);
  }

  public getSaleArticleTotal(saleArticle: SaleArticle): number {
    return SaleArticleTools.getSaleArticleTotal(saleArticle);
  }

}
