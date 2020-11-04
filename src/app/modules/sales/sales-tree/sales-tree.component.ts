import { ArrayDataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FormStyle, getLocaleMonthNames, TranslationWidth } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { Component, Input, OnInit, Output } from '@angular/core';
import { FlatNode } from 'src/app/shared/models/flat-node.interface';
import { Sale } from 'src/app/shared/models/sale.model';

@Component({
  selector: 'app-sales-tree',
  templateUrl: './sales-tree.component.html',
  styleUrls: ['./sales-tree.component.scss']
})
export class SalesTreeComponent implements OnInit {
  @Input() sales: Sale[];
  @Output() saleSelected: EventEmitter<Sale> = new EventEmitter();
  public dateFilter: Date;
  public textFilter: string;
  public dataSourceByDate: ArrayDataSource<FlatNode<Sale>>;
  public dataSourceByCustomer: ArrayDataSource<FlatNode<Sale>>;
  public treeControlByDate: FlatTreeControl<FlatNode<Sale>>;
  public treeControlByCustomer: FlatTreeControl<FlatNode<Sale>>;
  private saleFlatNodesByDate: FlatNode<Sale>[];
  private saleFlatNodesByCustomer: FlatNode<Sale>[];
  private months: string[];

  constructor() { }

  ngOnInit(): void {
    this.months = getLocaleMonthNames('fr', FormStyle.Format, TranslationWidth.Wide);
    this.saleFlatNodesByDate = this.getSaleFlatNodesByDate(this.sales);
    this.dataSourceByDate = new ArrayDataSource<FlatNode<Sale>>(this.saleFlatNodesByDate);
    this.treeControlByDate = new FlatTreeControl<FlatNode<Sale>>(
      (saleFlatNode) => saleFlatNode.level,
      (saleFlatNode) => saleFlatNode.isExpandable
    );
    this.treeControlByDate.dataNodes = this.saleFlatNodesByDate;
    this.saleFlatNodesByCustomer = this.getSaleFlatNodesByCustomer(this.sales);
    this.dataSourceByCustomer = new ArrayDataSource<FlatNode<Sale>>(this.saleFlatNodesByCustomer);
    this.treeControlByCustomer = new FlatTreeControl<FlatNode<Sale>>(
      (saleFlatNode) => saleFlatNode.level,
      (saleFlatNode) => saleFlatNode.isExpandable
    );
    this.treeControlByCustomer.dataNodes = this.saleFlatNodesByCustomer;
    this.dateFilter = new Date();
    this.filterByDate();
  }

  /**
   * Filtre les ventes suivant la date saisie par l'utilisateur
   */
  public filterByDate(): void {
    this.saleSelected.emit(null);
    this.saleFlatNodesByDate.forEach(saleFlatNode => {
      saleFlatNode.isExpanded = false;
      saleFlatNode.isSelected = false;
    });

    if (this.dateFilter) {
      if (
        this.sales.find(sale => sale.createDate.toString().substring(0, 9) === this.dateFilter.toString().substring(0, 9))
      ) {
        const yearNode = this.saleFlatNodesByDate.find(
          saleFlatNode => saleFlatNode.label === this.dateFilter.getFullYear().toString()
        );
        yearNode.isExpanded = true;
        const monthNode = this.treeControlByDate.getDescendants(yearNode)
          .find(saleFlatNode => saleFlatNode.label === this.months[this.dateFilter.getMonth()]);
        monthNode.isExpanded = true;
        const dayNode = this.treeControlByDate.getDescendants(monthNode)
          .find(saleFlatNode => saleFlatNode.label === this.dateFilter.getDate().toString());
        dayNode.isExpanded = true;
      }
    }
  }

