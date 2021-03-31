import {EventEmitter, Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Transaction} from '../models/transaction';
import {SingleWallet} from '../models/single-wallet';

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
  }

  public getWalletBalance(wallet: SingleWallet): Observable<number> {
    if (wallet) {
      return this.apiService.get('/ext/getbalance/' + wallet.litedogeAddress, {});
    }
  }
}
