import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Settings } from 'src/app/shared/models/settings.model';

@Injectable()
export class SettingsService {
  private settingsRef: firebase.database.Reference;
  private settings$: BehaviorSubject<Settings> = new BehaviorSubject(new Settings());

  constructor(
    private readonly database: AngularFireDatabase
  ) {
    this.settingsRef = this.database.database.ref('settings');
    this.settingsRef.on('value', settingsSnapshot => this.settings$.next(settingsSnapshot.val()));
  }

  /**
   * Appel au service de récupération des paramètres de l'application
   */
  public getSettings(): Observable<Settings> {
    return this.settings$;
  }

  /**
   * Appel au service de mise à jour des paramètres de l'application
   * @param newSettings Les nouveaux paramètres de l'application
   */
  public updateSettings(newSettings: Settings): Observable<Settings> {
    return from(this.settingsRef.update(newSettings));
  }
}
