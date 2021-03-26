import {Injectable} from '@angular/core';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {SingleWalletGenerator} from './single-wallet-generator';
import {SingleWallet} from '../models/single-wallet';
import {AlertController, ModalController} from '@ionic/angular';
import {BehaviorSubject} from 'rxjs';
import {TransactionService} from './transaction.service';
import {SaveWalletComponent} from './save-wallet/save-wallet.component';

@Injectable({
  providedIn: 'root'
})
export class JaninService {
  public litedogeCurrency = new LitedogeCurrency();
  public loadedWallet$: BehaviorSubject<SingleWallet> = new BehaviorSubject<SingleWallet>(null);

  constructor(private singleWalletGenerator: SingleWalletGenerator,
              private transactionService: TransactionService,
              private modalController: ModalController,
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
    const saveWalletModal = await this.modalController.create({
      component: SaveWalletComponent,
      componentProps: {
        wallet$: this.loadedWallet$,
      }
    });

    await saveWalletModal.present();
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
