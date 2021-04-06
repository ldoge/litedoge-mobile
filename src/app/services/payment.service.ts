import {Injectable} from '@angular/core';
import {JaninService} from './janin.service';
import * as bitcoin from 'bitcoinjs-lib';
import {TransactionService} from './transaction.service';
import {environment} from '../../environments/environment';
import {WalletProxyService} from './wallet-proxy.service';
import {BehaviorSubject, Observable, zip} from 'rxjs';
import {first, tap} from 'rxjs/operators';
import {UnspentTransaction} from '../models/unspent-transaction';
import {InsufficientLitedoge} from '../models/insufficient-litedoge';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  public availableBalance$: BehaviorSubject<number> = new BehaviorSubject<number>(0.0);
  public scannedBalance$: BehaviorSubject<number> = new BehaviorSubject<number>(0.0);
  public unspentTransactions$: BehaviorSubject<UnspentTransaction[]> = new BehaviorSubject<UnspentTransaction[]>([]);

  constructor(private janinService: JaninService,
              private transactionService: TransactionService,
              private walletProxyService: WalletProxyService) {
  }

  /**
   * Retrieves all related balances and cause necessary side effects
   */
  public refreshBalances(): Observable<any> {
    const wallet = this.janinService.loadedWallet$.getValue();
    return zip(
      this.transactionService
        .getWalletBalance(wallet)
        .pipe(first(), tap(amount => this.availableBalance$.next(amount || 0.0))),
      this.walletProxyService.getUnspent(wallet)
        .pipe(tap((result: UnspentTransaction[]) => {
          let totalAmount = 0;
          result.forEach(unspent => {
            if (unspent.spendable) {
              totalAmount += unspent.amount;
            }
          });

          this.scannedBalance$.next(totalAmount);
          this.unspentTransactions$.next(result);
        }))
    );
  }

  public getFees(): number {
    return environment.minFee;
  }

  private getLdogeDenominator(): number {
    return environment.ldogeDenominator;
  }

  // This amount given will also be used for covering transaction fees
  public createPayment(receiverAddress: string, amount: number) {
    const wallet = this.janinService.loadedWallet$.getValue();
    const amountAndFees = amount - Number(this.getFees() / this.getLdogeDenominator());
    const unspentTransactions = this.unspentTransactions$.getValue();
    const referencedTransactions: UnspentTransaction[] = [];
    let totalInputAmount = 0;
    for (const unspentTransaction of unspentTransactions) {
      if (unspentTransaction.spendable) {
        totalInputAmount += unspentTransaction.amount;
        referencedTransactions.push(unspentTransaction);
        // Check if there's sufficient being referenced
        if (totalInputAmount >= amountAndFees) {
          break;
        }
      }
    }
    const returnToSenderAmount = totalInputAmount - amountAndFees;

    // Has enough LiteDoges
    if (returnToSenderAmount >= 0) {
      const transactionBuilder = new bitcoin.TransactionBuilder(this.janinService.litedogeCurrency.network);
      // Add sources from previous transactions hash
      referencedTransactions.forEach(referencedTransaction => {
        transactionBuilder.addInput(referencedTransaction.txid, referencedTransaction.vout);
      });
      // Add output address
      transactionBuilder.addOutput(receiverAddress, amount * this.getLdogeDenominator());
      // Send remaining LiteDoges back to sender address
      if (returnToSenderAmount > 0) {
        transactionBuilder.addOutput(wallet.litedogeAddress, returnToSenderAmount * this.getLdogeDenominator());
      }
      transactionBuilder.sign(0, wallet.liteDogeKeyPair);
      const transactionHex = transactionBuilder.build().toHex();
      this.walletProxyService.pushTransactionHex(transactionHex);
    } else {
      throw new InsufficientLitedoge();
    }
  }
}
