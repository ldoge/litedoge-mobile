import {Injectable} from '@angular/core';
import {SingleWallet} from '../models/single-wallet';
import * as bitcoin from 'bitcoinjs-lib';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {StorageService} from './storage.service';
import {Observable} from 'rxjs';
import {first, map, switchMap, tap} from 'rxjs/operators';
import {WalletNameAlreadyExistsError} from '../errors/wallet-name-already-exists-error';
import {WalletNotFoundError} from '../errors/wallet-not-found-error';

@Injectable({
  providedIn: 'root'
})
export class SingleWalletGeneratorService {
  private readonly walletNamePrepend = 'wallet_';
  private readonly walletList = 'list_wallet';

  constructor(private storageService: StorageService) {
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
    return this.storageService.getJsonObservable<string[]>(this.walletList);
  }

  public encryptAndStoreWallet(unencryptedWallet: SingleWallet, walletName: string, walletPassphrase: string): Observable<void> {
    const fullWalletName = this.walletNamePrepend + walletName;
    return this.walletNameExists(walletName)
      .pipe(
        first(),
        switchMap(result => {
          if (result) {
            throw new WalletNameAlreadyExistsError();
          }

          return this.storageService.encryptedSetObservable(fullWalletName, unencryptedWallet.litedogeWifPrivateKey, walletPassphrase)
            .pipe(
              first(),
              tap(() => this.addWalletNameToList(walletName))
            );
        }));
  }

  public retrieveEncryptedWallet(litedogeCurrency: LitedogeCurrency,
                                 walletName: string,
                                 walletPassphrase: string): Observable<SingleWallet> {
    return this.storageService.encryptedGetObservable(this.walletNamePrepend + walletName, walletPassphrase)
      .pipe(map(wifKeyPair => {
        const keyPair = bitcoin.ECPair.fromWIF(wifKeyPair, litedogeCurrency.network);
        const {address} = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: litedogeCurrency.network}, {validate: true});

        return new SingleWallet(keyPair, address, wifKeyPair);
      }));
  }

  public deleteWallet(walletName: string): Observable<void> {
    const fullWalletName = this.walletNamePrepend + walletName;
    return this.storageService.removeObservable(fullWalletName).pipe(
      switchMap(() => this.removeWalletNameFromList(walletName))
    );
  }

  public walletNameExists(walletName: string): Observable<boolean> {
    return this.storageService.getJsonObservable<string[]>(this.walletList)
      .pipe(map<string[], boolean>(jsonData => jsonData && jsonData.includes(walletName)));
  }

  private addWalletNameToList(walletName: string): void {
    this.storageService.getJsonObservable<string[]>(this.walletList)
      .pipe(
        first(),
        switchMap(jsonData => {
          if (jsonData && !jsonData.includes(walletName)) {
            jsonData.push(walletName);
            return this.storageService.setJsonObservable(this.walletList, jsonData);
          }
          throw new WalletNameAlreadyExistsError();
        }))
      .subscribe(() => {
      });
  }

  private removeWalletNameFromList(walletName: string): Observable<void> {
    return this.storageService.getJsonObservable<string[]>(this.walletList)
      .pipe(switchMap(jsonData => {
        if (jsonData && jsonData.includes(walletName)) {
          const newData = [];
          jsonData.forEach(value => {
            if (value !== walletName) {
              newData.push(value);
            }
          });
          return this.storageService.setJsonObservable(this.walletList, newData);
        }

        throw new WalletNotFoundError();
      }));
  }
}
