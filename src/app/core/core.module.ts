import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { CustomerService } from './http-services/customer.service';
import { ArticleService } from './http-services/article.service';
import { ArticleCategoryService } from './http-services/article-category.service';
import { SaleService } from './http-services/sale.service';
import { SettingsService } from './http-services/settings.service';
import { CashOutCategoryService } from './http-services/cash-out-category.service';
import { CashOutService } from './http-services/cash-out.service';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticationService } from './http-services/authentication.service';
import { GoogleService } from './http-services/google.service';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    SidenavComponent,
    ToolbarComponent
  ],
  imports: [
    SharedModule,
    HttpClientModule
  ],
  exports: [
    SidenavComponent,
    ToolbarComponent
  ],
  providers: [
    AuthGuard,
    AuthenticationService,
    CustomerService,
    ArticleService,
    ArticleCategoryService,
    SaleService,
    CashOutCategoryService,
    CashOutService,
    SettingsService,
    GoogleService
  ]
})
export class CoreModule { }
