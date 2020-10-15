import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-fidelity-dialog',
  templateUrl: './fidelity-dialog.component.html',
  styleUrls: ['./fidelity-dialog.component.scss']
})
export class FidelityDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FidelityDialogComponent>
  ) { }

  ngOnInit(): void {
  }

}
