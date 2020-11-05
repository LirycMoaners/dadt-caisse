import { Component, OnInit, OnDestroy, ComponentFactoryResolver, ComponentRef, ViewContainerRef, NgZone } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription, Observable, of, combineLatest } from 'rxjs';
import { startWith, map, mergeMap, first } from 'rxjs/operators';

import { Article } from '../../shared/models/article.model';
import { ArticleService } from '../../core/http-services/article.service';
import { Sale } from 'src/app/shared/models/sale.model';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { SaleService } from 'src/app/core/http-services/sale.service';
import { TicketComponent } from 'src/app/shared/components/ticket/ticket.component';
import { BillComponent } from 'src/app/shared/components/bill/bill.component';
import { SaleArticle } from 'src/app/shared/models/sale-article.model';
import { CustomerService } from 'src/app/core/http-services/customer.service';
import { FidelityDialogComponent } from './fidelity-dialog/fidelity-dialog.component';
import { CashLogPrintDialogComponent } from './cash-log-print-dialog/cash-log-print-dialog.component';
import { SaleArticleTools } from 'src/app/shared/tools/sale-article.tools';
import { NumberTools } from 'src/app/shared/tools/number.tools';
import { PrintTools } from 'src/app/shared/tools/print.tools';
import { SettingsService } from 'src/app/core/http-services/settings.service';
import { Settings } from 'src/app/shared/models/settings.model';


