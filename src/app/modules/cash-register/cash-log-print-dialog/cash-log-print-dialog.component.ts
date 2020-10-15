import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cash-log-print-dialog',
  templateUrl: './cash-log-print-dialog.component.html',
  styleUrls: ['./cash-log-print-dialog.component.scss']
})
export class CashLogPrintDialogComponent implements OnInit {
  public periodForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CashLogPrintDialogComponent>,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.periodForm = this.fb.group({
      from: new FormControl({value: '', disabled: true}, Validators.required),
      to: new FormControl({value: '', disabled: true}, Validators.required)
    });
  }

  /**
   * Retourne la période sélectionnée au composant appelant afin d'exporter le journal de caisse
   */
  public print(): void {
    if (
      this.periodForm.get('from').value
      && this.periodForm.get('to').value
      && this.periodForm.get('from').value < this.periodForm.get('to').value
    ) {
      this.dialogRef.close(this.periodForm.value);
    }
  }

}
