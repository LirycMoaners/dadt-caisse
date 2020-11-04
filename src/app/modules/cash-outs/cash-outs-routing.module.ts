import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashOutsComponent } from './cash-outs.component';

const routes: Routes = [{ path: '', component: CashOutsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CashOutsRoutingModule { }
