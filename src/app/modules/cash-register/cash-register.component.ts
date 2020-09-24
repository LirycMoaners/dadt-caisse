import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, Observable, of } from 'rxjs';
import { startWith, map, flatMap } from 'rxjs/operators';

import { Article } from '../../shared/models/article.model';
import { ArticleService } from '../../core/http-services/article.service';
import { Sale } from 'src/app/shared/models/sale.model';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { SaleService } from 'src/app/core/http-services/sale.service';


@Component({
  selector: 'app-cash-register',
  templateUrl: './cash-register.component.html',
  styleUrls: ['./cash-register.component.scss']
})
export class CashRegisterComponent implements OnInit, OnDestroy {
  public dataSource: MatTableDataSource<Article> = new MatTableDataSource();
  public displayedColumns: string[] = ['reference', 'label', 'category', 'sellPrice', 'quantity', 'total', 'actions'];
  public articleControl = new FormControl();
  public articles: Article[] = [];
  public filteredArticles: Observable<Article[]>;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly articleService: ArticleService,
    private readonly saleService: SaleService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.articleService.getAll().subscribe(articles => this.articles = articles)
    );

    this.filteredArticles = this.articleControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
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
    this.dataSource.data.push({...article, quantity: 1});
    this.dataSource._updateChangeSubscription();
    this.articleControl.reset();
  }

  /**
   * Appel au service de suppression
   * @param article L'article devant être supprimé
   */
  public deleteArticle(article: Article): void {
    this.dataSource.data.splice(this.dataSource.data.indexOf(article), 1);
    this.dataSource._updateChangeSubscription();
  }

  /**
   * Retourne le total de la vente
   */
  public getTotal(): number {
    return this.dataSource.data.reduce((total, article) => total + (article.sellPrice * article.quantity), 0);
  }

  /**
   * Construit l'objet de vente avant d'ouvrir la modale de paiement
   */
  public pay(): void {
    const sale: Sale = new Sale();
    sale.articles = this.dataSource.data.map(article => ({id: article.id, sellPrice: article.sellPrice, quantity: article.quantity}));
    sale.total = this.getTotal();

    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: sale
    });

    dialogRef.afterClosed().pipe(
      flatMap(result => result ? this.saleService.create(result) : of(null))
    ).subscribe((result) => {
      if (result) {
        this.dataSource = new MatTableDataSource();
        this.articleControl.reset();
      }
    });
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

}
