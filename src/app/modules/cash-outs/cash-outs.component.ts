import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CashOutService } from 'src/app/core/http-services/cash-out.service';
import { CashOut } from 'src/app/shared/models/cash-out.model';

@Component({
  selector: 'app-cash-outs',
  templateUrl: './cash-outs.component.html',
  styleUrls: ['./cash-outs.component.scss']
})
export class CashOutsComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  public cashOuts: CashOut[] = [];
  public currentCashOut: CashOut | null = null;
  public filterDate?: Date;

  constructor(
    private readonly cashOutService: CashOutService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.cashOutService.getAll().subscribe(cashOuts => {
        this.cashOuts = [...cashOuts];
        if (!this.filterDate) {
          setTimeout(() => this.filterDate = new Date(), 0);
        }
        if (!!this.currentCashOut) {
          const cashOutToExpand = this.cashOuts.find(cashOut => cashOut.id === this.currentCashOut?.id);
          if (
            cashOutToExpand
            && cashOutToExpand.createDate.toString().substring(0, 9) !== this.currentCashOut.createDate.toString().substring(0, 9)
          ) {
            this.filterDate = cashOutToExpand.createDate as Date;
          }
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
   * Passe le retrait caisse au composant de détail pour l'afficher
   * @param cashOut Le retrait caisse à afficher
   */
  public showCashOutDetails(cashOut: CashOut): void {
    setTimeout(() => this.currentCashOut = cashOut ? {...cashOut} : null, 0);
  }

  /**
   * Passe un nouveau retrait caisse au composant de détail pour l'éditer
   */
  public addCashOut(): void {
    this.currentCashOut = new CashOut();
  }
}
