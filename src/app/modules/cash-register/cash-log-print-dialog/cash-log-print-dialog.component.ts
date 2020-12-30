import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AddWorksheetOptions, Workbook, Worksheet } from 'exceljs';
import { combineLatest } from 'rxjs';
import { first } from 'rxjs/operators';
import { ArticleCategoryService } from 'src/app/core/http-services/article-category.service';
import { CashOutCategoryService } from 'src/app/core/http-services/cash-out-category.service';
import { CashOutService } from 'src/app/core/http-services/cash-out.service';
import { SaleService } from 'src/app/core/http-services/sale.service';
import { ArticleCategory } from 'src/app/shared/models/article-category.model';
import { CashOutCategory } from 'src/app/shared/models/cash-out-category.model';
import { CashOut } from 'src/app/shared/models/cash-out.model';
import { Sale } from 'src/app/shared/models/sale.model';
import { MathTools } from 'src/app/shared/tools/math.tools';
import { SaleArticleTools } from 'src/app/shared/tools/sale-article.tools';
import { SaleTools } from 'src/app/shared/tools/sale.tools';
import { XlsxTools } from 'src/app/shared/tools/xlsx.tools';


@Component({
  selector: 'app-cash-log-print-dialog',
  templateUrl: './cash-log-print-dialog.component.html',
  styleUrls: ['./cash-log-print-dialog.component.scss']
})
export class CashLogPrintDialogComponent {
  public periodForm: FormGroup;
  public datePipe: DatePipe = new DatePipe('fr-FR');

  constructor(
    public dialogRef: MatDialogRef<CashLogPrintDialogComponent>,
    private readonly fb: FormBuilder,
    private readonly saleService: SaleService,
    private readonly cashOutService: CashOutService,
    private readonly articleCategoryService: ArticleCategoryService,
    private readonly cashOutCategoryService: CashOutCategoryService
  ) {
    this.periodForm = this.fb.group({
      from: new FormControl({value: '', disabled: true}, Validators.required),
      to: new FormControl({value: '', disabled: true}, Validators.required),
      balance: new FormControl('', Validators.required)
    });
  }

  /**
   * Exporter le journal de caisse au format xlsx
   */
  public export(): void {
    if (
      this.periodForm.get('balance')
      && this.periodForm.get('from')?.value
      && this.periodForm.get('to')?.value
      && this.periodForm.get('from')?.value < this.periodForm.get('to')?.value
    ) {
      combineLatest([
        this.saleService.getAll().pipe(first()),
        this.cashOutService.getAll().pipe(first()),
        this.articleCategoryService.getAll().pipe(first()),
        this.cashOutCategoryService.getAll().pipe(first())
      ]).subscribe(([sales, cashOuts, articleCategories, cashOutCategories]: [Sale[], CashOut[], ArticleCategory[], CashOutCategory[]]) => {
        const dataByMonth = this.getDataByMonth(
          this.periodForm.get('balance')?.value,
          sales,
          cashOuts,
          articleCategories,
          cashOutCategories
        );
        const workbook = this.createWorkbook(dataByMonth, articleCategories, cashOutCategories);
        XlsxTools.saveFile(workbook, 'Journal ' + dataByMonth[0].label + ' - ' + dataByMonth[dataByMonth.length - 1].label);
      });

      this.dialogRef.close(this.periodForm.value);
    }
  }

  /**
   * Appel la méthode des outils permettant la conversion d'une chaine en nombre
   * @param value La chaine à convertir
   */
  public toNumber(value: string): number {
    return Number(value.replace(',', '.'));
  }

