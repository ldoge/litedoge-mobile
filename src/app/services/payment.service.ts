import {Injectable} from '@angular/core';
import {JaninService} from './janin.service';
import * as bitcoin from 'bitcoinjs-lib';
import {TransactionService} from './transaction.service';
import {environment} from '../../environments/environment';
import {WalletProxyService} from './wallet-proxy.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {first, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  public availableBalance$: BehaviorSubject<number> = new BehaviorSubject<number>(0.0);
  public scannedBalance$: BehaviorSubject<number> = new BehaviorSubject<number>(0.0);

  constructor(private janinService: JaninService,
              private transactionService: TransactionService,
              private walletProxyService: WalletProxyService) {
  }

  public refreshBalances(): Observable<any> {
    const wallet = this.janinService.loadedWallet$.getValue();
    return this.transactionService
      .getWalletBalance(wallet)
      .pipe(first(), tap(amount => this.availableBalance$.next(amount || 0.0)));
  }

  public getFees(): number {
    return environment.minFee;
  }

  // This amount given will also be used for covering transaction fees
  public createPayment(receiverAddress: string, amount: number) {
    const wallet = this.janinService.loadedWallet$.getValue();
    // TODO: calculate the total input amount through combining the unspent transactions
    const totalInputAmount = 0;
    const returnToSenderAmount = totalInputAmount - amount - this.getFees();

    // Has enough LiteDoges
    if (returnToSenderAmount >= 0) {
      const transactionBuilder = new bitcoin.TransactionBuilder(this.janinService.litedogeCurrency.network);
      // TODO: add sources from previous transactions hash
      // TODO: add output to self address as remaining is taken as fee
      transactionBuilder.addOutput(receiverAddress, amount);
      // Send remaining LiteDoges back to sender address
      if (returnToSenderAmount > 0) {
        transactionBuilder.addOutput(wallet.litedogeAddress, returnToSenderAmount);
      }
      transactionBuilder.sign(0, wallet.liteDogeKeyPair);
      const transactionHex = transactionBuilder.build().toHex();
      this.walletProxyService.pushTransactionHex(transactionHex);
    }
  }
}
