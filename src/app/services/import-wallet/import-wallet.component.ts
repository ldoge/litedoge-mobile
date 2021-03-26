import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {SingleWalletGenerator} from '../single-wallet-generator';
import {TransactionService} from '../transaction.service';
import {LitedogeCurrency} from '../../models/litedoge-currency';
import {BehaviorSubject} from 'rxjs';
import {SingleWallet} from '../../models/single-wallet';

@Component({
  selector: 'app-import-wallet',
  templateUrl: './import-wallet.component.html',
  styleUrls: ['./import-wallet.component.scss'],
})
export class ImportWalletComponent implements OnInit {
  @Input()
  wallet$: BehaviorSubject<SingleWallet>;
  @Input()
  currency: LitedogeCurrency;
  @Input()
  privateKey = '';

  constructor(private modalCtrl: ModalController,
              private singleWalletGenerator: SingleWalletGenerator,
              private transactionService: TransactionService) {
  }

  ngOnInit() {
  }

  importWallet() {
    this.wallet$.next(this.singleWalletGenerator.importWallet(this.currency, this.privateKey));
    this.privateKey = '';
    this.transactionService.clearTransactionsOfWallet();
    this.dismiss();
  }

  isWalletReady(): boolean {
    return this.privateKey && this.privateKey !== '';
  }

  dismiss() {
    this.modalCtrl
      .dismiss({
        dismissed: true
      });
  }
}