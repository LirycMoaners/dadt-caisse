import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Sale } from 'src/app/shared/models/sale.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { PaymentMethod } from 'src/app/shared/models/payment-method.enum';
import { Observable, Subscription } from 'rxjs';
import { CustomerService } from 'src/app/core/http-services/customer.service';
import { Customer } from 'src/app/shared/models/customer.model';
import { startWith, map, first } from 'rxjs/operators';
import { SaleTools } from 'src/app/shared/tools/sale.tools';
import { NumberTools } from 'src/app/shared/tools/number.tools';
import { Settings } from 'src/app/shared/models/settings.model';
import { SettingsService } from 'src/app/core/http-services/settings.service';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit, OnDestroy {
  public saleForm: FormGroup;
  public PaymentMethod: typeof PaymentMethod = PaymentMethod;
  public errorMessage: string;
  public filteredCustomers: Observable<Customer[]>;
  public settings: Settings;
  private customers: Customer[];
  private totalBeforeDiscount: number;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public sale: Sale,
    private readonly fb: FormBuilder,
    private readonly customerService: CustomerService,
    private readonly settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.totalBeforeDiscount = this.sale.total;

    this.subscriptions.push(
      this.customerService.getAll().pipe(first()).subscribe(customers => {
        this.customers = customers;

        const customerValidator: ValidatorFn = (control) =>
          (!control.value || control.value.id)
            ? null
            : {customerNotExist: 'Ce client n\'existe pas ! Veuillez en sélectionner un ou laisser le champ vide.'};

        this.saleForm = this.fb.group({
          customer: ['', [customerValidator]],
          discount: [0, []],
          discountType: ['', []],
          isFidelityDiscount: [false, []],
          cashTotal: [0, []],
          cardTotal: [0, []],
          checkTotal: [0, []],
          creditTotal: [0, []]
        }, { validators: [SaleTools.totalEqualToCumulatedValidator(this.sale)] });

        this.filteredCustomers = this.saleForm.get('customer').valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value))
        );
      })
    );

    this.settingsService.getSettings().pipe(first()).subscribe(settings => this.settings = settings);
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  /**
   * Retourne une chaine de caractère avec le nom et le prénom du client
   * @param customer Le client qui doit être affiché
   */
  public displayCustomer(customer: Customer): string {
    return customer ? customer.lastName + ' ' + customer.firstName : '';
  }

  /**
   * Attribu le total à la méthode de paiement sélectionnée et met les autres modes de paiement à 0
   * @param paymentMethod La méthode de paiement sélectionnée
   */
  public selectPaymentMethod(paymentMethod: PaymentMethod): void {
    const lastSaleFormValue = {
      customer: this.saleForm.get('customer').value,
      discount: this.saleForm.get('discount').value,
      discountType: this.saleForm.get('discountType').value,
      isFidelityDiscount: this.saleForm.get('isFidelityDiscount').value,
      cashTotal: 0,
      cardTotal: 0,
      checkTotal: 0,
      creditTotal: 0
    };

    switch (paymentMethod) {
      case PaymentMethod.cash:
        this.saleForm.setValue({ ...lastSaleFormValue, cashTotal: this.sale.total });
        break;
      case PaymentMethod.card:
        this.saleForm.setValue({ ...lastSaleFormValue, cardTotal: this.sale.total });
        break;
      case PaymentMethod.check:
        this.saleForm.setValue({ ...lastSaleFormValue, checkTotal: this.sale.total });
        break;
      default:
        this.saleForm.setValue({ ...lastSaleFormValue, creditTotal: this.sale.total });
    }
  }

  /**
   * Renvois la vente au composant appelant si les données sont correctes sinon affiche les erreurs
   */
  public pay(): void {
    if (this.saleForm.valid) {
      this.errorMessage = null;
      this.sale = {
        ...this.saleForm.value,
        discount: this.saleForm.controls.discount.value,
        discountType: this.saleForm.controls.discountType.value,
        total: this.getTotal(),
        cashTotal: this.sale.cashTotal || 0,
        cardTotal: this.sale.cardTotal || 0,
        checkTotal: this.sale.checkTotal || 0,
        creditTotal: this.sale.creditTotal || 0
      };
      this.dialogRef.close(this.sale);
    } else {
      this.errorMessage = '';
      if (this.saleForm.errors) {
        this.errorMessage += this.saleForm.errors.totalNotEqualToCumulated;
      }
      for (const control in this.saleForm.controls) {
        if (this.saleForm.controls[control]) {
          for (const error in this.saleForm.controls[control].errors) {
            if (this.saleForm.controls[control].errors[error]) {
              this.errorMessage += (this.errorMessage ? ' ' : '') + this.saleForm.controls[control].errors[error];
            }
          }
        }
      }
    }
  }

  /**
   * Assigne la bonne valeur de remise, assigne la valeur par défaut au type de remise et calcul le total de la vente
   * @param discount La remise sous forme de chaine
   */
  public changeDiscount(discount: string): void {
    this.saleForm.get('discount').setValue(this.toNumber(discount));
    this.saleForm.get('discountType').setValue(
      discount ? this.saleForm.get('discountType').value ? this.saleForm.get('discountType').value : '€' : null
    );
    this.sale.total = this.getTotal();
  }

  /**
   * Calcule le total de la vente après changement du type de remise
   */
  public changeDiscountType(): void {
    this.sale.total = this.getTotal();
  }

  /**
   * Retourne le total d'une ligne d'article
   */
  public getTotal(): number {
    let total: string;
    if (this.saleForm.get('discount').value) {
      if (this.saleForm.get('discountType').value === '%') {
        total = (
          Math.round(this.totalBeforeDiscount * 100)
          - Math.round(this.totalBeforeDiscount * this.saleForm.get('discount').value)
        ).toString();
      } else {
        total = (Math.round(this.totalBeforeDiscount * 100) - Math.round(this.saleForm.get('discount').value * 100)).toString();
      }
    } else {
      total = Math.round(this.totalBeforeDiscount * 100).toString();
    }
    total = total.substring(0, total.length - 2) + '.' + total.substring(total.length - 2, total.length);
    return Number(total);
  }

  /**
   * Applique ou retire la remise de fidélité selon le paramètre
   * @param isFidelityDiscount Défini si la remise est appliquée ou non
   */
  public switchFidelityDiscount(isFidelityDiscount: boolean): void {
    this.saleForm.controls.isFidelityDiscount.setValue(isFidelityDiscount);
    if (isFidelityDiscount) {
      this.saleForm.get('discount').setValue(this.settings.discount, {disabled: true});
      this.saleForm.get('discount').disable();
      this.saleForm.get('discountType').setValue(this.settings.discountType, {disabled: true});
      this.saleForm.get('discountType').disable();

    } else {
      this.saleForm.get('discount').setValue(null);
      this.saleForm.get('discount').enable();
      this.saleForm.get('discountType').setValue(null);
      this.saleForm.get('discountType').enable();
    }
    this.sale.total = this.getTotal();
  }

  /**
   * Appelle la méthode outil de conversion de chaine en number
   */
  public toNumber(value: string): number {
    return NumberTools.toNumber(value);
  }

  /**
   * Retourne la liste des clients après application du filtre
   * @param value Valeur saisie dans la recherche
   */
  private _filter(value: string): Customer[] {
    const filterValue = (typeof value === 'string') ? value.trim().toLowerCase() : '';

    return this.customers.filter(customer =>
      customer.firstName.toLowerCase().includes(filterValue)
      || customer.lastName.toLowerCase().includes(filterValue)
    );
  }

}
