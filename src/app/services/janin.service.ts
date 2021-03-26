import {Injectable} from '@angular/core';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {SingleWalletGenerator} from './single-wallet-generator';
import {SingleWallet} from '../models/single-wallet';
import {AlertController} from '@ionic/angular';
import {BehaviorSubject} from 'rxjs';
import {TransactionService} from './transaction.service';

@Injectable({
  providedIn: 'root'
})
export class JaninService {
  public litedogeCurrency = new LitedogeCurrency();
  public loadedWallet$: BehaviorSubject<SingleWallet> = new BehaviorSubject<SingleWallet>(null);

  constructor(private singleWalletGenerator: SingleWalletGenerator,
              private transactionService: TransactionService,
              private alertController: AlertController) {
    // TODO: remove this test address
    const testWallet = new SingleWallet(null, 'dXJjuiRhvPLBYSwwvNpM8auxZVR2xDZgJi', '');
    this.loadedWallet$.next(testWallet);
  }

  public generateWallet() {
    this.loadedWallet$.next(this.singleWalletGenerator.generateNewAddressAndKey(this.litedogeCurrency));
    this.transactionService.clearTransactionsOfWallet();
  }

  async encryptAndStoreWallet() {
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
            this.singleWalletGenerator.encryptAndStoreWallet(this.loadedWallet$.getValue(), alertData.walletName, alertData.passphrase);
            this.loadedWallet$.next(null);
            this.transactionService.clearTransactionsOfWallet();
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
              .then(decryptedWallet => {
                this.loadedWallet$.next(decryptedWallet);
                this.transactionService.clearTransactionsOfWallet();
              });
          }
        }
      ]
    });

    await alert.present();
  }
}
