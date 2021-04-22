import {EventEmitter, Inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DOCUMENT} from '@angular/common';
import {Platform} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  isHideBackground$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private backButton$: EventEmitter<void> = new EventEmitter<void>();

  constructor(@Inject(DOCUMENT) private document: Document, private platform: Platform) {
    this.platform
      .backButton
      .subscribeWithPriority(0, async () => {
        this.backButton$.emit();
      });
  }

  public hideBackground() {
    this.isHideBackground$.next(true);
    this.document.body.classList.add('transparent-body');
  }

  public showBackground() {
    this.isHideBackground$.next(false);
    this.document.body.classList.remove('transparent-body');
  }

  public triggerBackButton(): void {
    this.backButton$.emit();
  }

  public backButtonEventEmitter(): EventEmitter<void> {
    return this.backButton$;
  }
}
