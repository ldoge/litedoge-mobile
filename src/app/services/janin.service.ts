import {Injectable} from '@angular/core';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {SingleWalletGeneratorService} from './single-wallet-generator.service';
import {SingleWallet} from '../models/single-wallet';
import {AlertController, ModalController} from '@ionic/angular';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {TransactionService} from './transaction.service';
import {SaveWalletComponent} from '../shared-components/save-wallet/save-wallet.component';
import {LoadWalletComponent} from '../shared-components/load-wallet/load-wallet.component';
import {first, map, switchMap} from 'rxjs/operators';
import {ImportWalletComponent} from '../shared-components/import-wallet/import-wallet.component';

@Injectable({
  providedIn: 'root'
})
export class JaninService {
  public litedogeCurrency = new LitedogeCurrency();
  public loadedWallet$: BehaviorSubject<SingleWallet> = new BehaviorSubject<SingleWallet>(null);

  constructor(private singleWalletGenerator: SingleWalletGeneratorService,
              private transactionService: TransactionService,
              private alertController: AlertController,
              private modalController: ModalController) {
  }

  public async generateWallet() {
    const generatedWallet = this.singleWalletGenerator.generateNewAddressAndKey(this.litedogeCurrency);
    if (generatedWallet) {
      this.loadedWallet$.next(generatedWallet);
      this.transactionService.clearTransactionsOfWallet();
    } else {
      const alert = await this.alertController.create({
        header: 'Error generating wallet!',
        message: 'Please restart your application before continuing',
        buttons: ['OK'],
      });
      await alert.present();
    }
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

  public decryptAndRetrieveWallet() {
    this.singleWalletGenerator
      .getWalletList()
      .pipe(first())
      .subscribe(async walletList => {
        const loadWalletModal = await this.modalController.create({
          component: LoadWalletComponent,
          componentProps: {
            wallet$: this.loadedWallet$,
            currency: this.litedogeCurrency,
            walletNameList: walletList,
          }
        });

        await loadWalletModal.present();
      });
  }

  async importWallet() {
    const importWalletModal = await this.modalController.create({
      component: ImportWalletComponent,
      componentProps: {
        wallet$: this.loadedWallet$,
        currency: this.litedogeCurrency,
      }
    });

    await importWalletModal.present();
  }

  public isWalletLoaded(): Observable<boolean> {
    return this.loadedWallet$.pipe(map<SingleWallet, boolean>(result => result !== null));
  }

  public showWalletNotLoadedAlert(): Observable<any> {
    return from(this.alertController.create({
      header: 'Wallet not loaded!',
      message: 'Please load your wallet from the main page before continuing',
      buttons: ['OK'],
    })).pipe(switchMap(result => from(result.present())));
  }

  public unloadWallet() {
    this.loadedWallet$.next(null);
    this.transactionService.clearTransactionsOfWallet();
  }
}
