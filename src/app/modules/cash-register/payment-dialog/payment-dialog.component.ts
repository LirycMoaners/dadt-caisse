import { Component, OnInit, Inject } from '@angular/core';
import { Sale } from 'src/app/shared/models/sale.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public sale: Sale
  ) { }

  ngOnInit(): void {
  }

  public pay(): void {
    this.dialogRef.close(this.sale);
  }

}
