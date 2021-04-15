import {EventEmitter, Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Transaction} from '../models/transaction';
import {SingleWallet} from '../models/single-wallet';
import {map, switchMap} from 'rxjs/operators';
import {TransactionBlock} from '../models/transaction-block';
import {ApiError} from '../models/api-error';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  public transactions$: BehaviorSubject<Transaction[]> = new BehaviorSubject<Transaction[]>([]);
  public transactionsCleared$: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private apiService: ApiService) {
  }

  public clearTransactionsOfWallet() {
    this.transactions$.next([]);
    this.transactionsCleared$.emit(true);
  }

  public getTransactionsOfWallet(wallet: SingleWallet, start = 0, amount = 30): Observable<any> {
    if (wallet) {
      return this.apiService.get('/ext/getaddresstxs/' + wallet.litedogeAddress + '/' + start + '/' + amount, {});
    }

    return null;
  }


  public getWalletBalance(wallet: SingleWallet): Observable<number> {
    if (wallet) {
      return this.apiService.get('/ext/getbalance/' + wallet.litedogeAddress, {})
        .pipe(
          map<any, number>(data => {
            if (typeof data === 'number') {
              return data;
            }

            // Error telling me that address does not exists
            return 0.0;
          })
        );
    }
  }

  public getTransactionBlock(txId: string): Observable<TransactionBlock> {
    return this.apiService.get<TransactionBlock>('/ext/gettx/' + txId, {})
      .pipe(
        map<any, TransactionBlock>(data => {
          if (data.error) {
            throw new ApiError(data.error);
          }

          return data;
        })
      );
  }
}
