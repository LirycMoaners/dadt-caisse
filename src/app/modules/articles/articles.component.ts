import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy, ComponentFactoryResolver, ViewContainerRef, ComponentRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { Article } from '../../shared/models/article.model';
import { ArticleService } from '../../core/http-services/article.service';
import { ArticleDialogComponent } from './article-dialog/article-dialog.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ArticleCategoryService } from 'src/app/core/http-services/article-category.service';
import { ArticleCategory } from 'src/app/shared/models/article-category.model';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  public dataSource: MatTableDataSource<Article> = new MatTableDataSource();
  public displayedColumns: string[] = ['reference', 'label', 'category', 'buyPrice', 'sellPrice', 'quantity', 'actions'];
  public articleCategories: ArticleCategory[] = [];
  private readonly subscriptions: Subscription[] = [];
  private inventoryComponentRef: ComponentRef<InventoryComponent>;

  constructor(
    private readonly dialog: MatDialog,
    private readonly cfr: ComponentFactoryResolver,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly articleService: ArticleService,
    private readonly articleCategoryService: ArticleCategoryService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.articleService.getAll().subscribe(articles => this.dataSource = new MatTableDataSource(articles)),
      this.articleCategoryService.getAll().subscribe(articleCategories => this.articleCategories = articleCategories)
    );
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    if (this.inventoryComponentRef) {
      this.inventoryComponentRef.destroy();
    }
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.dataSource.data = this.dataSource.sortData(this.dataSource.data, this.sort));
  }

  /**
   * Applique le filtre saisie par l'utilisateur
   * @param event Evénement déclenché à chaque saisie clavier
   */
  public applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Ouverture de la modale d'ajout et appel au service pour l'ajout
   */
  public addArticle(): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent);

    dialogRef.afterClosed().pipe(
      flatMap((article: Article) => article ? this.articleService.create(article) : of(null))
    ).subscribe();
  }

  /**
   * Ouverture de la modale pour modifier l'article et appel au service pour la modification
   * @param article L'article devant être modifié
   */
  public editArticle(article: Article): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent, {data: article});

    dialogRef.afterClosed().pipe(
      flatMap((newArticle: Article) => this.articleService.update(newArticle))
    ).subscribe();
  }

  /**
   * Appel au service de suppression
   * @param article L'article devant être supprimé
   */
  public deleteArticle(article: Article): void {
    if (confirm('Souhaitez-vous réellement supprimer l\'article ' + article.reference + ' - ' + article.label + ' ?')) {
      this.articleService.delete(article.id).subscribe();
    }
  }

  /**
   * Génère le composant d'inventaire en lui passant ses inputs avant de lancer une impression
   * @param articleCategory La catégorie d'article pour laquelle on souhaite un inventaire
   */
  public printInventory(articleCategory?: ArticleCategory): void {
    if (!this.inventoryComponentRef) {
      const componentFactory = this.cfr.resolveComponentFactory(InventoryComponent);
      this.inventoryComponentRef = this.viewContainerRef.createComponent(componentFactory);
    }

    this.inventoryComponentRef.instance.articleCategoryLabel = articleCategory ? articleCategory.label : null;
    this.inventoryComponentRef.instance.articles = (
      articleCategory
      ? this.dataSource.data.filter(article => article.categoryId === articleCategory.id)
      : this.dataSource.data
    ).sort((articleA, articleB) => articleA.reference.localeCompare(articleB.reference));

    setTimeout(() => print(), 0);
  }

}
