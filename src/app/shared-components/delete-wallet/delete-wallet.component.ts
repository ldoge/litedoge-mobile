import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {AlertController, ModalController} from '@ionic/angular';
import {SingleWalletGeneratorService} from '../../services/single-wallet-generator.service';
import {JaninService} from '../../services/janin.service';
import {first, switchMap} from 'rxjs/operators';
import {WalletNotFoundError} from '../../errors/wallet-not-found-error';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-delete-wallet',
  templateUrl: './delete-wallet.component.html',
  styleUrls: ['./delete-wallet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteWalletComponent implements OnInit {
  public walletNameList$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public walletDeleteInfo: FormGroup;
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private modalCtrl: ModalController,
              private singleWalletGenerator: SingleWalletGeneratorService,
              public janinService: JaninService,
              private fb: FormBuilder,
              private translateService: TranslateService,
              private alertController: AlertController) {
    this.walletDeleteInfo = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit() {
    this.getWalletList();
  }

  async showDeleteAlertConfirmation() {
    const alert = await this.alertController.create({
      header: this.translateService.instant('delete_wallet_modal.delete_confirmation.title'),
      message: this.translateService.instant('delete_wallet_modal.delete_confirmation.description'),
      buttons: [
        {
          text: this.translateService.instant('delete_wallet_modal.delete_confirmation.delete_button'),
          cssClass: 'danger',
          handler: () => this.deleteWallet()
        },
        {
          text: this.translateService.instant('delete_wallet_modal.delete_confirmation.cancel_button'),
          role: 'cancel',
          cssClass: 'secondary'
        }
      ],
    });
    await alert.present();
  }

  deleteWallet() {
    const walletName = this.walletDeleteInfo.get('name').value;
    const password = this.walletDeleteInfo.get('password').value;

    this.janinService.loadWallet(walletName, password)
      .pipe(
        first(),
        switchMap(() => this.janinService.deleteWallet(walletName))
      )
      .subscribe(async () => {
        this.walletDeleteInfo.reset();
        this.janinService.unloadWallet();
        this.getWalletList();
        const alert = await this.alertController.create({
          header: this.translateService.instant('delete_wallet_modal.delete_outcome.success'),
          message: this.translateService.instant('delete_wallet_modal.delete_outcome.success_description'),
          buttons: [this.translateService.instant('delete_wallet_modal.delete_outcome.success_button')],
        });
        await alert.present();
      }, async err => {
        if (err instanceof WalletNotFoundError) {
          const alert = await this.alertController.create({
            header: this.translateService.instant('delete_wallet_modal.delete_outcome.not_found'),
            message: this.translateService.instant('delete_wallet_modal.delete_outcome.not_found_description'),
            buttons: [this.translateService.instant('delete_wallet_modal.delete_outcome.not_found_button')],
          });
          await alert.present();
        } else {
          const alert = await this.alertController.create({
            header: this.translateService.instant('delete_wallet_modal.delete_outcome.incorrect_password'),
            message: this.translateService.instant('delete_wallet_modal.delete_outcome.incorrect_password_description'),
            buttons: [this.translateService.instant('delete_wallet_modal.delete_outcome.incorrect_password_button')],
          });
          await alert.present();
        }
      });
  }

  dismiss() {
    this.modalCtrl
      .dismiss({
        dismissed: true
      });
  }

  private getWalletList() {
    this.singleWalletGenerator
      .getWalletList()
      .pipe(first())
      .subscribe(walletList => {
        this.walletNameList$.next(walletList);
        this.isLoading$.next(false);
      });
  }
}
