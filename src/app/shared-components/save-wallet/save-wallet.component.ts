import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {SingleWalletGeneratorService} from '../../services/single-wallet-generator.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {JaninService} from '../../services/janin.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-save-wallet',
  templateUrl: './save-wallet.component.html',
  styleUrls: ['./save-wallet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveWalletComponent implements OnInit {
  public walletSaveInfo: FormGroup;

  constructor(private modalCtrl: ModalController,
              private singleWalletGenerator: SingleWalletGeneratorService,
              public janinService: JaninService,
              private fb: FormBuilder,
              private translateService: TranslateService,
              private alertController: AlertController) {
  }

  ngOnInit() {
    this.walletSaveInfo = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      passwordConfirm: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  saveWallet() {
    const walletName = this.walletSaveInfo.get('name').value;
    const walletPassword = this.walletSaveInfo.get('password').value;
    this.janinService.saveWallet(walletName, walletPassword)
      .subscribe(() => {
        this.walletSaveInfo.reset();
        this.janinService.walletSaved$.next(true);
        this.dismiss();
      }, async err => {
        const errorModal = await this.alertController.create({
          header: this.translateService.instant('shared.save_wallet_outcome.in_use'),
          message: this.translateService.instant('shared.save_wallet_outcome.in_use_description'),
          buttons: [this.translateService.instant('shared.save_wallet_outcome.in_use_button')],
        });

        await errorModal.present();
      });
  }

  passwordMatches(): boolean {
    return this.walletSaveInfo.get('password').value === this.walletSaveInfo.get('passwordConfirm').value;
  }

  dismiss() {
    this.modalCtrl
      .dismiss({
        dismissed: true
      });
  }
}
