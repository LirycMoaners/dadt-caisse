import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { MatNativeDateModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTreeModule } from '@angular/material/tree';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';

import { PhoneNumberPipe } from './pipes/phone-number.pipe';
import { ArticleCategoryPipe } from './pipes/article-category-label.pipe';
import { TicketComponent } from './components/ticket/ticket.component';
import { BillComponent } from './components/bill/bill.component';
import { NumericDirective } from './directives/numeric.directive';



@NgModule({
  declarations: [
    PhoneNumberPipe,
    ArticleCategoryPipe,
    NumericDirective,
    TicketComponent,
    BillComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTreeModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatTabsModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PhoneNumberPipe,
    ArticleCategoryPipe,
    NumericDirective,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTreeModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatTabsModule
  ]
})
export class SharedModule { }
