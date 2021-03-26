import {Injectable} from '@angular/core';
import {SingleWallet} from '../models/single-wallet';
import * as bitcoin from 'bitcoinjs-lib';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {StorageService} from './storage.service';
import {from, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SingleWalletGenerator {
  private readonly walletNamePrepend = 'wallet_';
  private readonly walletList = 'list_wallet';

  constructor(private storageService: StorageService) {
  }

  public open() {

  }

  public generateNewAddressAndKey(litedogeCurrency: LitedogeCurrency): SingleWallet {
    const ecPairOptions = {
      network: litedogeCurrency.network
    };
    const keyPair = bitcoin.ECPair.makeRandom(ecPairOptions);
    const {address} = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: litedogeCurrency.network}, {validate: true});
    const wifKeyPair = keyPair.toWIF();

    return new SingleWallet(keyPair, address, wifKeyPair);
  }

  public getWalletList(): Observable<any> {
    return from(this.storageService.getJson(this.walletList));
  }

  public encryptAndStoreWallet(unencryptedWallet: SingleWallet, walletName: string, walletPassphrase: string) {
    const fullWalletName = this.walletNamePrepend + walletName;
    this.storageService.encryptedSet(fullWalletName, unencryptedWallet.litedogeWifPrivateKey, walletPassphrase);
    this.addWalletNameToList(fullWalletName);
  }

  public retrieveEncryptedWallet(litedogeCurrency: LitedogeCurrency, walletName: string, walletPassphrase: string): Promise<SingleWallet> {
    return this.storageService.encryptedGet(this.walletNamePrepend + walletName, walletPassphrase)
      .then(wifKeyPair => {
        const keyPair = bitcoin.ECPair.fromWIF(wifKeyPair, litedogeCurrency.network);
        const {address} = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: litedogeCurrency.network}, {validate: true});

        return new SingleWallet(keyPair, address, wifKeyPair);
      });
  }

  public deleteWallet(walletName: string) {
    this.storageService.remove(walletName);
    this.removeWalletNameFromList(walletName);
  }

  private async addWalletNameToList(walletName: string) {
    const jsonData = await this.storageService.getJson(this.walletList);
    if (jsonData && !jsonData.includes(walletName)) {
      jsonData.push(walletName);
      this.storageService.setJson(this.walletList, jsonData);
    }
  }

  private async removeWalletNameFromList(walletName: string) {
    const jsonData = await this.storageService.getJson(this.walletList);
    if (jsonData && jsonData.includes(walletName)) {
      const walletIndex = jsonData.findIndex(element => element === walletName);
      if (walletIndex >= 0) {
        const newData = jsonData.splice(walletIndex, 1);
        this.storageService.setJson(this.walletList, newData);
      }
    }
  }
}
