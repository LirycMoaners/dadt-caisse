import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { Article } from 'src/app/shared/models/article.model';
import { ArticleCategoryService } from 'src/app/core/http-services/article-category.service';
import { ArticleCategory } from 'src/app/shared/models/article-category.model';
import { NumberTools } from 'src/app/shared/tools/number.tools';

@Component({
  selector: 'app-article-dialog',
  templateUrl: './article-dialog.component.html',
  styleUrls: ['./article-dialog.component.scss']
})
export class ArticleDialogComponent implements OnInit, OnDestroy {
  public title = '';
  public articleFormGroup: FormGroup;
  public categories: ArticleCategory[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly ref: MatDialogRef<ArticleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly article: Article,
    private readonly categoryService: ArticleCategoryService
  ) {
    this.articleFormGroup = new FormGroup({
      id: new FormControl(this.article ? this.article.id : null),
      reference: new FormControl(this.article ? this.article.reference : '', Validators.required),
      label: new FormControl(this.article ? this.article.label : '', Validators.required),
      categoryId: new FormControl(this.article ? this.article.categoryId : '', Validators.required),
      buyPrice: new FormControl(this.article ? this.article.buyPrice : '', Validators.required),
      sellPrice: new FormControl(this.article ? this.article.sellPrice : '', Validators.required),
      quantity: new FormControl(this.article ? this.article.quantity : '', Validators.required),
      createDate: new FormControl(this.article ? this.article.createDate : ''),
      updateDate: new FormControl(this.article ? this.article.updateDate : '')
    }, {updateOn: 'blur'});

    if (this.article) {
      this.title = 'Edition d\'article';
      this.articleFormGroup.setValue(this.article);
    } else {
      this.title = 'Ajout d\'article';
    }
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.categoryService.getAll().subscribe(categories => this.categories = categories),
      (this.articleFormGroup.get('buyPrice') as AbstractControl).valueChanges.subscribe(value =>
        typeof value === 'string' ? this.articleFormGroup.get('buyPrice')?.setValue(this.toNumber(value)) : null
      ),
      (this.articleFormGroup.get('sellPrice') as AbstractControl).valueChanges.subscribe(value =>
        typeof value === 'string' ? this.articleFormGroup.get('sellPrice')?.setValue(this.toNumber(value)) : null
      ),
      (this.articleFormGroup.get('quantity') as AbstractControl).valueChanges.subscribe(value =>
        typeof value === 'string' ? this.articleFormGroup.get('quantity')?.setValue(this.toNumber(value)) : null
      )
    );
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  /**
   * Validation de la saisie avant de retourner l'article
   */
  public validate(): void {
    if (this.articleFormGroup.valid) {
      const article: Article = this.articleFormGroup.value;
      article.quantity = article.quantity || 0;
      article.updateDate = new Date();
      if (!this.article) {
        article.createDate = new Date();
      }
      this.ref.close(article);
    } else {
      this.articleFormGroup.markAllAsTouched();
    }
  }

  /**
   * Fait appel à la méthode outils de conversion d'une chaine en nombre
   */
  public toNumber(value: string): number {
    return NumberTools.toNumber(value);
  }

}
