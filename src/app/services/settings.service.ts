import {Injectable} from '@angular/core';
import {Globalization} from '@ionic-native/globalization/ngx';
import {StorageService} from './storage.service';
import {TranslateService} from '@ngx-translate/core';
import {Settings} from '../interfaces/settings';
import {first, switchMap, tap} from 'rxjs/operators';
import {BehaviorSubject, from, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public settings$: BehaviorSubject<Settings> = new BehaviorSubject<Settings>({
    language: this.translateService.getDefaultLang()
  });
  private systemLanguage$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(private storageService: StorageService,
              private translateService: TranslateService,
              private globalization: Globalization) {
  }

  loadSettings() {
    from(this.globalization.getPreferredLanguage())
      .pipe(
        first(),
        tap(result => this.systemLanguage$.next(result.value)),
        switchMap(() => this.storageService.getJsonObservable<any>('settings').pipe(first()))
      )
      .subscribe(result => {
        if (!Array.isArray(result)) {
          this.settings$.next(result);
        } else {
          const systemLanguage = this.systemLanguage$.getValue();
          if (this.translateService.getLangs().findIndex(value => value === systemLanguage) === -1) {
            // not found
          } else {
            const newSettings: Settings = {
              language: systemLanguage
            };
            this.translateService.setDefaultLang(systemLanguage);
            this.settings$.next(newSettings);
          }
        }
      });
  }

  saveSettings(settings: Settings): Observable<any> {
    return this.storageService.setJsonObservable('settings', settings)
      .pipe(tap(() => this.settings$.next(settings)));
  }
}