  /**
   * Filtre les ventes suivant le client saisi par l'utilisateur
   */
  public filterByText(): void {
    this.saleSelected.emit(null);
    this.saleFlatNodesByCustomer.forEach(saleFlatNode => {
      saleFlatNode.isExpanded = false;
      saleFlatNode.isSelected = false;
    });

    if (this.textFilter) {
      const customerNode = this.saleFlatNodesByCustomer.find(saleFlatNode => saleFlatNode.label.includes(this.textFilter));
      if (customerNode) {
        customerNode.isExpanded = true;
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
  public shouldRender(saleFlatNode: FlatNode<Sale>, isByDate = true): boolean {
    let parent = this.getParentNode(saleFlatNode, isByDate);
    while (parent) {
      if (!parent.isExpanded) {
        return false;
      }
      parent = this.getParentNode(parent, isByDate);
    }
    return true;
  }

  /**
   * Garde le noeud sélectionné et émet sa valeur au composant parent
   * @param saleFlatNode Le noeud sélectionné
   */
  public onClickSaleFlatNode(saleFlatNode: FlatNode<Sale>, isByDate = true): void {
    const saleFlatNodes = isByDate ? this.saleFlatNodesByDate : this.saleFlatNodesByCustomer;
    saleFlatNodes.forEach(sfn => sfn.isSelected = false);
    saleFlatNode.isSelected = true;
    this.saleSelected.emit(saleFlatNode.value);
  }

  /**
   * Réduit tous les noeuds sauf ceux contenant le noeud sélectionné
   */
  public collapseAll(isByDate = true): void {
    const saleFlatNodes = isByDate ? this.saleFlatNodesByDate : this.saleFlatNodesByCustomer;
    const selectedSaleFlatNode = saleFlatNodes.find(saleFlatNode => saleFlatNode.isSelected);
    saleFlatNodes.forEach(saleFlatNode => saleFlatNode.isExpanded = false);
    if (selectedSaleFlatNode) {
      let parent = this.getParentNode(selectedSaleFlatNode, isByDate);
      while (parent) {
        parent.isExpanded = true;
        parent = this.getParentNode(parent, isByDate);
      }
    }
  }

  /**
   * Convertis les ventes en noeud pour l'affichage de l'arbre par date
   * @param sales Les vente à convertir
   */
  private getSaleFlatNodesByDate(sales: Sale[]): FlatNode<Sale>[] {
    const orderedSales: Sale[] = [...sales].sort((saleA, saleB) =>
      (saleB.createDate as Date).valueOf() - (saleA.createDate as Date).valueOf()
    );
    const saleFlatNodesByDate: FlatNode<Sale>[] = [];
    let startLevelToPush: number;
    let currentTreeSaleLabel: string;

    for (const sale of orderedSales) {
      startLevelToPush = 0;
      if (saleFlatNodesByDate.some(saleFlatNode => saleFlatNode.label === (sale.createDate as Date).getFullYear().toString())) {
        startLevelToPush++;
        if (saleFlatNodesByDate.some(saleFlatNode => saleFlatNode.label === this.months[(sale.createDate as Date).getMonth()])) {
          startLevelToPush++;
          if (saleFlatNodesByDate.some(saleFlatNode => saleFlatNode.label === (sale.createDate as Date).getDate().toString())) {
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

        saleFlatNodesByDate.push({
          level: i,
          isExpandable: i === 3 ? false : true,
          label: currentTreeSaleLabel,
          value: i === 3 ? sale : null
        });
      }
    }

    return saleFlatNodesByDate;
  }

  /**
   * Convertis les ventes en noeud pour l'affichage de l'arbre par client
   * @param sales Les vente à convertir
   */
  private getSaleFlatNodesByCustomer(sales: Sale[]): FlatNode<Sale>[] {
    const orderedSales: Sale[] = [...sales].sort((saleA, saleB) => {
      if (!saleA.customer) {
        return 1;
      } else if (!saleB.customer) {
        return -1;
      }
      const lastNameDiff = saleA.customer.lastName.localeCompare(saleB.customer.lastName);
      if (lastNameDiff) {
        return lastNameDiff;
      }
      const firstNameDiff = saleA.customer.lastName.localeCompare(saleB.customer.lastName);
      if (firstNameDiff) {
        return firstNameDiff;
      }
      return (saleB.createDate as Date).valueOf() - (saleA.createDate as Date).valueOf();
    });
    const saleFlatNodesByCustomer: FlatNode<Sale>[] = [];
    let startLevelToPush: number;
    let currentTreeSaleLabel: string;

    for (const sale of orderedSales) {
      startLevelToPush = 0;
      if (saleFlatNodesByCustomer.some(
        saleFlatNode => saleFlatNode.label.localeCompare(sale.customer ? sale.customer.lastName + ' ' + sale.customer.firstName : 'Non renseigné') === 0
      )) {
        startLevelToPush++;
      }

      for (let i = startLevelToPush; i <= 1; i++) {
        if (i === 0) {
          currentTreeSaleLabel = sale.customer ? sale.customer.lastName + ' ' + sale.customer.firstName : 'Non renseigné';
        } else {
          currentTreeSaleLabel = sale.createDate.toString();
        }

        saleFlatNodesByCustomer.push({
          level: i,
          isExpandable: i === 1 ? false : true,
          label: currentTreeSaleLabel,
          value: i === 1 ? sale : null
        });
      }
    }

    return saleFlatNodesByCustomer;
  }

  /**
   * Retourne le noeud parent de celui passé en paramètre
   * @param saleFlatNode Le noeud pour lequel on cherche le parent
   */
  private getParentNode(saleFlatNode: FlatNode<Sale>, isByDate: boolean): FlatNode<Sale> {
    const saleFlatNodes = isByDate ? this.saleFlatNodesByDate : this.saleFlatNodesByCustomer;
    const nodeIndex = saleFlatNodes.indexOf(saleFlatNode);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (saleFlatNodes[i].level === saleFlatNode.level - 1) {
        return saleFlatNodes[i];
      }
    }

    return null;
  }

}
