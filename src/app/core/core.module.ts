import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { CustomerService } from './http-services/customer.service';
import { ArticleService } from './http-services/article.service';
import { ArticleCategoryService } from './http-services/article-category.service';
import { SaleService } from './http-services/sale.service';



@NgModule({
  declarations: [
    SidenavComponent,
    ToolbarComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    SidenavComponent,
    ToolbarComponent
  ],
  providers: [
    CustomerService,
    ArticleService,
    ArticleCategoryService,
    SaleService
  ]
})
export class CoreModule { }