@Component({
  selector: 'app-cash-register',
  templateUrl: './cash-register.component.html',
  styleUrls: ['./cash-register.component.scss']
})
export class CashRegisterComponent implements OnInit, OnDestroy {
  public dataSource: MatTableDataSource<SaleArticle> = new MatTableDataSource();
  public displayedColumns: string[] = ['reference', 'label', 'category', 'price', 'quantity', 'totalBeforeDiscount', 'discount', 'discountType', 'total', 'actions'];
  public articleControl = new FormControl();
  public articles: Article[] = [];
  public filteredArticles: Observable<Article[]>;
  public lastSale: Sale;
  private componentRef: ComponentRef<TicketComponent | BillComponent>;
  private settings: Settings;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly ngZone: NgZone,
    private readonly cfr: ComponentFactoryResolver,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly articleService: ArticleService,
    private readonly saleService: SaleService,
    private readonly customerService: CustomerService,
    private readonly settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.articleService.getAll().subscribe(articles =>
        this.articles = [...articles].sort((articleA, articleB) => articleA.reference.localeCompare(articleB.reference))
      ),
      this.settingsService.getSettings().subscribe(settings => this.settings = settings)
    );

    this.filteredArticles = this.articleControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.saleService.currentSaleArticles$.pipe(first()).subscribe(saleArticles => this.dataSource = new MatTableDataSource(saleArticles));
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    if (this.componentRef && this.componentRef.instance) {
      this.componentRef.destroy();
    }
    this.saleService.currentSaleArticles$.next(this.dataSource.data);
  }

  /**
   * Retourne une chaine de caractère avec la référence et le libellé de l'article
   * @param article L'article qui doit être affiché
   */
  public displayArticle(article: Article): string {
    return article ? article.reference + ' - ' + article.label : '';
  }

  /**
   * Ajoute l'article à la vente en cours
   * @param article L'article à ajouter
   */
  public addArticleToSale(article: Article): void {
    this.dataSource.data.push(new SaleArticle(article));
    this.dataSource._updateChangeSubscription();
    this.articleControl.reset();
  }

  /**
   * Appel au service de suppression
   * @param saleArticle L'article devant être supprimé
   */
  public deleteSaleArticle(saleArticle: SaleArticle): void {
    this.dataSource.data.splice(this.dataSource.data.indexOf(saleArticle), 1);
    this.dataSource._updateChangeSubscription();
  }

  /**
   * Retourne le total de la vente avant les remises
   */
  public getSaleArticlesTotalBeforeDiscount(): number {
    return SaleArticleTools.getSaleArticlesTotalBeforeDiscount(this.dataSource.data);
  }

  /**
   * Retourne le total de la vente
   */
  public getSaleArticlesTotal(): number {
    return SaleArticleTools.getSaleArticlesTotal(this.dataSource.data);
  }

  /**
   * Retourne le total d'une ligne d'article
   */
  public getSaleArticleTotal(saleArticle: SaleArticle): number {
    return SaleArticleTools.getSaleArticleTotal(saleArticle);
  }

  /**
   * Construit l'objet de vente avant d'ouvrir la modale de paiement
   */
  public pay(): void {
    let savedSale: Sale;
    const sale: Sale = new Sale();
    sale.total = this.getSaleArticlesTotal();

    const dialogRef = this.dialog.open(PaymentDialogComponent, { width: '500px', data: sale });

    dialogRef.afterClosed().pipe(
      mergeMap(result => {
        if (!!result) {
          result.articles = this.dataSource.data;
          result.createDate = new Date();
          result.updateDate = new Date();
          return this.saleService.create(result);
        }
        return of(null);
      }),
      mergeMap(s => {
        savedSale = s;
        return !!savedSale
          ? combineLatest([
            ...savedSale.articles.map(saleArticle => {
              const article = this.articles.find(a => a.id === saleArticle.id);
              article.quantity -= saleArticle.quantity;
              return this.articleService.update(article);
            }),
            savedSale.customer
              ? this.customerService.addPoints({...savedSale.customer}, savedSale.total, savedSale.isFidelityDiscount).pipe(
                mergeMap(isFidelityDiscount => {
                  if (isFidelityDiscount) {
                    let ref: MatDialogRef<FidelityDialogComponent>;
                    this.ngZone.run(() => ref = this.dialog.open(FidelityDialogComponent));
                    return ref.afterClosed();
                  }
                  return of(null);
                })
              )
              : of(null)
          ])
          : of(null);
      })
    ).subscribe(() => {
      if (savedSale) {
        this.lastSale = {...savedSale};
        this.printTicket();
        this.dataSource = new MatTableDataSource();
        this.articleControl.reset();
      }
    });
  }

  /**
   * Fait appel à la méthode d'impressiond de ticket en passant la propriété de duplicata
   */
  public ticketCopy(): void {
    this.printTicket(true);
  }

  /**
   * Imprime la facture de la vente passée
   */
  public printBill(): void {
    this.componentRef = PrintTools.createComponent(this.cfr, this.viewContainerRef, BillComponent, this.componentRef);
    (this.componentRef.instance as BillComponent).sale = this.lastSale;
    setTimeout(() => print(), 0);
  }

  /**
   * Modifie la remise d'un article et sélectionne la valeur par défaut du type de remise
   * @param saleArticle L'article pour lequel appliquer la remise
   * @param discount La remise sous forme de chaine
   */
  public changeDiscount(saleArticle: SaleArticle, discount: string): void {
    saleArticle.discount = this.toNumber(discount);
    saleArticle.discountType = discount ? saleArticle.discountType ? saleArticle.discountType : '€' : null;
  }

  /**
   * Fait appel à la méthode outils de conversion d'une chaine en nombre
   */
  public toNumber(value: string): number {
    return NumberTools.toNumber(value);
  }

  /**
   * Ouvre la modale de choix de période avant d'exporter le journal de caisse
   */
  public printCashLog(): void {
    this.dialog.open(CashLogPrintDialogComponent);
  }

  /**
   * Retourne la liste des articles après application du filtre
   * @param value Valeur saisie dans la recherche
   */
  private _filter(value: string): Article[] {
    const filterValue = (typeof value === 'string') ? value.trim().toLowerCase() : '';

    return this.articles.filter(article =>
      article.reference.toLowerCase().includes(filterValue)
      || article.label.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Génère le composant de ticket en lui passant ses inputs avant de lancer une impression
   */
  private printTicket(isDuplicata = false): void {
    this.componentRef = PrintTools.createComponent(this.cfr, this.viewContainerRef, TicketComponent, this.componentRef);
    (this.componentRef.instance as TicketComponent).isDuplicata = isDuplicata;
    (this.componentRef.instance as TicketComponent).sale = this.lastSale;
    (this.componentRef.instance as TicketComponent).settings = this.settings;
    setTimeout(() => print(), 1000);
  }

}
