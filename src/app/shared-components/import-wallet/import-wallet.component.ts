import {Component, OnInit} from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {SingleWalletGeneratorService} from '../../services/single-wallet-generator.service';
import {TransactionService} from '../../services/transaction.service';
import {from} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {JaninService} from '../../services/janin.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-import-wallet',
  templateUrl: './import-wallet.component.html',
  styleUrls: ['./import-wallet.component.scss'],
})
export class ImportWalletComponent implements OnInit {
  public importWalletInfo: FormGroup;

  constructor(private modalCtrl: ModalController,
              private singleWalletGenerator: SingleWalletGeneratorService,
              private alertController: AlertController,
              private janinService: JaninService,
              private fb: FormBuilder,
              private translateService: TranslateService,
              private transactionService: TransactionService) {
    this.importWalletInfo = this.fb.group({
      privateKey: ['', [Validators.required, Validators.minLength(20)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      passwordConfirm: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
  }

  importWallet() {
    const privateKey = this.importWalletInfo.get('privateKey').value;
    const walletName = this.importWalletInfo.get('name').value;
    const walletPassword = this.importWalletInfo.get('password').value;
    try {
      const importedWallet = this.janinService.importWallet(privateKey);
      this.janinService.loadedWallet$.next(importedWallet);
      this.transactionService.clearTransactionsOfWallet();
      this.janinService.walletSaved$.next(true);

      this.importWalletInfo.reset();
      this.janinService.saveWallet(walletName, walletPassword)
        .subscribe(() => {
          this.dismiss();
        }, async err => {
          const errorModal = await this.alertController.create({
            header: this.translateService.instant('shared.save_wallet_outcome.in_use'),
            message: this.translateService.instant('shared.save_wallet_outcome.in_use_description'),
            buttons: [this.translateService.instant('shared.save_wallet_outcome.in_use_button')],
          });

          await errorModal.present();
        });
    } catch (e) {
      from(this.alertController.create({
        header: this.translateService.instant('import_wallet_modal.import_outcome.invalid'),
        message: this.translateService.instant('import_wallet_modal.import_outcome.invalid_description'),
        buttons: [this.translateService.instant('import_wallet_modal.import_outcome.invalid_button')],
      })).pipe(switchMap(result => from(result.present())))
        .subscribe(() => {
        });
    }
  }

  passwordMatches(): boolean {
    return this.importWalletInfo.get('password').value === this.importWalletInfo.get('passwordConfirm').value;
  }

  dismiss() {
    this.modalCtrl
      .dismiss({
        dismissed: true
      });
  }
}
