import { ArrayDataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FormStyle, getLocaleMonthNames, TranslationWidth } from '@angular/common';
import { EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Component, Input, OnInit, Output } from '@angular/core';
import { FlatNode } from 'src/app/shared/models/flat-node.interface';
import { Sale } from 'src/app/shared/models/sale.model';

@Component({
  selector: 'app-sales-tree',
  templateUrl: './sales-tree.component.html',
  styleUrls: ['./sales-tree.component.scss']
})
export class SalesTreeComponent implements OnInit, OnChanges {
  @Input() sales: Sale[];
  @Input() expandDate: Date;
  @Output() saleSelected: EventEmitter<Sale> = new EventEmitter();
  public dataSource: ArrayDataSource<FlatNode<Sale>>;
  public treeControl: FlatTreeControl<FlatNode<Sale>>;
  private saleFlatNodes: FlatNode<Sale>[];
  private months: string[];

  constructor() { }

  ngOnInit(): void {
    this.months = getLocaleMonthNames('fr', FormStyle.Format, TranslationWidth.Wide);
    this.saleFlatNodes = this.getSaleFlatNodes(this.sales);
    this.dataSource = new ArrayDataSource<FlatNode<Sale>>(this.saleFlatNodes);
    this.treeControl = new FlatTreeControl<FlatNode<Sale>>(
      (saleFlatNode) => saleFlatNode.level,
      (saleFlatNode) => saleFlatNode.isExpandable
    );
    this.treeControl.dataNodes = this.saleFlatNodes;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.expandDate && !changes.expandDate.firstChange) {
      this.saleSelected.emit(null);
      this.saleFlatNodes.forEach(saleFlatNode => {
          saleFlatNode.isExpanded = false;
          saleFlatNode.isSelected = false;
        }
      );

      if (
        this.sales.find(sale => sale.createDate.toString().substring(0, 9) === this.expandDate.toString().substring(0, 9)
      )) {
        const yearNode = this.saleFlatNodes.find(saleFlatNode => saleFlatNode.label === this.expandDate.getFullYear().toString());
        yearNode.isExpanded = true;
        const monthNode = this.treeControl.getDescendants(yearNode)
          .find(saleFlatNode => saleFlatNode.label === this.months[this.expandDate.getMonth()]);
        monthNode.isExpanded = true;
        const dayNode = this.treeControl.getDescendants(monthNode)
          .find(saleFlatNode => saleFlatNode.label === this.expandDate.getDate().toString());
        dayNode.isExpanded = true;
      }
    }
  }

  /**
   * Vérifie que le noeud est ouvrable
   * @param cashOutFlatNode Le noeud à vérifier
   */
  public hasChild(_: number, saleFlatNode: FlatNode<Sale>): boolean {
    return saleFlatNode.isExpandable;
  }

  /**
   * Retourne si le noeud en paramètre doit être affiché
   * @param saleFlatNode Le noeud à affficher ou non
   */
  public shouldRender(saleFlatNode: FlatNode<Sale>): boolean {
    let parent = this.getParentNode(saleFlatNode);
    while (parent) {
      if (!parent.isExpanded) {
        return false;
      }
      parent = this.getParentNode(parent);
    }
    return true;
  }

  /**
   * Garde le noeud sélectionné et émet sa valeur au composant parent
   * @param saleFlatNode Le noeud sélectionné
   */
  public onClickSaleFlatNode(saleFlatNode: FlatNode<Sale>): void {
    this.saleFlatNodes.forEach(sfn => sfn.isSelected = false);
    saleFlatNode.isSelected = true;
    this.saleSelected.emit(saleFlatNode.value);
  }

  /**
   * Réduit tous les noeuds sauf ceux contenant le noeud sélectionné
   */
  public collapseAll(): void {
    const selectedSaleFlatNode = this.saleFlatNodes.find(saleFlatNode => saleFlatNode.isSelected);
    this.saleFlatNodes.forEach(saleFlatNode => saleFlatNode.isExpanded = false);
    if (selectedSaleFlatNode) {
      let parent = this.getParentNode(selectedSaleFlatNode);
      while (parent) {
        parent.isExpanded = true;
        parent = this.getParentNode(parent);
      }
    }
  }

  /**
   * Convertis les ventes en noeud pour l'affichage de l'arbre
   * @param sales Les vente à convertir
   */
  private getSaleFlatNodes(sales: Sale[]): FlatNode<Sale>[] {
    const orderedSales: Sale[] = [...sales].sort((saleA, saleB) =>
      (saleB.createDate as Date).valueOf() - (saleA.createDate as Date).valueOf()
    );
    const saleFlatNodes: FlatNode<Sale>[] = [];
    let startLevelToPush: number;
    let currentTreeSaleLabel: string;

    for (const sale of orderedSales) {
      startLevelToPush = 0;
      if (saleFlatNodes.some(saleFlatNode => saleFlatNode.label === (sale.createDate as Date).getFullYear().toString())) {
        startLevelToPush++;
        if (saleFlatNodes.some(saleFlatNode => saleFlatNode.label === this.months[(sale.createDate as Date).getMonth()])) {
          startLevelToPush++;
          if (saleFlatNodes.some(saleFlatNode => saleFlatNode.label === (sale.createDate as Date).getDate().toString())) {
            startLevelToPush++;
          }
        }
      }

      for (let i = startLevelToPush; i <= 3; i++) {
        switch (i) {
          case 0:
            currentTreeSaleLabel = (sale.createDate as Date).getFullYear().toString();
            break;
          case 1:
            currentTreeSaleLabel = this.months[(sale.createDate as Date).getMonth()];
            break;
          case 2:
            currentTreeSaleLabel = (sale.createDate as Date).getDate().toString();
            break;
          default:
            currentTreeSaleLabel = sale.createDate.toString();
            break;
        }

        saleFlatNodes.push({
          level: i,
          isExpandable: i === 3 ? false : true,
          label: currentTreeSaleLabel,
          value: i === 3 ? sale : null
        });
      }
    }

    return saleFlatNodes;
  }

  /**
   * Retourne le noeud parent de celui passé en paramètre
   * @param saleFlatNode Le noeud pour lequel on cherche le parent
   */
  private getParentNode(saleFlatNode: FlatNode<Sale>): FlatNode<Sale> {
    const nodeIndex = this.saleFlatNodes.indexOf(saleFlatNode);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (this.saleFlatNodes[i].level === saleFlatNode.level - 1) {
        return this.saleFlatNodes[i];
      }
    }

    return null;
  }

}
