import { Component, Input, OnInit } from '@angular/core';
import { Article } from 'src/app/shared/models/article.model';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  @Input() articles: Article[];
  @Input() articleCategoryLabel: string;

  constructor() { }

  ngOnInit(): void { }
}
