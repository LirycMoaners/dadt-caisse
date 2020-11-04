import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'cash-register'
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule),
    data: { title: 'Connexion' },
    canActivate: [AuthGuard]
  },
  {
    path: 'cash-register',
    loadChildren: () => import('./modules/cash-register/cash-register.module').then(m => m.CashRegisterModule),
    data: { title: 'Caisse' },
    canActivate: [AuthGuard]
  },
  {
    path: 'articles',
    loadChildren: () => import('./modules/articles/articles.module').then(m => m.ArticlesModule),
    data: { title: 'Articles' },
    canActivate: [AuthGuard]
  },
  {
    path: 'customers',
    loadChildren: () => import('./modules/customers/customers.module').then(m => m.CustomersModule),
    data: { title: 'Clients' },
    canActivate: [AuthGuard]
  },
  {
    path: 'sales',
    loadChildren: () => import('./modules/sales/sales.module').then(m => m.SalesModule),
    data: { title: 'Ventes' },
    canActivate: [AuthGuard]
  },
  {
    path: 'cash-out',
    loadChildren: () => import('./modules/cash-outs/cash-outs.module').then(m => m.CashOutsModule),
    data: { title: 'Retraits caisse' },
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
    data: { title: 'Paramètres' },
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'cash-register'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
