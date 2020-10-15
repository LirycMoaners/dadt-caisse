import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, Routes } from '@angular/router';
import { SaleService } from '../http-services/sale.service';
import { AuthenticationService } from '../http-services/authentication.service';

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
    this.subscriptions.push(
      this.isHandset$.subscribe(isHandset => this.closeSidenav = isHandset ? () => this.drawer.close() : () => null),
      this.authenticationService.user$.subscribe(user => this.isSignedIn = !!user),
      this.saleService.dayTotal$.subscribe(dayTotal => this.dayTotal = dayTotal + ' €')
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

  public signOut(): void {
    this.authenticationService.signOut().then(
      () => this.router.navigate(['/login'])
    );
  }

}
