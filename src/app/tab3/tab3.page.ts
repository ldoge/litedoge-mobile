import {Component, ViewChild} from '@angular/core';
import {TransactionService} from '../services/transaction.service';
import {IonInfiniteScroll} from '@ionic/angular';
import {Transaction} from '../models/transaction';
import {first} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {JaninService} from '../services/janin.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  private startCount = 0;
  private readonly amount = 30;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  public infiniteScrollReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public infiniteScrollReachedEnd$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(public transactionService: TransactionService,
              private janinService: JaninService) {
  }

  ngOnInit() {
    // Listen to when transactions have been cleared
    this.transactionService
      .transactionsCleared$
      .subscribe(() => {
        this.infiniteScrollReady$.next(false);
        this.infiniteScrollReachedEnd$.next(false);
      });
  }

  ionViewWillEnter() {
    if (!this.infiniteScrollReady$.getValue()) {
      // First entry since new wallet loaded
      this.loadData();
    }
  }

  loadData(event = null) {
    this.transactionService.getTransactionsOfWallet(this.janinService.loadedWallet$.getValue(), this.startCount, this.amount)
      .pipe(first())
      .subscribe((response) => {
        if (response) {
          const typedTxs = [];
          response.forEach(tx => {
            const typedTx = Object.assign(new Transaction(), tx);
            typedTxs.push(typedTx);
          });
          console.log(typedTxs);
          if (typedTxs.length === 0) {
            this.infiniteScrollReachedEnd$.next(true);
          } else {
            const allTransactions = [
              ...this.transactionService.transactions$.getValue(),
              ...typedTxs
            ];
            this.transactionService.transactions$.next(allTransactions);

            this.startCount = this.startCount + this.amount;
          }

          if (event) {
            event.target.complete();
          } else {
            // first load call
            this.infiniteScrollReady$.next(true);
          }
        }
      }, (error) => {
        // alert error
      });
  }
}
