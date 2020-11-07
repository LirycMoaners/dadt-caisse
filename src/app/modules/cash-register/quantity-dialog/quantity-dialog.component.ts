import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NumberTools } from 'src/app/shared/tools/number.tools';

@Component({
  selector: 'app-quantity-dialog',
  templateUrl: './quantity-dialog.component.html',
  styleUrls: ['./quantity-dialog.component.scss']
})
export class QuantityDialogComponent implements OnInit {
  public quantity = 1;

  constructor(
    public dialogRef: MatDialogRef<QuantityDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  /**
   * Fait appel à la méthode outils de conversion d'une chaine en nombre
   */
  public toNumber(value: string): number {
    return NumberTools.toNumber(value);
  }

  public close(): void {
    if (this.quantity > 0) {
      this.dialogRef.close(this.quantity);
    }
  }

}