  /**
   * Construit l'ensemble des données à inscrire dans le fichier à exporter
   * @param balance La solde saisi par l'utilisateur
   * @param sales Les ventes
   * @param cashOuts Les retraits caisse
   * @param articleCategories Les catégories d'article
   * @param cashOutCategories Les catégories de retrait caisse
   */
  private getDataByMonth(
    balance: number,
    sales: Sale[],
    cashOuts: CashOut[],
    articleCategories: ArticleCategory[],
    cashOutCategories: CashOutCategory[]
  ): any[] {
    const dataByMonth: any[] = [];
    let lastDate: Date | undefined;
    let lastBalance = balance;
    for (
      const date: Date = this.periodForm.get('from')?.value;
      date.valueOf() <= this.periodForm.get('to')?.value.valueOf();
      date.setDate(date.getDate() + 1)
    ) {
      if (dataByMonth.length === 0 || date.getMonth() !== lastDate?.getMonth()) {
        dataByMonth.push({label: this.datePipe.transform(date, 'MMMM yyyy'), dataByDay: []});
      }
      const data = this.getDataOnDate(
        lastBalance,
        date,
        dataByMonth[dataByMonth.length - 1].dataByDay.length,
        sales,
        cashOuts,
        articleCategories,
        cashOutCategories
      );
      lastBalance = data.solde.result;
      dataByMonth[dataByMonth.length - 1].dataByDay.push(data);
      lastDate = new Date(date);
    }
    return dataByMonth;
  }

  /**
   * Construit les données pour la date passée en paramètres
   * @param balance La solde saisi par l'utilisateur
   * @param date La date pour laquel on construit le jeu de données
   * @param sales Les ventes
   * @param cashOuts Les retraits caisse
   * @param articleCategories Les catégories d'article
   * @param cashOutCategories Les catégories de retrait caisse
   */
  private getDataOnDate(
    balance: number,
    date: Date,
    index: number,
    sales: Sale[],
    cashOuts: CashOut[],
    articleCategories: ArticleCategory[],
    cashOutCategories: CashOutCategory[]
  ): any {
    const {cardTotal, checkTotal, cashTotal, creditTotal, ...articleCategoryTotals} = this.getSaleTotals(
      sales,
      date,
      articleCategories
    );
    const cashOutTotals = this.getCashOutCategoryTotals(cashOuts, date, cashOutCategories);
    return {
      date: new Date(date),
      ...articleCategoryTotals,
      total: this.getTotal(sales, date, articleCategories, index),
      cartes: cardTotal || null,
      chèques: checkTotal || null,
      espèces: cashTotal || null,
      avoir: creditTotal || null,
      ...cashOutTotals,
      solde: this.getBalance(balance, cashTotal, index, cashOutTotals, articleCategories, cashOutCategories)
    };
  }

  /**
   * Retourne un objet contenant les différents totaux des ventes pour une date donnée
   * @param sales Les ventes
   * @param date La date concerné par les totaux
   * @param articleCategories Les catégories d'article
   */
  private getSaleTotals(sales: Sale[], date: Date, articleCategories: ArticleCategory[]): any {
    return sales
      .filter(sale => this.datePipe.transform(sale.createDate, 'dd/MM/yyyy') === this.datePipe.transform(date, 'dd/MM/yyyy'))
      .reduce((dataLine, sale) => {
        dataLine.cardTotal = MathTools.sum(dataLine.cardTotal as number, sale.cardTotal);
        dataLine.cashTotal = MathTools.sum(dataLine.cashTotal as number, sale.cashTotal);
        dataLine.checkTotal = MathTools.sum(dataLine.checkTotal as number, sale.checkTotal);
        dataLine.creditTotal = MathTools.sum(dataLine.creditTotal as number, sale.creditTotal);

        const saleLine: any = {};

        for (const articleCategory of articleCategories) {
          const total = sale.articles
            .filter(article => article.categoryId === articleCategory.id)
            .reduce((t, article) => MathTools.sum(t, SaleArticleTools.getSaleArticleTotal(article)), 0);

          saleLine[articleCategory.label] = total;
        }

        let totalToCompare = 0;
        for (const articleCategoryTotal in saleLine) {
          if (saleLine[articleCategoryTotal]) {
            if (sale.discount) {
              let stringTotal: string;
              if (sale.discountType === '%') {
                stringTotal = Math.round(saleLine[articleCategoryTotal] * Math.round(100 - sale.discount)).toString();
              } else {
                stringTotal = Math.round(
                  Math.round(saleLine[articleCategoryTotal] * 100)
                  - Math.round(
                    Math.round((saleLine[articleCategoryTotal] / SaleTools.getSaleTotalBeforeDiscount(sale)) * 100)
                    * sale.discount
                  )
                ).toString();
              }
              saleLine[articleCategoryTotal] = Number(
                stringTotal.substring(0, stringTotal.length - 2) + '.' + stringTotal.substring(stringTotal.length - 2, stringTotal.length)
              );
            }
            totalToCompare = MathTools.sum(totalToCompare, saleLine[articleCategoryTotal]);
          }
        }

        if (totalToCompare !== sale.total) {
          const saleLineKey = Object.keys(saleLine).find(key => !!saleLine[key]) as string;
          saleLine[saleLineKey] = MathTools.sum(saleLine[saleLineKey], MathTools.sum(sale.total, -totalToCompare));
        }

        for (const articleCategoryTotal in saleLine) {
          if (dataLine[articleCategoryTotal]) {
            dataLine[articleCategoryTotal] = MathTools.sum(dataLine[articleCategoryTotal] as number, saleLine[articleCategoryTotal]);
          } else {
            dataLine[articleCategoryTotal] = saleLine[articleCategoryTotal];
          }
        }

        return dataLine;
      },
        articleCategories.reduce((initObject, articleCategory) => {
          initObject[articleCategory.label] = null;
          return initObject;
        }, {cardTotal: 0, cashTotal: 0, checkTotal: 0, creditTotal: 0} as { [index: string]: number | null })
      );
  }

