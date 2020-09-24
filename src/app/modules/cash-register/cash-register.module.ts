import { NgModule } from '@angular/core';

import { CashRegisterRoutingModule } from './cash-register-routing.module';
import { CashRegisterComponent } from './cash-register.component';
import { SharedModule } from '../../shared/shared.module';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';


@NgModule({
  declarations: [CashRegisterComponent, PaymentDialogComponent],
  imports: [
    SharedModule,
    CashRegisterRoutingModule
  ]
})
export class CashRegisterModule { }
