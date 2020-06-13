import { Component, ViewChild, OnInit } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, Routes } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @ViewChild('drawer') public drawer: MatSidenav;
  public routes: Routes;
  public isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(result => result.matches),
    shareReplay()
  );
  public closeSidenav: () => void = () => null;

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly router: Router
  ) {
    this.isHandset$.subscribe(isHandset => this.closeSidenav = isHandset ? () => this.drawer.close() : () => null);
  }

  ngOnInit(): void {
    this.routes = this.router.config.filter(route => route.path !== '');
  }

}
