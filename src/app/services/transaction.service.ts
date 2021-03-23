import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {JaninService} from './janin.service';
import {BehaviorSubject} from 'rxjs';
import {Transaction} from '../models/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  public transactions$: BehaviorSubject<Transaction[]> = new BehaviorSubject<Transaction[]>([]);
  public output = {};

  constructor(private apiService: ApiService, private janinService: JaninService) {
  }

  public getTransactionsOfWallet(start = 0, end = 30) {
    const loadedWallet = this.janinService.loadedWallet$.getValue();
    if (loadedWallet) {
      this.apiService.get('/ext/getaddresstxs/' + loadedWallet.litedogeAddress + '/' + start + '/' + end, {})
        .subscribe((responseData) => {
          if (responseData) {
            this.transactions$.next(responseData);
            this.output = responseData;
          }
        });
    }
  }
}
