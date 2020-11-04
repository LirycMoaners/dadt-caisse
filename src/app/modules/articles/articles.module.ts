import { NgModule } from '@angular/core';

import { ArticlesRoutingModule } from './articles-routing.module';
import { ArticlesComponent } from './articles.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ArticleDialogComponent } from './article-dialog/article-dialog.component';


@NgModule({
  declarations: [
    ArticlesComponent,
    ArticleDialogComponent
  ],
  imports: [
    SharedModule,
    ArticlesRoutingModule
  ]
})
export class ArticlesModule { }
