import {Component} from '@angular/core';
import {SingleWallet} from '../models/single-wallet';
import {SingleWalletGenerator} from '../services/single-wallet-generator';
import {JaninService} from '../services/janin.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public showPrivateKey$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(public janinService: JaninService) {
  }

  public generateWallet() {
    this.janinService.generateWallet();
  }

  public storeWallet() {
    this.janinService.encryptAndStoreWallet();
  }

  public loadWallet() {
    this.janinService.decryptAndRetrieveWallet();
  }

  public togglePrivateKeyVisibility() {
    if (this.showPrivateKey$.getValue()) {
      this.showPrivateKey$.next(false);
    } else {
      this.showPrivateKey$.next(true);
    }
  }
}
