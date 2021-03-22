import {Component} from '@angular/core';
import {SingleWallet} from '../models/single-wallet';
import {SingleWalletGenerator} from '../services/single-wallet-generator';
import {JaninService} from '../services/janin.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public wallet: SingleWallet = null;

  constructor(private janinService: JaninService) {
  }

  ngOnInit() {
    this.janinService.decryptedWallet.subscribe(decryptedWallet => {
      this.wallet = decryptedWallet;
    });
  }

  public generateWallet() {
    this.wallet = this.janinService.generateCurrency();
  }

  public storeWallet() {
    this.janinService.encryptAndStoreWallet(this.wallet);
  }

  public loadWallet() {
    this.janinService.decryptAndRetrieveWallet();
  }
}
