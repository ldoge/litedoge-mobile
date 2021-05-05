import {Injectable} from '@angular/core';
import {Globalization} from '@ionic-native/globalization/ngx';
import {StorageService} from './storage.service';
import {TranslateService} from '@ngx-translate/core';
import {Settings} from '../interfaces/settings';
import {first, tap} from 'rxjs/operators';
import {BehaviorSubject, from, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public settings$: BehaviorSubject<Settings> = new BehaviorSubject<Settings>({
    language: this.translateService.getDefaultLang()
  });
  public languages = [
    {
      id: 'en',
      value: 'English'
    },
    {
      id: 'es',
      value: 'Español'
    },
    {
      id: 'id',
      value: 'Bahasa Indonesia'
    },
    {
      id: 'cn',
      value: '中文'
    },
    {
      id: 'fr',
      value: 'Français'
    }
  ];
  private systemLanguage$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(private storageService: StorageService,
              private translateService: TranslateService,
              private globalization: Globalization) {
  }

  loadSettings() {
    from(this.globalization.getPreferredLanguage())
      .pipe(first())
      .subscribe(result => {
        this.systemLanguage$.next(result.value);
      }, err => {
        this.systemLanguage$.next(this.translateService.getDefaultLang());
      });

    this.storageService.getJsonObservable<any>('settings')
      .pipe(
        first(),
      )
      .subscribe(result => {
        if (!Array.isArray(result)) {
          this.settings$.next(result);
          this.translateService.setDefaultLang(result.language);
          this.translateService.use(result.language);
        } else {
          const systemLanguage = this.systemLanguage$.getValue();
          if (systemLanguage && this.translateService.getLangs().findIndex(value => value === systemLanguage) === -1) {
            // not found
          } else {
            const newSettings: Settings = {
              language: systemLanguage
            };
            this.translateService.setDefaultLang(systemLanguage);
            this.translateService.use(systemLanguage);
            this.settings$.next(newSettings);
          }
        }
      });
  }

  saveSettings(settings: Settings): Observable<any> {
    return this.storageService.setJsonObservable('settings', settings)
      .pipe(tap(() => {
        this.translateService.setDefaultLang(settings.language);
        this.translateService.use(settings.language);
        this.settings$.next(settings);
      }));
  }
}
