import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, of, Subscription } from 'rxjs';
import { first, flatMap } from 'rxjs/operators';
import { ArticleCategoryService } from 'src/app/core/http-services/article-category.service';
import { CashOutCategoryService } from 'src/app/core/http-services/cash-out-category.service';
import { SettingsService } from 'src/app/core/http-services/settings.service';
import { ArticleCategory } from 'src/app/shared/models/article-category.model';
import { CashOutCategory } from 'src/app/shared/models/cash-out-category.model';
import { Settings } from 'src/app/shared/models/settings.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public articleCategories: ArticleCategory[];
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly settingsService: SettingsService,
    private readonly articleCategoryService: ArticleCategoryService,
    private readonly cashOutCategoryService: CashOutCategoryService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest([
        this.settingsService.getSettings().pipe(first()),
        this.articleCategoryService.getAll().pipe(first()),
        this.cashOutCategoryService.getAll().pipe(first())
      ]).pipe(
        flatMap(([settings, articleCategories, cashOutCategories]: [Settings, ArticleCategory[], CashOutCategory[]]) => {
          this.form = this.fb.group({
            settings: this.fb.group({
              eurosToPoint: [settings.eurosToPoint, [Validators.required]],
              pointsToEuro: [settings.pointsToEuro, [Validators.required]],
              pointsForDiscount: [settings.pointsForDiscount, [Validators.required]],
              companyName: [settings.companyName, [Validators.required]],
              address: [settings.address, [Validators.required]],
              taxeRate: [settings.taxeRate, [Validators.required]]
            }),
            articleCategories: this.fb.array(
              articleCategories.map(
                articleCategory => this.fb.group({id: [articleCategory.id, []], label: [articleCategory.label, [Validators.required]]})
              )
            ),
            cashOutCategories: this.fb.array(
              cashOutCategories.map(
                cashOutCategory => this.fb.group({id: [cashOutCategory.id, []], label: [cashOutCategory.label, [Validators.required]]})
              )
            )
          });
          return combineLatest([
            this.form.get('settings').valueChanges.pipe(
              flatMap((s: Settings) =>
                this.form.get('settings').valid ? this.settingsService.updateSettings(s) : of(null)
              )
            ),
            ...(this.form.get('articleCategories') as FormArray).controls
              .map((control, index) => control.valueChanges.pipe(
                flatMap((articleCategory: ArticleCategory) =>
                  (this.form.get('articleCategories') as FormArray).controls[index].valid
                  ? this.articleCategoryService.update(articleCategory)
                  : of(null)
                )
              )
            ),
            ...(this.form.get('cashOutCategories') as FormArray).controls
              .map((control, index) => control.valueChanges.pipe(
                flatMap((cashOutCategory: CashOutCategory) =>
                  (this.form.get('cashOutCategories') as FormArray).controls[index].valid
                  ? this.cashOutCategoryService.update(cashOutCategory)
                  : of(null)
                )
              )
            )
          ]);
        })
      ).subscribe()
    );
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  /**
   * Supprime la catégorie d'article dont l'index est en paramètre
   * @param articleCategory La catégorie d'article à supprimer
   */
  public deleteArticleCategory(index: number): void {
    const articleCategoriesFormArray: FormArray = this.form.get('articleCategories') as FormArray;
    const articleCategory = articleCategoriesFormArray.controls[index].value;
    if (confirm('Souhaitez-vous réellement supprimer la catégorie ' + articleCategory.label + ' ?')) {
      this.articleCategoryService.delete(articleCategory.id).subscribe(() =>
        articleCategoriesFormArray.removeAt(index)
      );
    }
  }

  /**
   * Ajoute une catégorie d'article vierge au formulaire
   */
  public addArticleCategory(): void {
    this.subscriptions.push(
      this.articleCategoryService.create({id: '', label: ''}).pipe(
        flatMap(articleCategory => {
          const newArticleCategoryFormGroup = this.fb.group(
            {id: [articleCategory.id, []], label: [articleCategory.label, [Validators.required]]}
          );
          (this.form.get('articleCategories') as FormArray).push(
            newArticleCategoryFormGroup
          );
          return newArticleCategoryFormGroup.valueChanges.pipe(
            flatMap((ac: ArticleCategory) =>
            newArticleCategoryFormGroup.valid
              ? this.articleCategoryService.update(ac)
              : of(null)
            )
          );
        })
      ).subscribe()
    );
  }

  /**
   * Supprime la catégorie de retrait caisse dont l'index est en paramètre
   * @param index L'index de la catégorie de retrait caisse à supprimer
   */
  public deleteCashOutCategory(index: number): void {
    const cashOutCategoriesFormArray: FormArray = this.form.get('cashOutCategories') as FormArray;
    const cashOutCategory = cashOutCategoriesFormArray.controls[index].value;
    if (confirm('Souhaitez-vous réellement supprimer la catégorie ' + cashOutCategory.label + ' ?')) {
      this.cashOutCategoryService.delete(cashOutCategory.id).subscribe(() =>
      cashOutCategoriesFormArray.removeAt(index)
      );
    }
  }

  /**
   * Ajoute une catégorie de retrait caisse vierge au formulaire
   */
  public addCashOutCategory(): void {
    this.subscriptions.push(
      this.cashOutCategoryService.create(new CashOutCategory()).pipe(
        flatMap(cashOutCategory => {
          const newCashOutCategoryFormGroup = this.fb.group(
            {id: [cashOutCategory.id, []], label: [cashOutCategory.label, [Validators.required]]}
          );
          (this.form.get('cashOutCategories') as FormArray).push(
            newCashOutCategoryFormGroup
          );
          return newCashOutCategoryFormGroup.valueChanges.pipe(
            flatMap((coc: CashOutCategory) =>
            newCashOutCategoryFormGroup.valid
              ? this.cashOutCategoryService.update(coc)
              : of(null)
            )
          );
        })
      ).subscribe()
    );
  }

}
