import {Injectable} from '@angular/core';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {SingleWalletGeneratorService} from './single-wallet-generator.service';
import {SingleWallet} from '../models/single-wallet';
import {AlertController} from '@ionic/angular';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {TransactionService} from './transaction.service';
import {map, switchMap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class JaninService {
  public litedogeCurrency = new LitedogeCurrency();
  public loadedWallet$: BehaviorSubject<SingleWallet> = new BehaviorSubject<SingleWallet>(null);
  public walletSaved$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private singleWalletGenerator: SingleWalletGeneratorService,
              private translateService: TranslateService,
              private transactionService: TransactionService,
              private alertController: AlertController) {
  }

  public async generateWallet() {
    const generatedWallet = this.singleWalletGenerator.generateNewAddressAndKey(this.litedogeCurrency);
    if (generatedWallet) {
      this.loadedWallet$.next(generatedWallet);
      this.walletSaved$.next(false);
      this.transactionService.clearTransactionsOfWallet();
    } else {
      const alert = await this.alertController.create({
        header: this.translateService.instant('shared.generate_wallet_outcome.error'),
        message: this.translateService.instant('shared.generate_wallet_outcome.error_description'),
        buttons: [this.translateService.instant('shared.generate_wallet_outcome.error_button')],
      });
      await alert.present();
    }
  }

  public saveWallet(walletName: string, password: string): Observable<void> {
    return this.singleWalletGenerator.encryptAndStoreWallet(this.loadedWallet$.getValue(), walletName, password)
      .pipe(
        switchMap(() => {
          return from(this.alertController.create({
            header: this.translateService.instant('shared.save_wallet_outcome.success'),
            message: this.translateService.instant('shared.save_wallet_outcome.success_description'),
            buttons: [this.translateService.instant('shared.save_wallet_outcome.success_button')],
          })).pipe(switchMap(result => from(result.present())));
        })
      );
  }

  public loadWallet(walletName: string, password: string): Observable<SingleWallet> {
    return this.singleWalletGenerator
      .retrieveEncryptedWallet(this.litedogeCurrency, walletName, password);
  }

  public importWallet(privateKey: string): SingleWallet {
    return this.singleWalletGenerator.importWallet(this.litedogeCurrency, privateKey);
  }

  public deleteWallet(walletName: string): Observable<void> {
    return this.singleWalletGenerator.deleteWallet(walletName);
  }

  public isWalletLoaded(): Observable<boolean> {
    return this.loadedWallet$.pipe(map<SingleWallet, boolean>(result => result !== null));
  }

  public showWalletNotLoadedAlert(): Observable<any> {
    return from(this.alertController.create({
      header: this.translateService.instant('shared.warnings.not_loaded'),
      message: this.translateService.instant('shared.warnings.not_loaded_description'),
      buttons: [this.translateService.instant('shared.warnings.not_loaded_button')],
    })).pipe(switchMap(result => from(result.present())));
  }

  public unloadWallet(): void {
    this.walletSaved$.next(false);
    this.loadedWallet$.next(null);
    this.transactionService.clearTransactionsOfWallet();
  }
}
