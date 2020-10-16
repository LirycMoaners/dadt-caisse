import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Customer } from 'src/app/shared/models/customer.model';

@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html',
  styleUrls: ['./customer-dialog.component.scss']
})
export class CustomerDialogComponent implements OnInit {
  public title = '';
  public customerFormGroup: FormGroup;

  constructor(
    private readonly ref: MatDialogRef<CustomerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly customer: Customer
  ) { }

  ngOnInit(): void {
    this.customerFormGroup = new FormGroup({
      id: new FormControl(''),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      emailAddress: new FormControl('', [Validators.email]),
      phoneNumber: new FormControl('', [Validators.pattern('^[0-9]{10}$')]),
      loyaltyPoints: new FormControl('', [Validators.pattern('^[0-9]*$')])
    });

    if (this.customer) {
      this.title = 'Edition de client';
      this.customerFormGroup.setValue(this.customer);
    } else {
      this.title = 'Ajout de client';
    }
  }

  /**
   * Validation de la saisie avant de retourner le client
   */
  public validate(): void {
    if (this.customerFormGroup.valid) {
      const customer: Customer = this.customerFormGroup.value;
      customer.updateDate = new Date();
      if (!this.customer) {
        customer.createDate = new Date();
      }
      this.ref.close(customer);
    } else {
      this.customerFormGroup.markAllAsTouched();
    }
  }

}
