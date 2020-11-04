import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ArticleCategoryService } from 'src/app/core/http-services/article-category.service';
import { CashOutCategoryService } from 'src/app/core/http-services/cash-out-category.service';
import { GoogleService } from 'src/app/core/http-services/google.service';
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
  public contactGroups: gapi.client.people.ContactGroup[];
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly settingsService: SettingsService,
    private readonly articleCategoryService: ArticleCategoryService,
    private readonly cashOutCategoryService: CashOutCategoryService,
    private readonly googleService: GoogleService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({});
    this.subscriptions.push(
      this.settingsService.getSettings().pipe(
        mergeMap((settings) => {
          this.form.setControl('settings', this.fb.group({
            address: [settings.address, [Validators.required]],
            taxeRate: [settings.taxeRate, [Validators.required]],
            ticketFooter: [settings.ticketFooter, []],
            contactGroup: [settings.contactGroup, []],
            eurosToPoint: [settings.eurosToPoint, [Validators.required]],
            pointsToEuro: [settings.pointsToEuro, [Validators.required]],
            pointsForDiscount: [settings.pointsForDiscount, [Validators.required]],
            discount: [settings.discount, [Validators.required]],
            discountType: [settings.discountType, [Validators.required]]
          }));
          return combineLatest([
            settings.contactGroup ? this.googleSignIn() : of(),
            this.form.get('settings').valueChanges.pipe(
              mergeMap((s: Settings) =>
                this.form.get('settings').valid ? this.settingsService.updateSettings(s) : of(null)
              )
            )
          ]);
        })
      ).subscribe(),
      this.articleCategoryService.getAll().pipe(
        mergeMap((articleCategories) => {
          this.form.setControl('articleCategories', this.fb.array(
            articleCategories.map(
              articleCategory => this.fb.group({
                id: [articleCategory.id, []],
                label: [articleCategory.label, [Validators.required]],
                createDate: [articleCategory.createDate, [Validators.required]],
                updateDate: [articleCategory.updateDate, [Validators.required]]
              }, { updateOn: 'blur' })
            )
          ));
          return combineLatest([
            ...(this.form.get('articleCategories') as FormArray).controls
              .map((control, index) => control.valueChanges.pipe(
                mergeMap((articleCategory: ArticleCategory) => {
                  if ((this.form.get('articleCategories') as FormArray).controls[index].valid) {
                    articleCategory.updateDate = new Date();
                    return this.articleCategoryService.update(articleCategory);
                  }
                  return of(null);
                })
              )
            )
          ]);
        })
      ).subscribe(),
      this.cashOutCategoryService.getAll().pipe(
        mergeMap((cashOutCategories) => {
          this.form.setControl('cashOutCategories', this.fb.array(
            cashOutCategories.map(
              cashOutCategory => this.fb.group({
                id: [cashOutCategory.id, []],
                label: [cashOutCategory.label, [Validators.required]],
                createDate: [cashOutCategory.createDate, [Validators.required]],
                updateDate: [cashOutCategory.updateDate, [Validators.required]]
              }, { updateOn: 'blur' })
            )
          ));
          return combineLatest([
            ...(this.form.get('cashOutCategories') as FormArray).controls
              .map((control, index) => control.valueChanges.pipe(
                mergeMap((cashOutCategory: CashOutCategory) => {
                  if ((this.form.get('cashOutCategories') as FormArray).controls[index].valid) {
                    cashOutCategory.updateDate = new Date();
                    return this.cashOutCategoryService.update(cashOutCategory);
                  }
                  return of(null);
                })
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
      this.articleCategoryService.delete(articleCategory).subscribe(() =>
        articleCategoriesFormArray.removeAt(index)
      );
    }
  }

  /**
   * Ajoute une catégorie d'article vierge au formulaire
   */
  public addArticleCategory(): void {
    this.articleCategoryService.create({id: '', label: '', createDate: new Date(), updateDate: new Date()}).subscribe();
  }

  /**
   * Supprime la catégorie de retrait caisse dont l'index est en paramètre
   * @param index L'index de la catégorie de retrait caisse à supprimer
   */
  public deleteCashOutCategory(index: number): void {
    const cashOutCategoriesFormArray: FormArray = this.form.get('cashOutCategories') as FormArray;
    const cashOutCategory = cashOutCategoriesFormArray.controls[index].value;
    if (confirm('Souhaitez-vous réellement supprimer la catégorie ' + cashOutCategory.label + ' ?')) {
      this.cashOutCategoryService.delete(cashOutCategory).subscribe(() =>
      cashOutCategoriesFormArray.removeAt(index)
      );
    }
  }

  /**
   * Ajoute une catégorie de retrait caisse vierge au formulaire
   */
  public addCashOutCategory(): void {
    this.cashOutCategoryService.create({id: '', label: '', createDate: new Date(), updateDate: new Date()}).subscribe();
  }

  /**
   * Enclenche le processus d'authorisation d'accès aux contacts d'un utilisateur Google
   */
  public googleSignIn(): Observable<void>{
    return this.googleService.signIn().pipe(
      mergeMap(result => result ? this.googleService.getContactGroupList() : of()),
      map((contactGroups: gapi.client.people.ContactGroup[]) => {
        this.contactGroups = contactGroups;
      })
    );
  }

}
