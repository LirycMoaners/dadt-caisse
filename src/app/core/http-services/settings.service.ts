import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { from, Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Settings } from 'src/app/shared/models/settings.model';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class SettingsService {
  private settingsRef: AngularFireObject<Settings>;

  constructor(
    private readonly database: AngularFireDatabase,
    private readonly authenticationService: AuthenticationService
  ) {
    this.settingsRef = this.database.object('settings');
  }

  /**
   * Appel au service de récupération des paramètres de l'application
   */
  public getSettings(): Observable<Settings> {
    return this.authenticationService.user$.pipe(
      filter(user => !!user),
      mergeMap(() => this.settingsRef.snapshotChanges()),
      filter(c => !!c.payload.val()),
      map(c => c.payload.val() as Settings)
    );
  }

  /**
   * Appel au service de mise à jour des paramètres de l'application
   * @param newSettings Les nouveaux paramètres de l'application
   */
  public updateSettings(newSettings: Settings): Observable<void> {
    return from(this.settingsRef.update(newSettings));
  }
}
