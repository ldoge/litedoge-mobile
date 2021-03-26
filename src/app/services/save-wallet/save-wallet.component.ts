import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {SingleWallet} from '../../models/single-wallet';
import {BehaviorSubject} from 'rxjs';
import {TransactionService} from '../transaction.service';
import {SingleWalletGenerator} from '../single-wallet-generator';

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
              private singleWalletGenerator: SingleWalletGenerator,
              private transactionService: TransactionService) {
  }

  ngOnInit() {
  }

  saveWallet() {
    this.singleWalletGenerator.encryptAndStoreWallet(this.wallet$.getValue(), this.walletName, this.passphrase);
    this.walletName = '';
    this.passphrase = '';
    this.wallet$.next(null);
    this.transactionService.clearTransactionsOfWallet();
    this.dismiss();
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