  /**
   * Retourne le total d'une journée donnée, sous forme de formule
   * @param sales Les ventes
   * @param date La date concernée par le total
   * @param articleCategories Les catégories d'article
   */
  private getTotal(sales: Sale[], date: Date, articleCategories: ArticleCategory[], index: number): any {
    return {
      formula: articleCategories.reduce(
        (formula, _, i) => formula + '+' + String.fromCharCode(66 + i) + (6 + index),
        ''
      ),
      result: sales
        .filter(sale => this.datePipe.transform(sale.createDate, 'dd/MM/yyyy') === this.datePipe.transform(date, 'dd/MM/yyyy'))
        .reduce((t, sale) => MathTools.sum(t, sale.total), 0),
      sharedFormula: '',
      date1904: false
    };
  }

  /**
   * Retourne un objet contenant les différents totaux des retraits caisse pour une date donnée
   * @param cashOuts Les retraits caisse
   * @param date La date concernée par les totaux
   * @param cashOutCategories Les catégories de retrait caisse
   */
  private getCashOutCategoryTotals(cashOuts: CashOut[], date: Date, cashOutCategories: CashOutCategory[]): any {
    return cashOuts
      .filter(cashOut => this.datePipe.transform(cashOut.createDate, 'dd/MM/yyyy') === this.datePipe.transform(date, 'dd/MM/yyyy'))
      .reduce(
        (dataLine, cashOut) => {
          if (dataLine[cashOut.cashOutCategory.label]) {
            dataLine[cashOut.cashOutCategory.label] = MathTools.sum(dataLine[cashOut.cashOutCategory.label] as number, cashOut.total);
          } else {
            dataLine[cashOut.cashOutCategory.label] = cashOut.total;
          }
          dataLine.libellé += !dataLine.libellé ? cashOut.label : ' + ' + cashOut.label;
          return dataLine;
        },
        cashOutCategories.reduce((initObject, cashOutCategory) => {
          initObject[cashOutCategory.label] = null;
          return initObject;
        }, {libellé: ''} as { [index: string]: string | number | null })
      );
  }

