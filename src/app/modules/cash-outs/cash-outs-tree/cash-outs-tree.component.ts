import { ArrayDataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FormStyle, getLocaleMonthNames, TranslationWidth } from '@angular/common';
import { EventEmitter, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { Component, Input, OnInit, Output } from '@angular/core';
import { CashOut } from 'src/app/shared/models/cash-out.model';
import { FlatNode } from 'src/app/shared/models/flat-node.interface';

@Component({
  selector: 'app-cash-outs-tree',
  templateUrl: './cash-outs-tree.component.html',
  styleUrls: ['./cash-outs-tree.component.scss']
})
export class CashOutsTreeComponent implements OnInit, OnChanges {
  @Input() cashOuts: CashOut[];
  @Input() expandDate: Date;
  @Output() cashOutSelected: EventEmitter<CashOut> = new EventEmitter();
  public dataSource: ArrayDataSource<FlatNode<CashOut>>;
  public treeControl: FlatTreeControl<FlatNode<CashOut>>;
  private cashOutFlatNodes: FlatNode<CashOut>[];
  private months: string[];
  private lastSelectedCashOutFlatNode: FlatNode<CashOut>;

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cashOuts) {
      this.initCashOutFlatNodes(changes.cashOuts);
    }

    if (changes.expandDate && !changes.expandDate.firstChange) {
      this.expandAtFilteredDate();
    }
  }

  /**
   * Vérifie que le noeud est ouvrable
   * @param cashOutFlatNode Le noeud à vérifier
   */
  public hasChild(_: number, cashOutFlatNode: FlatNode<CashOut>): boolean {
    return cashOutFlatNode.isExpandable;
  }

  /**
   * Retourne si le noeud en paramètre doit être affiché
   * @param cashOutFlatNode Le noeud à affficher ou non
   */
  public shouldRender(cashOutFlatNode: FlatNode<CashOut>): boolean {
    let parent = this.getParentNode(cashOutFlatNode);
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
   * @param cashOutFlatNode Le noeud sélectionné
   */
  public onClickCashOutFlatNode(cashOutFlatNode: FlatNode<CashOut>) {
    this.cashOutFlatNodes.forEach(sfn => sfn.isSelected = false);
    cashOutFlatNode.isSelected = true;
    this.lastSelectedCashOutFlatNode = cashOutFlatNode;
    this.cashOutSelected.emit(cashOutFlatNode.value);
  }

  /**
   * Réduit tous les noeuds sauf ceux contenant le noeud sélectionné
   */
  public collapseAll() {
    const selectedCashOutFlatNode = this.cashOutFlatNodes.find(cashOutFlatNode => cashOutFlatNode.isSelected);
    this.cashOutFlatNodes.forEach(cashOutFlatNode => cashOutFlatNode.isExpanded = false);
    if (selectedCashOutFlatNode) {
      let parent = this.getParentNode(selectedCashOutFlatNode);
      while (parent) {
        parent.isExpanded = true;
        parent = this.getParentNode(parent);
      }
    }
  }

  /**
   * Convertis les retraits caisse en noeud pour l'affichage de l'arbre
   * @param cashOuts Les retraits caisse à convertir
   */
  private getCashOutFlatNodes(cashOuts: CashOut[]): FlatNode<CashOut>[] {
    const orderedCashOuts: CashOut[] = [...cashOuts].sort((cashOutA, cashOutB) => cashOutB.date.valueOf() - cashOutA.date.valueOf());
    const cashOutFlatNodes: FlatNode<CashOut>[] = [];
    let startLevelToPush: number;
    let currentTreeCashOutLabel: string;

    for (const cashOut of orderedCashOuts) {
      startLevelToPush = 0;
      if (cashOutFlatNodes.some(cashOutFlatNode => cashOutFlatNode.label === cashOut.date.getFullYear().toString())) {
        startLevelToPush++;
        if (cashOutFlatNodes.some(cashOutFlatNode => cashOutFlatNode.label === this.months[cashOut.date.getMonth()])) {
          startLevelToPush++;
          if (cashOutFlatNodes.some(cashOutFlatNode => cashOutFlatNode.label === cashOut.date.getDate().toString())) {
            startLevelToPush++;
          }
        }
      }

      for (let i = startLevelToPush; i <= 3; i++) {
        switch (i) {
          case 0:
            currentTreeCashOutLabel = cashOut.date.getFullYear().toString();
            break;
          case 1:
            currentTreeCashOutLabel = this.months[cashOut.date.getMonth()];
            break;
          case 2:
            currentTreeCashOutLabel = cashOut.date.getDate().toString();
            break;
          default:
            currentTreeCashOutLabel = cashOut.label + ' - ';
        }

        cashOutFlatNodes.push({
          level: i,
          isExpandable: i === 3 ? false : true,
          label: currentTreeCashOutLabel,
          value: i === 3 ? cashOut : null
        });
      }
    }

    return cashOutFlatNodes;
  }

  /**
   * Retourne le noeud parent de celui passé en paramètre
   * @param cashOutFlatNode Le noeud pour lequel on cherche le parent
   */
  private getParentNode(cashOutFlatNode: FlatNode<CashOut>) {
    const nodeIndex = this.cashOutFlatNodes.indexOf(cashOutFlatNode);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (this.cashOutFlatNodes[i].level === cashOutFlatNode.level - 1) {
        return this.cashOutFlatNodes[i];
      }
    }

    return null;
  }

  /**
   * Initialise l'arbre des retraits caisse
   * @param cashOutsChange Le changement de retraits caisse
   */
  private initCashOutFlatNodes(cashOutsChange: SimpleChange): void {
    let lastCashOutsLength: number;
    if (cashOutsChange.firstChange) {
      this.months = getLocaleMonthNames('fr', FormStyle.Format, TranslationWidth.Wide);
      this.treeControl = new FlatTreeControl<FlatNode<CashOut>>(
        (cashOutFlatNode) => cashOutFlatNode.level,
        (cashOutFlatNode) => cashOutFlatNode.isExpandable
      );
    } else {
      lastCashOutsLength = this.cashOutFlatNodes.length;
    }
    this.cashOutFlatNodes = this.getCashOutFlatNodes(this.cashOuts);
    this.dataSource = new ArrayDataSource<FlatNode<CashOut>>(this.cashOutFlatNodes);
    this.treeControl.dataNodes = this.cashOutFlatNodes;

    if (!cashOutsChange.firstChange) {
      this.cashOutFlatNodes.forEach(cashOutFlatNode => {
          cashOutFlatNode.isExpanded = false;
          cashOutFlatNode.isSelected = lastCashOutsLength === this.cashOutFlatNodes.length
            && cashOutFlatNode.value
            && this.lastSelectedCashOutFlatNode
            && this.lastSelectedCashOutFlatNode.value.id === cashOutFlatNode.value.id;
        }
      );

      if (!this.cashOutFlatNodes.some(cashOutFlatNode => cashOutFlatNode.isSelected)) {
        this.cashOutSelected.emit(null);
      }

      const cashOutFlatNodeSelected = this.cashOutFlatNodes.find(cashOutFlatNode => cashOutFlatNode.isSelected);
      const dateToExpand = cashOutFlatNodeSelected ? cashOutFlatNodeSelected.value.date : this.expandDate;
      this.expandToDate(dateToExpand);
    }
  }

  /**
   * Déplis l'arbre pour la date en entrée du composant
   */
  private expandAtFilteredDate(): void {
    this.cashOutFlatNodes.forEach(cashOutFlatNode => {
      cashOutFlatNode.isExpanded = false;
      cashOutFlatNode.isSelected = false;
    });

    this.cashOutSelected.emit(null);

    if (this.cashOuts.find(cashOut => cashOut.date.toString().substring(0, 9) === this.expandDate.toString().substring(0, 9))) {
      this.expandToDate(this.expandDate);
    }
  }

  /**
   * Déplis l'arbre jusqu'à la date passée en paramètre
   * @param date La date jusqu'à laquelle déplier l'arbre
   */
  private expandToDate(date: Date) {
    const yearNode = this.cashOutFlatNodes.find(cashOutFlatNode => cashOutFlatNode.label === date.getFullYear().toString());
    yearNode.isExpanded = true;
    const monthNode = this.treeControl.getDescendants(yearNode)
      .find(cashOutFlatNode => cashOutFlatNode.label === this.months[date.getMonth()]);
    monthNode.isExpanded = true;
    const dayNode = this.treeControl.getDescendants(monthNode)
      .find(cashOutFlatNode => cashOutFlatNode.label === date.getDate().toString());
    dayNode.isExpanded = true;
  }

}
