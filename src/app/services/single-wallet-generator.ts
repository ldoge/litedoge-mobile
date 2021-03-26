import {Injectable} from '@angular/core';
import {SingleWallet} from '../models/single-wallet';
import * as bitcoin from 'bitcoinjs-lib';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {StorageService} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SingleWalletGenerator {
  private readonly walletNamePrepend = 'wallet_';

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

  public encryptAndStoreWallet(unencryptedWallet: SingleWallet, walletName: string, walletPassphrase: string) {
    this.storageService.encryptedSet(this.walletNamePrepend + walletName, unencryptedWallet.litedogeWifPrivateKey, walletPassphrase);
  }

  public retrieveEncryptedWallet(litedogeCurrency: LitedogeCurrency, walletName: string, walletPassphrase: string): Promise<SingleWallet> {
    return this.storageService.encryptedGet(this.walletNamePrepend + walletName, walletPassphrase)
      .then(wifKeyPair => {
        const keyPair = bitcoin.ECPair.fromWIF(wifKeyPair, litedogeCurrency.network);
        const {address} = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: litedogeCurrency.network}, {validate: true});

        return new SingleWallet(keyPair, address, wifKeyPair);
      });
  }
}