  /**
   * Retourne le solde d'une journée donnée, sous forme de formule
   * @param balance Le solde avant calcul
   * @param cashTotal Le total pour les espèces
   * @param date La date concerné par le solde
   * @param articleCategories Les catégories d'article
   * @param cashOutCategories Les catégories de retrait caisse
   */
  private getBalance(
    balance: number,
    cashTotal: number,
    index: number,
    cashOutTotals: any,
    articleCategories: ArticleCategory[],
    cashOutCategories: CashOutCategory[]
  ): any {
    return {
      formula: String.fromCharCode(72 + articleCategories.length + cashOutCategories.length)
        + ((index === 0 ? 4 : 5) + index)
        + '+'
        + String.fromCharCode(69 + articleCategories.length)
        + (6 + index)
        + cashOutCategories.reduce(
          (formula, _, i) => formula + '-' + String.fromCharCode(72 + articleCategories.length + i) + (6 + index),
          ''
        ),
      result: Object.keys(cashOutTotals).reduce(
        (b, cashOutTotalLabel) => MathTools.sum(b, -cashOutTotals[cashOutTotalLabel]),
        MathTools.sum(balance, cashTotal)
      ),
      sharedFormula: '',
      date1904: false
    };
  }

  /**
   * Retourne le workbook devant être exporter en xlsx
   * @param dataByMonth L'ensemble des données à inscrire dans le fichier à exporter
   * @param articleCategories Les catégories d'article
   * @param cashOutCategories Les catégories de retrait caisse
   */
  private createWorkbook(
    dataByMonth: {label: string, dataByDay: any[]}[],
    articleCategories: ArticleCategory[],
    cashOutCategories: CashOutCategory[]
  ): Workbook {
    const workbook = new Workbook();
    for (const [index, data] of dataByMonth.entries()) {
      const worksheet = this.getWorksheetWithHeader(workbook, dataByMonth, index, articleCategories);
      for (const [j, dataLine] of data.dataByDay.entries()) {
        const values: any[] = Object.values(dataLine);
        values[0] = this.datePipe.transform(dataLine.date, 'dd/MM');
        worksheet.getRow(6 + j).values = [...values];
      }
      this.addTotalRowToWorksheet(worksheet, data, articleCategories, cashOutCategories);
      this.addBordersToWorksheet(worksheet, data);
    }
    return workbook;
  }

  /**
   * Retourne une worksheet contenant les données sur un mois
   * @param workbook Le workbook dans lequel doit être ajouté la worksheet
   * @param dataByMonth L'ensemble des données à inscrire dans le fichier à exporter
   * @param index L'index parcouru sur dataByMonth
   * @param articleCategories Les catégories d'article
   */
  private getWorksheetWithHeader(
    workbook: Workbook,
    dataByMonth: {label: string, dataByDay: any[]}[],
    index: number,
    articleCategories: ArticleCategory[]
  ): Worksheet {
    const data = dataByMonth[index];
    const worksheetOptions: Partial<AddWorksheetOptions> = {
      pageSetup: {paperSize: 9, orientation: 'landscape', fitToPage: true}
    };
    const worksheet = workbook.addWorksheet(data.label, worksheetOptions);

    worksheet.getCell('A1').value = 'CAISSE ' + data.label.toUpperCase();
    worksheet.getCell('A1').font = {bold: true, underline: true};

    const headerLabels = Object.keys(dataByMonth[0].dataByDay[0]).map(key => key.toUpperCase());
    headerLabels.forEach(
      (headerLabel, i) => headerLabel.length > 8 ? worksheet.getColumn(String.fromCharCode(65 + i)).width = 14 : null
    );
    worksheet.getRow(3).values = headerLabels;
    worksheet.getRow(3).alignment = {horizontal: 'center'};

    const lastMonthDay = new Date(data.dataByDay[0].date);
    lastMonthDay.setDate(lastMonthDay.getDate() - 1);
    worksheet.getCell(String.fromCharCode(71 + articleCategories.length) + 4).value =
      'Solde au ' + this.datePipe.transform(lastMonthDay, 'dd/MM/yyyy');
    worksheet.getCell(String.fromCharCode(71 + articleCategories.length) + 4).alignment = {horizontal: 'center'};
    worksheet.getColumn(String.fromCharCode(71 + articleCategories.length)).width = 22;
    worksheet.getCell(String.fromCharCode(64 + headerLabels.length) + 4).value = index > 0
      ? {
        formula:
          '\'' + workbook.worksheets[index - 1].name + '\''
          + '!'
          + String.fromCharCode(64 + headerLabels.length)
          + (5 + lastMonthDay.getDate()),
        result: dataByMonth[index - 1].dataByDay[dataByMonth[index - 1].dataByDay.length - 1].solde.result,
        sharedFormula: '',
        date1904: false
      }
      : this.periodForm.get('balance')?.value;
    return worksheet;
  }

