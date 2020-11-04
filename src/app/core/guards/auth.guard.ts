import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, mergeMap } from 'rxjs/operators';

import { AuthenticationService } from '../http-services/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService
  ) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authenticationService.user$.pipe(
      first(),
      mergeMap(user => {
        const lastUrlFragment = route.url.pop();
        if (!user && lastUrlFragment && lastUrlFragment.path !== 'login') {
          this.router.navigate(['/login']);
          return of(false);
        } else if (!!user && lastUrlFragment && lastUrlFragment.path === 'login') {
          this.router.navigate(['/cash-register']);
          return of(false);
        }
        return of(true);
      })
    );
  }
}
