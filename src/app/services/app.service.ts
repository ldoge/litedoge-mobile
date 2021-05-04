import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {IonRouterOutlet, Platform} from '@ionic/angular';
import {Plugins} from '@capacitor/core';

const {App} = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AppService {
  isHideBackground$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  ionRouterOutlet$: BehaviorSubject<IonRouterOutlet> = new BehaviorSubject<IonRouterOutlet>(null);
  private backButton$: EventEmitter<void> = new EventEmitter<void>();

  constructor(private platform: Platform) {
    this.platform
      .backButton
      .subscribeWithPriority(0, async () => {
        this.backButton$.emit();

        if (!this.isHideBackground$.getValue()) {
          // Background not hidden
          if (!this.ionRouterOutlet$.getValue().canGoBack()) {
            App.exitApp();
          }
        }
      });
  }

  public hideBackground() {
    this.isHideBackground$.next(true);
  }

  public showBackground() {
    this.isHideBackground$.next(false);
  }

  public triggerBackButton(): void {
    this.backButton$.emit();
  }

  public backButtonEventEmitter(): EventEmitter<void> {
    return this.backButton$;
  }
}
