import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DOCUMENT} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  isHideBackground$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(@Inject(DOCUMENT) private document: Document) {
  }

  public hideBackground() {
    this.isHideBackground$.next(true);
    this.document.body.classList.add('transparent-body');
  }

  public showBackground() {
    this.isHideBackground$.next(false);
    this.document.body.classList.remove('transparent-body');
  }
}
