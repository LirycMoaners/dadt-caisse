import { Component, Input, OnInit } from '@angular/core';
import { Sale } from 'src/app/shared/models/sale.model';

@Component({
  selector: 'app-cash-log',
  templateUrl: './cash-log.component.html',
  styleUrls: ['./cash-log.component.scss']
})
export class CashLogComponent implements OnInit {
  @Input() sales: Sale[];

  constructor() { }

  ngOnInit(): void {
  }

}
