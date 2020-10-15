import { NgModule } from '@angular/core';

import { ArticlesRoutingModule } from './articles-routing.module';
import { ArticlesComponent } from './articles.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ArticleDialogComponent } from './article-dialog/article-dialog.component';
import { InventoryComponent } from './inventory/inventory.component';


@NgModule({
  declarations: [
    ArticlesComponent,
    ArticleDialogComponent,
    InventoryComponent
  ],
  imports: [
    SharedModule,
    ArticlesRoutingModule
  ]
})
export class ArticlesModule { }
