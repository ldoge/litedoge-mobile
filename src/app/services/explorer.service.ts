import {Injectable} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {ViewTransactionComponent} from '../shared-components/view-transaction/view-transaction.component';

@Injectable({
  providedIn: 'root'
})
export class ExplorerService {

  constructor(private modalController: ModalController) {
  }

  async viewTransaction(transactionId: string) {
    const viewTransactionModal = await this.modalController.create({
      component: ViewTransactionComponent,
      componentProps: {
        transactionId
      }
    });

    await viewTransactionModal.present();
  }
}
