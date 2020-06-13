import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { Article } from 'src/app/shared/models/article.model';
import { ArticleCategoryService } from 'src/app/core/http-services/article-category.service';
import { ArticleCategory } from 'src/app/shared/models/article-category.model';

@Component({
  selector: 'app-article-dialog',
  templateUrl: './article-dialog.component.html',
  styleUrls: ['./article-dialog.component.scss']
})
export class ArticleDialogComponent implements OnInit, OnDestroy {
  public title = '';
  public articleFormGroup: FormGroup;
  public categories: ArticleCategory[] = [];
  private subscription: Subscription;

  constructor(
    private readonly ref: MatDialogRef<ArticleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly article: Article,
    private readonly categoryService: ArticleCategoryService
  ) { }

  ngOnInit(): void {
    this.articleFormGroup = new FormGroup({
      id: new FormControl(''),
      reference: new FormControl('', Validators.required),
      label: new FormControl('', Validators.required),
      categoryId: new FormControl('', Validators.required),
      buyPrice: new FormControl('', Validators.pattern('^[0-9]*([,|\.][0-9]{2})?$')),
      sellPrice: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*([,|\.][0-9]{2})?$')]),
      quantity: new FormControl('', [Validators.pattern('^[0-9]*$')])
    });

    if (this.article) {
      this.title = 'Edition d\'article';
      this.articleFormGroup.setValue(this.article);
    } else {
      this.title = 'Ajout d\'aticle';
    }

    this.subscription = this.categoryService.getAll().subscribe(categories => this.categories = categories);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Validation de la saisie avant de retourner l'article
   */
  public validate(): void {
    if (this.articleFormGroup.valid) {
      const article: Article = this.articleFormGroup.value;
      article.quantity = article.quantity || 0;
      this.ref.close(article);
    } else {
      this.articleFormGroup.markAllAsTouched();
    }
  }

}
