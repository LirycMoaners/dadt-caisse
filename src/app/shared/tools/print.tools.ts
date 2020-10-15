import { Type, ComponentRef, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { CashLogComponent } from 'src/app/modules/cash-register/cash-log/cash-log.component';
import { BillComponent } from '../components/bill/bill.component';
import { TicketComponent } from '../components/ticket/ticket.component';

export class PrintTools {

  /**
   * Crée le composant demandé ou renvoit l'ancienne référence de composant si les types de composant sont les mêmes
   * @param cfr Le component factory resolver à utiliser
   * @param viewContainerRef La référence du view container dans lequel créer le composant
   * @param component Le composant à créer
   * @param previousComponentRef L'ancienne référence de composant
   */
  public static createComponent(
    cfr: ComponentFactoryResolver,
    viewContainerRef: ViewContainerRef,
    component: Type<TicketComponent | BillComponent | CashLogComponent>,
    previousComponentRef: ComponentRef<TicketComponent | BillComponent | CashLogComponent>
  ): ComponentRef<TicketComponent | BillComponent | CashLogComponent> {
    if (!previousComponentRef || previousComponentRef.componentType !== component) {
      if (previousComponentRef) {
        previousComponentRef.destroy();
      }
      const componentFactory = cfr.resolveComponentFactory(component);
      return viewContainerRef.createComponent(componentFactory);
    } else {
      return previousComponentRef;
    }
  }
}
