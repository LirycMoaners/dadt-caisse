import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SaleService } from 'src/app/core/http-services/sale.service';
import { BillComponent } from 'src/app/shared/components/bill/bill.component';
import { TicketComponent } from 'src/app/shared/components/ticket/ticket.component';
import { SaleArticle } from 'src/app/shared/models/sale-article.model';
import { Sale } from 'src/app/shared/models/sale.model';
import { NumberTools } from 'src/app/shared/tools/number.tools';
import { PrintTools } from 'src/app/shared/tools/print.tools';
import { SaleArticleTools } from 'src/app/shared/tools/sale-article.tools';
import { SaleTools } from 'src/app/shared/tools/sale.tools';

@Component({
  selector: 'app-sale-details',
  templateUrl: './sale-details.component.html',
  styleUrls: ['./sale-details.component.scss']
})
export class SaleDetailsComponent implements OnInit, OnChanges {
  @Input() sale: Sale;
  public dataSource: MatTableDataSource<SaleArticle> = new MatTableDataSource();
  public displayedColumns: string[] = ['reference', 'label', 'category', 'price', 'quantity', 'totalBeforeDiscount', 'discount', 'total'];
  public saleDataSource: MatTableDataSource<Sale> = new MatTableDataSource();
  public saleDisplayedColumns: string[] = ['cash', 'card', 'check', 'credit'];
  public saleForm: FormGroup;
  public errorMessage: string;
  private componentRef: ComponentRef<TicketComponent | BillComponent>;

  constructor(
    private readonly cfr: ComponentFactoryResolver,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly fb: FormBuilder,
    private readonly saleService: SaleService
  ) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.sale && this.sale) {
      this.dataSource = new MatTableDataSource(this.sale.articles);
      this.saleDataSource = new MatTableDataSource([this.sale]);

      this.saleForm = this.fb.group({
        cashTotal: [this.sale.cashTotal, [Validators.required]],
        cardTotal: [this.sale.cardTotal, [Validators.required]],
        checkTotal: [this.sale.checkTotal, [Validators.required]],
        creditTotal: [this.sale.creditTotal, [Validators.required]]
      }, { validators: [SaleTools.totalEqualToCumulatedValidator(this.sale)] });
    }
  }

  /**
   * Lance l'impression d'un duplicata de ticket ou d'une facture selon le paramètre
   * @param type Le type de document à imprimer
   */
  public print(type: string): void {
    this.componentRef = PrintTools.createComponent(
      this.cfr,
      this.viewContainerRef,
      type === 'ticket' ? TicketComponent : BillComponent,
      this.componentRef
    ) as ComponentRef<TicketComponent | BillComponent>;

    this.componentRef.instance.sale = this.sale;
    if (type === 'ticket') {
      (this.componentRef.instance as TicketComponent).isDuplicata = true;
    }

    setTimeout(() => print(), 0);
  }

  /**
   * Retourne le total d'une ligne d'article
   */
  public getSaleArticleTotal(saleArticle: SaleArticle): number {
    return SaleArticleTools.getSaleArticleTotal(saleArticle);
  }

  /**
   * Retourne le total de la vente avant application de la remise globale de la vente
   */
  public getTotalBeforeSaleDiscount(): number {
    return this.sale.articles.reduce((total, saleArticle) => total + this.getSaleArticleTotal(saleArticle), 0);
  }

  /**
   * Fait appel à la méthode outil de conversion d'une chaine en nombre
   * @param value La valeur à convertir
   */
  public toNumber(value: string): number {
    return NumberTools.toNumber(value);
  }

  /**
   * Met à jour la vente si les données sont valides ou affiche une erreur
   */
  public save() {
    if (this.saleForm.valid) {
      this.errorMessage = '';
      this.saleService.update(this.sale).subscribe(() => this.saleForm.markAsUntouched());
    } else {
      this.errorMessage = this.saleForm.errors.totalNotEqualToCumulated;
    }
  }

}
