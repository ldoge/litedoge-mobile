import {EventEmitter, Inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Platform} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  isHideBackground$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private backButton$: EventEmitter<void> = new EventEmitter<void>();

  constructor(private platform: Platform) {
    this.platform
      .backButton
      .subscribeWithPriority(0, async () => {
        this.backButton$.emit();
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
