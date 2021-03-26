import {Component, Input, OnInit} from '@angular/core';
import {SingleWalletGenerator} from '../single-wallet-generator';
import {BehaviorSubject} from 'rxjs';
import {SingleWallet} from '../../models/single-wallet';
import {LitedogeCurrency} from '../../models/litedoge-currency';
import {TransactionService} from '../transaction.service';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-load-wallet',
  templateUrl: './load-wallet.component.html',
  styleUrls: ['./load-wallet.component.scss'],
})
export class LoadWalletComponent implements OnInit {
  @Input() wallet$: BehaviorSubject<SingleWallet>;
  @Input() currency: LitedogeCurrency;
  @Input() selectedWalletName: string;
  @Input() walletNameList: string[];
  @Input() passphrase = '';

  constructor(private modalCtrl: ModalController,
              private singleWalletGenerator: SingleWalletGenerator,
              private transactionService: TransactionService) {
  }

  ngOnInit() {
  }

  loadWallet() {
    this.singleWalletGenerator
      .retrieveEncryptedWallet(this.currency, this.selectedWalletName, this.passphrase)
      .then(decryptedWallet => {
        this.selectedWalletName = null;
        this.passphrase = '';
        this.wallet$.next(decryptedWallet);
        this.transactionService.clearTransactionsOfWallet();
        this.dismiss();
      });
  }

  isWalletReady(): boolean {
    return this.selectedWalletName && this.selectedWalletName !== '' && this.passphrase !== '';
  }

  dismiss() {
    this.modalCtrl
      .dismiss({
        dismissed: true
      });
  }
}
