import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
import { SalesTreeComponent } from './sales-tree/sales-tree.component';
import { SaleDetailsComponent } from './sale-details/sale-details.component';


@NgModule({
  declarations: [
    SalesComponent,
    SaleDetailsComponent,
    SalesTreeComponent
  ],
  imports: [
    SharedModule,
    SalesRoutingModule
  ]
})
export class SalesModule { }
