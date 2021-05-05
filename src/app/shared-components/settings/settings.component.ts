import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {SettingsService} from '../../services/settings.service';
import {first} from 'rxjs/operators';
import {Settings} from '../../interfaces/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  public settingsForm: FormGroup;
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public languages = [
    {
      id: 'en',
      value: 'English'
    },
    {
      id: 'es',
      value: 'Española'
    }
  ];

  constructor(private modalController: ModalController,
              private settingsService: SettingsService,
              private fb: FormBuilder,
              private translateService: TranslateService) {
    this.settingsService.settings$.pipe(first())
      .subscribe(settings => {
        this.settingsForm = this.fb.group({
          language: [settings.language, [Validators.required]],
        });
        this.isLoading$.next(false);
      });
  }

  ngOnInit() {
  }

  dismiss() {
    this.modalController.dismiss();
  }

  saveSettings() {
    const newSettings: Settings = {
      language: this.settingsForm.get('language').value,
    };
    this.settingsService.saveSettings(newSettings).pipe(first())
      .subscribe(() => this.dismiss());
  }
}
