import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'cash-register'
  },
  {
    path: 'cash-register',
    loadChildren: () => import('./modules/cash-register/cash-register.module').then(m => m.CashRegisterModule),
    data: { title: 'Caisse' }
  },
  {
    path: 'articles',
    loadChildren: () => import('./modules/articles/articles.module').then(m => m.ArticlesModule),
    data: { title: 'Articles' }
  },
  {
    path: 'customers',
    loadChildren: () => import('./modules/customers/customers.module').then(m => m.CustomersModule),
    data: { title: 'Clients' }
  },
  {
    path: 'settings',
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
    data: { title: 'Paramètres' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
