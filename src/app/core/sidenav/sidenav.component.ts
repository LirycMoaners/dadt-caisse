import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, Routes } from '@angular/router';
import { SaleService } from '../http-services/sale.service';
import { AuthenticationService } from '../http-services/authentication.service';
import { Sale } from 'src/app/shared/models/sale.model';
import { DatePipe } from '@angular/common';
import { MathTools } from 'src/app/shared/tools/math.tools';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') public drawer: MatSidenav;
  public routes: Routes;
  public isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(result => result.matches),
    shareReplay()
  );
  public isDayTotalShown = false;
  public dayTotal: string;
  public isSignedIn = false;
  private readonly subscriptions: Subscription[] = [];

  public closeSidenav: () => void = () => null;

  constructor(
    private readonly router: Router,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly authenticationService: AuthenticationService,
    private readonly saleService: SaleService
  ) {
    const datePipe: DatePipe = new DatePipe('fr-FR');
    this.subscriptions.push(
      this.isHandset$.subscribe(isHandset => this.closeSidenav = isHandset ? () => this.drawer.close() : () => null),
      this.saleService.getAll().subscribe((sales: Sale[]) => {
        if (!!sales) {
          this.isSignedIn = true;
          this.dayTotal = sales.filter(sale => datePipe.transform(sale.createDate, 'dd/MM/yyyy') === datePipe.transform(new Date(), 'dd/MM/yyyy'))
            .reduce((total, sale) => MathTools.sum(total, sale.total), 0) + ' €';
        } else {
          this.isSignedIn = false;
        }
      })
    );
  }

  ngOnInit(): void {
    this.routes = this.router.config.filter(route => route.path !== '' && route.path !== '**' && route.path !== 'login');
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  /**
   * Déconnecte l'utilisateur de l'application
   */
  public signOut(): void {
    this.authenticationService.signOut().then(
      () => this.router.navigate(['/login'])
    );
  }

}
