import { NgModule } from '@angular/core';
import { CashOutsComponent } from './cash-outs.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CashOutDetailsComponent } from './cash-out-details/cash-out-details.component';
import { CashOutsRoutingModule } from './cash-outs-routing.module';
import { CashOutsTreeComponent } from './cash-outs-tree/cash-outs-tree.component';



@NgModule({
  declarations: [
    CashOutsComponent,
    CashOutDetailsComponent,
    CashOutsTreeComponent
  ],
  imports: [
    SharedModule,
    CashOutsRoutingModule
  ]
})
export class CashOutsModule { }