  /**
   * Ajoute une ligne de total en bas de la worksheet en paramètre
   * @param worksheet La worksheet sur laquelle ajouter la ligne de total
   * @param data Les données sur un mois
   * @param articleCategories Les catégories d'article
   * @param cashOutCategories Les catégories de retrait caisse
   */
  private addTotalRowToWorksheet(
    worksheet: Worksheet,
    data: {label: string, dataByDay: any[]},
    articleCategories: ArticleCategory[],
    cashOutCategories: CashOutCategory[]
  ): void {
    for (const [i, articleCategory] of articleCategories.entries()) {
      worksheet.getCell(String.fromCharCode(66 + i) + (data.dataByDay.length + 6)).value = {
        formula:
          'SUM('
          + String.fromCharCode(66 + i)
          + 6
          + ':'
          + String.fromCharCode(66 + i)
          + (data.dataByDay.length + 5)
          + ')',
        result: data.dataByDay
          .reduce((total, dataLine) => MathTools.sum(total, dataLine[articleCategory.label]), 0),
        sharedFormula: '',
        date1904: false
      };
    }
    worksheet.getCell(String.fromCharCode(66 + articleCategories.length) + (data.dataByDay.length + 6)).value = {
      formula:
        'SUM('
        + String.fromCharCode(66 + articleCategories.length)
        + 6
        + ':'
        + String.fromCharCode(66 + articleCategories.length)
        + (data.dataByDay.length + 5)
        + ')',
      result: data.dataByDay
        .reduce((total, dataLine) => MathTools.sum(total, dataLine.total.result), 0),
      sharedFormula: '',
      date1904: false
    };
    for (const i of [0, 1, 2, 3]) {
      worksheet.getCell(String.fromCharCode(67 + articleCategories.length + i) + (data.dataByDay.length + 6)).value = {
        formula:
          'SUM('
          + String.fromCharCode(67 + articleCategories.length + i)
          + 6
          + ':'
          + String.fromCharCode(67 + articleCategories.length + i)
          + (data.dataByDay.length + 5)
          + ')',
        result: data.dataByDay
          .reduce((total, dataLine) => MathTools.sum(total, dataLine[['cartes', 'chèques', 'espèces', 'avoir'][i]]), 0),
        sharedFormula: '',
        date1904: false
      };
    }
    for (const [i, cashOutCategory] of cashOutCategories.entries()) {
      worksheet.getCell(String.fromCharCode(72 + articleCategories.length + i) + (data.dataByDay.length + 6)).value = {
        formula:
          'SUM('
          + String.fromCharCode(72 + articleCategories.length + i)
          + 6
          + ':'
          + String.fromCharCode(72 + articleCategories.length + i)
          + (data.dataByDay.length + 5)
          + ')',
        result: data.dataByDay
          .reduce((total, dataLine) => MathTools.sum(total, dataLine[cashOutCategory.label]), 0),
        sharedFormula: '',
        date1904: false
      };
    }
  }

  /**
   * Ajoute des bordures sur les cellules le nécessitant sur la worksheet en paramètre
   * @param worksheet La workshet sur laquelle ajouter les bordures
   * @param data Les données sur un mois
   */
  private addBordersToWorksheet(worksheet: Worksheet, data: {label: string, dataByDay: any[]}): void {
    for (let i = 3; i <= 6 + data.dataByDay.length; i++) {
      for (let j = 0; j < Object.keys(data.dataByDay[0]).length; j++) {
        worksheet.getCell(String.fromCharCode(65 + j) + i).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
        worksheet.getCell(String.fromCharCode(65 + j) + i).numFmt = '0.00';
      }
    }
  }
}
