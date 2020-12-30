import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CustomerService } from './core/http-services/customer.service';
import { GoogleService } from './core/http-services/google.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private isSyncStarted = false;

  constructor(
    private readonly swUpdate: SwUpdate,
    private readonly googleService: GoogleService,
    private readonly customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.initServiceWorker();
    this.initGoogleContacts();
  }

  /**
   * Initialise la vérification de nouvelle version de l'appli via le service worker
   */
  private initServiceWorker(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm('Une nouvelle version est disponible ! Souhaitez-vous recharger votre page pour la visualiser ?')) {
          window.location.reload();
        }
      });
    }
  }

  /**
   * Initialise la connexion au compte google et la synchronisation des contacts
   */
  private initGoogleContacts(): void {
    this.googleService.load().pipe(
      mergeMap(user => {
        if (!!user) {
          if (!this.isSyncStarted) {
            this.isSyncStarted = true;
            return this.customerService.syncContactsWithGoogle();
          }
        } else {
          this.isSyncStarted = false;
        }
        return of(null);
      })
    ).subscribe();
  }
}
