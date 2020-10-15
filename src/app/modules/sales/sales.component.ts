import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { SaleService } from 'src/app/core/http-services/sale.service';
import { Sale } from 'src/app/shared/models/sale.model';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  public sales: Sale[];
  public currentSale: Sale;
  public filterDate: Date;

  constructor(
    private readonly saleService: SaleService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.saleService.getAll().subscribe(sales => {
        this.sales = sales;
        if (!this.filterDate) {
          setTimeout(() => this.filterDate = new Date(), 0);
        }
      })
    );
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  /**
   * Passe la vente au composant de détail pour l'afficher
   * @param sale La vente à afficher
   */
  public showSaleDetails(sale: Sale) {
    this.currentSale = sale;
  }
}