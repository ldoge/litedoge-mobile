import {Component, Input, OnInit} from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {SingleWallet} from '../../models/single-wallet';
import {BehaviorSubject, from} from 'rxjs';
import {SingleWalletGeneratorService} from '../../services/single-wallet-generator.service';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-save-wallet',
  templateUrl: './save-wallet.component.html',
  styleUrls: ['./save-wallet.component.scss'],
})
export class SaveWalletComponent implements OnInit {
  @Input() wallet$: BehaviorSubject<SingleWallet>;
  @Input() walletName = '';
  @Input() passphrase = '';

  constructor(private modalCtrl: ModalController,
              private singleWalletGenerator: SingleWalletGeneratorService,
              private alertController: AlertController) {
  }

  ngOnInit() {
  }

  saveWallet() {
    this.singleWalletGenerator.encryptAndStoreWallet(this.wallet$.getValue(), this.walletName, this.passphrase)
      .pipe(
        switchMap(() => {
          return from(this.alertController.create({
            header: 'Wallet saved!',
            message: 'Your private key is now safely encrypted and stored in your phone.',
            buttons: ['OK'],
          })).pipe(switchMap(result => from(result.present())));
        })
      )
      .subscribe(() => {
        this.walletName = '';
        this.passphrase = '';
        this.dismiss();
      });
  }

  dismiss() {
    this.modalCtrl
      .dismiss({
        dismissed: true
      });
  }

  isWalletReady(): boolean {
    const wallet = this.wallet$.getValue();
    return wallet
      && wallet.litedogeAddress
      && wallet.litedogeWifPrivateKey !== ''
      && this.walletName
      && this.walletName !== ''
      && this.passphrase
      && this.passphrase !== '';
  }
}
