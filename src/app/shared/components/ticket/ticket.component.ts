import { Component, Input, OnInit } from '@angular/core';
import { Sale } from '../../models/sale.model';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  @Input() sale: Sale;
  @Input() isDuplicata: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
