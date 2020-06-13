import { NgModule } from '@angular/core';

import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CustomerDialogComponent } from './customer-dialog/customer-dialog.component';


@NgModule({
  declarations: [
    CustomersComponent,
    CustomerDialogComponent
  ],
  imports: [
    SharedModule,
    CustomersRoutingModule
  ],
  entryComponents: [CustomerDialogComponent]
})
export class CustomersModule { }
