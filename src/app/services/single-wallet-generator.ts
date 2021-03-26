import {Injectable} from '@angular/core';
import {SingleWallet} from '../models/single-wallet';
import * as bitcoin from 'bitcoinjs-lib';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {StorageService} from './storage.service';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

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

  public importWallet(litedogeCurrency: LitedogeCurrency, privateKey: string): SingleWallet {
    const importedKeyPair = bitcoin.ECPair.fromWIF(privateKey, litedogeCurrency.network);
    const {address} = bitcoin.payments.p2pkh({pubkey: importedKeyPair.publicKey, network: litedogeCurrency.network}, {validate: true});

    return new SingleWallet(importedKeyPair, address, privateKey);
  }

  public getWalletList(): Observable<string[]> {
    return from(this.storageService.getJson(this.walletList))
      .pipe(map(data => data as string[]));
  }

  public encryptAndStoreWallet(unencryptedWallet: SingleWallet, walletName: string, walletPassphrase: string) {
    const fullWalletName = this.walletNamePrepend + walletName;
    this.storageService.encryptedSet(fullWalletName, unencryptedWallet.litedogeWifPrivateKey, walletPassphrase);
    this.addWalletNameToList(walletName);
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
    const fullWalletName = this.walletNamePrepend + walletName;
    this.storageService.remove(fullWalletName);
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
