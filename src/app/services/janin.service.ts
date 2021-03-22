import {EventEmitter, Injectable, Output} from '@angular/core';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {SingleWalletGenerator} from './single-wallet-generator';
import {SingleWallet} from '../models/single-wallet';
import {AlertController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class JaninService {
  public litedogeCurrency = new LitedogeCurrency();
  @Output('decryptedWallet')
  public decryptedWallet: EventEmitter<SingleWallet> = new EventEmitter<SingleWallet>();

  constructor(private singleWalletGenerator: SingleWalletGenerator,
              private alertController: AlertController) {
  }

  public generateCurrency(): SingleWallet {
    return this.singleWalletGenerator.generateNewAddressAndKey(this.litedogeCurrency);
  }

  async encryptAndStoreWallet(unencryptedWallet: SingleWallet) {
    const alert = await this.alertController.create({
      header: 'Wallet Name & Passphrase',
      inputs: [
        {
          name: 'walletName',
          type: 'text',
          value: 'my wallet',
          label: 'Wallet Name',
        },
        {
          name: 'passphrase',
          type: 'password',
          value: '',
          label: 'Passphrase',
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Ok',
          handler: (alertData) => {
            console.log(alertData.walletName);
            this.singleWalletGenerator.encryptAndStoreWallet(unencryptedWallet, alertData.walletName, alertData.passphrase);
          }
        }
      ]
    });

    await alert.present();
  }

  async decryptAndRetrieveWallet() {
    const alert = await this.alertController.create({
      header: 'Wallet Name & Passphrase',
      inputs: [
        {
          name: 'walletName',
          type: 'text',
          value: 'my wallet',
          label: 'Wallet Name',
        },
        {
          name: 'passphrase',
          type: 'password',
          value: '',
          label: 'Passphrase',
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Ok',
          handler: (alertData) => {
            this.singleWalletGenerator.retrieveEncryptedWallet(this.litedogeCurrency, alertData.walletName, alertData.passphrase)
              .then(decryptedWallet => this.decryptedWallet.emit(decryptedWallet));
          }
        }
      ]
    });

    await alert.present();
  }

  public WIF_RegEx() {
    return new RegExp('^' + this.litedogeCurrency.WIF_Start + '[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{50}$');
  }

  public CWIF_RegEx() {
    return new RegExp('^' + this.litedogeCurrency.CWIF_Start + '[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{51}$');
  }
}
