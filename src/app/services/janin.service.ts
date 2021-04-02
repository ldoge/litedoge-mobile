import {Injectable} from '@angular/core';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {SingleWalletGeneratorService} from './single-wallet-generator.service';
import {SingleWallet} from '../models/single-wallet';
import {ModalController} from '@ionic/angular';
import {BehaviorSubject} from 'rxjs';
import {TransactionService} from './transaction.service';
import {SaveWalletComponent} from '../shared-components/save-wallet/save-wallet.component';
import {LoadWalletComponent} from '../shared-components/load-wallet/load-wallet.component';
import {first} from 'rxjs/operators';
import {ImportWalletComponent} from '../shared-components/import-wallet/import-wallet.component';

@Injectable({
  providedIn: 'root'
})
export class JaninService {
  public litedogeCurrency = new LitedogeCurrency();
  public loadedWallet$: BehaviorSubject<SingleWallet> = new BehaviorSubject<SingleWallet>(null);

  constructor(private singleWalletGenerator: SingleWalletGeneratorService,
              private transactionService: TransactionService,
              private modalController: ModalController) {
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
}
