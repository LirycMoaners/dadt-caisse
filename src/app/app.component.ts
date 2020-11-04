import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private readonly swUpdate: SwUpdate
  ) { }

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm('Une nouvelle version est disponible ! Souhaitez-vous recharger votre page pour la visualiser ?')) {
          window.location.reload();
        }
      });
    }
  }
}
