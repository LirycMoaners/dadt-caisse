import { Type, ComponentRef, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
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
    component: Type<TicketComponent | BillComponent>,
    previousComponentRef?: ComponentRef<TicketComponent | BillComponent>
  ): ComponentRef<TicketComponent | BillComponent> {
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
