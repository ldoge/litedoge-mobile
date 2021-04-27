import {ChangeDetectionStrategy, Component} from '@angular/core';
import {JaninService} from '../services/janin.service';
import {BehaviorSubject} from 'rxjs';
import {ModalController} from '@ionic/angular';
import {GenerateWalletComponent} from '../shared-components/generate-wallet/generate-wallet.component';
import {LoadWalletComponent} from '../shared-components/load-wallet/load-wallet.component';
import {ImportWalletComponent} from '../shared-components/import-wallet/import-wallet.component';
import {SaveWalletComponent} from '../shared-components/save-wallet/save-wallet.component';
import {DeleteWalletComponent} from '../shared-components/delete-wallet/delete-wallet.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tab1Page {
  public showPrivateKey$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(public janinService: JaninService,
              private modalController: ModalController) {
  }

  public async generateWallet() {
    const walletGeneratorModal = await this.modalController.create({
      component: GenerateWalletComponent
    });
    await walletGeneratorModal.present();
  }

  public async storeWallet() {
    const importWalletModal = await this.modalController.create({
      component: SaveWalletComponent
    });

    await importWalletModal.present();
  }

  public async loadWallet() {
    const loadWalletModal = await this.modalController.create({
      component: LoadWalletComponent
    });

    await loadWalletModal.present();
  }

  public async importWallet() {
    const importWalletModal = await this.modalController.create({
      component: ImportWalletComponent
    });

    await importWalletModal.present();
  }

  public async deleteWallet() {
    const deleteWalletModal = await this.modalController.create({
      component: DeleteWalletComponent
    });

    await deleteWalletModal.present();
  }

  public togglePrivateKeyVisibility() {
    if (this.showPrivateKey$.getValue()) {
      this.showPrivateKey$.next(false);
    } else {
      this.showPrivateKey$.next(true);
    }
  }

  public unloadWallet() {
    this.janinService.unloadWallet();
  }
}
