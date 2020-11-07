import { NgModule } from '@angular/core';

import { CashRegisterRoutingModule } from './cash-register-routing.module';
import { CashRegisterComponent } from './cash-register.component';
import { SharedModule } from '../../shared/shared.module';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { FidelityDialogComponent } from './fidelity-dialog/fidelity-dialog.component';
import { CashLogPrintDialogComponent } from './cash-log-print-dialog/cash-log-print-dialog.component';
import { QuantityDialogComponent } from './quantity-dialog/quantity-dialog.component';


@NgModule({
  declarations: [
    CashRegisterComponent,
    PaymentDialogComponent,
    FidelityDialogComponent,
    CashLogPrintDialogComponent,
    QuantityDialogComponent
  ],
  imports: [
    SharedModule,
    CashRegisterRoutingModule
  ]
})
export class CashRegisterModule { }
