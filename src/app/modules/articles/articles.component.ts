import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Workbook, Column } from 'exceljs';

import { Article } from '../../shared/models/article.model';
import { ArticleService } from '../../core/http-services/article.service';
import { ArticleDialogComponent } from './article-dialog/article-dialog.component';
import { ArticleCategoryService } from 'src/app/core/http-services/article-category.service';
import { ArticleCategory } from 'src/app/shared/models/article-category.model';
import { DatePipe } from '@angular/common';
import { XlsxTools } from 'src/app/shared/tools/xlsx.tools';
import { MathTools } from 'src/app/shared/tools/math.tools';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatTable, {read: ElementRef}) table?: ElementRef;
  public dataSource: MatTableDataSource<Article> = new MatTableDataSource();
  public displayedColumns: string[] = ['reference', 'label', 'category', 'buyPrice', 'sellPrice', 'quantity', 'actions'];
  public articleCategories: ArticleCategory[] = [];
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly articleService: ArticleService,
    private readonly articleCategoryService: ArticleCategoryService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.subscriptions.push(
        this.articleService.getAll().subscribe(articles => {
          this.dataSource = new MatTableDataSource(
            [...articles].sort((articleA, articleB) => articleA.reference.localeCompare(articleB.reference))
          );
          this.dataSource.paginator = this.paginator as MatPaginator;
          this.paginator?.page.subscribe(() => this.table?.nativeElement.scrollIntoView(true));
        }),
        this.articleCategoryService.getAll().subscribe(articleCategories => this.articleCategories = articleCategories)
      );
    }, 0);
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.sort?.sortChange.subscribe(() =>
      this.dataSource.data = this.dataSource.sortData(this.dataSource.data, (this.sort as MatSort))
    );
  }

  /**
   * Applique le filtre saisie par l'utilisateur
   * @param event Evénement déclenché à chaque saisie clavier
   */
  public applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Ouverture de la modale d'ajout et appel au service pour l'ajout
   */
  public addArticle(): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent);

    dialogRef.afterClosed().pipe(
      mergeMap((article: Article) => article ? this.articleService.create(article) : of(null))
    ).subscribe();
  }

  /**
   * Ouverture de la modale pour modifier l'article et appel au service pour la modification
   * @param article L'article devant être modifié
   */
  public editArticle(article: Article): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent, {data: article});

    dialogRef.afterClosed().pipe(
      mergeMap((newArticle: Article) => this.articleService.update(newArticle))
    ).subscribe();
  }

  /**
   * Appel au service de suppression
   * @param article L'article devant être supprimé
   */
  public deleteArticle(article: Article): void {
    if (confirm('Souhaitez-vous réellement supprimer l\'article ' + article.reference + ' - ' + article.label + ' ?')) {
      this.articleService.delete(article).subscribe();
    }
  }

  /**
   * Génère le composant d'inventaire en lui passant ses inputs avant de lancer une impression
   * @param articleCategory La catégorie d'article pour laquelle on souhaite un inventaire
   */
  public exportInventory(articleCategory?: ArticleCategory): void {
    const datePipe = new DatePipe('fr-FR');
    const articles = (
      articleCategory
      ? this.dataSource.data.filter(article => article.categoryId === articleCategory.id)
      : this.dataSource.data
    ).sort((articleA, articleB) => articleA.reference.localeCompare(articleB.reference));

    const workbook = new Workbook();

    const worksheet = workbook.addWorksheet('Inventaire', {
      pageSetup: {paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:1'},
      headerFooter: {
        oddHeader: 'Inventaire ' + (articleCategory ? articleCategory.label : 'Complet') + ' - ' + datePipe.transform(new Date(), 'dd/MM/yyyy'),
        oddFooter: 'Page &P sur &N'
      }
    });

    worksheet.autoFilter = {from: 'A1', to: 'F1'};

    worksheet.columns = [
      { header: 'Référence', key: 'reference', width: 22 } as Column,
      { header: 'Désignation', key: 'label', width: 22 } as Column,
      { header: 'Catégorie', key: 'articleCategory', width: 16 } as Column,
      { header: 'Prix d\'achat', key: 'buyPrice', width: 15, style: { numFmt: '0.00' } } as Column,
      { header: 'Quantité', key: 'quantity', width: 12 } as Column,
      { header: 'Total', key: 'total', width: 12, style: { numFmt: '0.00' } } as Column
    ];

    worksheet.getCell('A1').border = {
      top: {style: 'thick'},
      left: {style: 'thick'},
      bottom: {style: 'thick'},
      right: {style: 'thin'}
    };
    worksheet.getCell('B1').border = {
      top: {style: 'thick'},
      bottom: {style: 'thick'},
      right: {style: 'thin'}
    };
    worksheet.getCell('C1').border = {
      top: {style: 'thick'},
      bottom: {style: 'thick'},
      right: {style: 'thin'}
    };
    worksheet.getCell('D1').border = {
      top: {style: 'thick'},
      bottom: {style: 'thick'},
      right: {style: 'thin'}
    };
    worksheet.getCell('E1').border = {
      top: {style: 'thick'},
      bottom: {style: 'thick'},
      right: {style: 'thin'}
    };
    worksheet.getCell('F1').border = {
      top: {style: 'thick'},
      bottom: {style: 'thick'},
      right: {style: 'thick'}
    };
    worksheet.getRow(1).font = {bold: true};

    for (const [index, article] of articles.entries()) {
      worksheet.addRow({
        reference: article.reference,
        label: article.label,
        articleCategory: this.articleCategories.find(ac => ac.id === article.categoryId)?.label,
        buyPrice: article.buyPrice,
        quantity: article.quantity,
        total: {
          formula: 'D' + (index + 2) + '*E' + (index + 2),
          result: MathTools.multiply(article.buyPrice, article.quantity),
          sharedFormula: '',
          date1904: false
        }
      });
      worksheet.getCell('A' + (2 + index)).border = {
        left: {style: 'thick'},
        bottom: {style: index === articles.length - 1 ? 'thick' : 'thin'},
        right: {style: 'thin'}
      };
      worksheet.getCell('B' + (2 + index)).border = {
        bottom: {style: index === articles.length - 1 ? 'thick' : 'thin'},
        right: {style: 'thin'}
      };
      worksheet.getCell('C' + (2 + index)).border = {
        bottom: {style: index === articles.length - 1 ? 'thick' : 'thin'},
        right: {style: 'thin'}
      };
      worksheet.getCell('D' + (2 + index)).border = {
        bottom: {style: index === articles.length - 1 ? 'thick' : 'thin'},
        right: {style: 'thin'}
      };
      worksheet.getCell('E' + (2 + index)).border = {
        bottom: {style: index === articles.length - 1 ? 'thick' : 'thin'},
        right: {style: 'thin'}
      };
      worksheet.getCell('F' + (2 + index)).border = {
        bottom: {style: index === articles.length - 1 ? 'thick' : 'thin'},
        right: {style: 'thick'}
      };
    }
    worksheet.addRow({
      reference: '',
      label: '',
      articleCategory: '',
      buyPrice: '',
      quantity: {
        formula: 'SUM(E2:E' + (articles.length + 1) + ')',
        result: articles.reduce((total, article) => MathTools.sum(total, article.quantity), 0),
        sharedFormula: '',
        date1904: false
      },
      total: {
        formula: 'SUM(F2:F' + (articles.length + 1) + ')',
        result: articles.reduce((total, article) => MathTools.sum(total, MathTools.multiply(article.buyPrice, article.quantity)), 0),
        sharedFormula: '',
        date1904: false
      }
    });

    XlsxTools.saveFile(
      workbook,
      'Inventaire ' + (articleCategory ? articleCategory.label : 'Complet') + ' - ' + datePipe.transform(new Date(), 'dd/MM/yyyy') + '.xlsx'
    );
  }
}
