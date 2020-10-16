import { EventEmitter } from '@angular/core';
import { Component, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CashOutCategoryService } from 'src/app/core/http-services/cash-out-category.service';
import { CashOutService } from 'src/app/core/http-services/cash-out.service';
import { CashOutCategory } from 'src/app/shared/models/cash-out-category.model';
import { CashOut } from 'src/app/shared/models/cash-out.model';

@Component({
  selector: 'app-cash-out-details',
  templateUrl: './cash-out-details.component.html',
  styleUrls: ['./cash-out-details.component.scss']
})
export class CashOutDetailsComponent implements OnInit, OnChanges {
  @Input() cashOut: CashOut;
  @Output() cashOutDeleted: EventEmitter<void> = new EventEmitter();
  public cashOutForm: FormGroup;
  public cashOutCategories: CashOutCategory[];
  public errorMessage: string;
  public cashOutCategoryCompareFunction =
    (cashOutCategoryA: CashOutCategory, cashOutCategoryB: CashOutCategory) => cashOutCategoryA.id === cashOutCategoryB.id

  constructor(
    private readonly fb: FormBuilder,
    private readonly cashOutService: CashOutService,
    private readonly cashOutCategoryService: CashOutCategoryService
  ) { }

  ngOnInit(): void {
    this.cashOutCategoryService.getAll().pipe(first()).subscribe(cashOutCategories => this.cashOutCategories = cashOutCategories);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cashOut && this.cashOut) {
      this.cashOutForm = this.fb.group({
        label: [this.cashOut.label, [Validators.required]],
        cashOutCategory: [this.cashOut.cashOutCategory, [Validators.required]],
        total: [this.cashOut.total, [Validators.required]],
        createDate: this.fb.control({value: this.cashOut.createDate, disabled: true}, Validators.required)
      });
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
   * Appel au service d'ajout ou de modification de retrait caisse si les données saisies sont valides
   */
  public save(): void {
    if (this.cashOutForm.valid) {
      this.cashOut = {
        id: this.cashOut.id,
        createDate: this.cashOutForm.get('createDate').value,
        updateDate: new Date(),
        ...this.cashOutForm.value
      };
      this.errorMessage = '';
      (
        !!this.cashOut.id
        ? this.cashOutService.update(this.cashOut)
        : this.cashOutService.create(this.cashOut)
      ).subscribe(() => this.cashOutForm.markAsUntouched());
    } else {
      this.errorMessage = 'L\'un des champs n\'est pas saisi !';
    }
  }

  /**
   * Appel au service de suppression de retrait caisse si l'utilisateur confirme la suppression
   */
  public delete(): void {
    if (confirm('Souhaitez-vous réellement supprimer le retrait caisse ' + this.cashOut.label + ' du ' + this.cashOut.createDate + ' ?')) {
      this.cashOutService.delete(this.cashOut.id).subscribe(() => {
        this.cashOutDeleted.emit();
      });
    }
  }

}
