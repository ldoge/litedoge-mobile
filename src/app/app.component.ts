import {Component, ViewChild} from '@angular/core';
import {AppService} from './services/app.service';
import {IonRouterOutlet} from '@ionic/angular';
import {SettingsService} from './services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  @ViewChild(IonRouterOutlet, {static: true}) routerOutlet: IonRouterOutlet;

  constructor(public appService: AppService,
              private settingsService: SettingsService) {
    this.appService.ionRouterOutlet$.next(this.routerOutlet);
    this.settingsService.loadSettings();
  }
}
