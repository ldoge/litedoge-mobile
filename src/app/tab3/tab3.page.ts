import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {TransactionService} from '../services/transaction.service';
import {IonInfiniteScroll} from '@ionic/angular';
import {Transaction} from '../models/transaction';
import {first, switchMap} from 'rxjs/operators';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {JaninService} from '../services/janin.service';
import {ExplorerService} from '../services/explorer.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tab3Page {
  private startCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private readonly amount = 30;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  public infiniteScrollReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public infiniteScrollReachedEnd$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(public transactionService: TransactionService,
              public explorerService: ExplorerService,
              private janinService: JaninService) {
  }

  ngOnInit() {
    // Listen to when transactions have been cleared
    this.transactionService
      .transactionsCleared$
      .subscribe(() => {
        this.infiniteScrollReady$.next(false);
        this.infiniteScrollReachedEnd$.next(false);
        this.startCount$.next(0);
      });
  }

  ionViewWillEnter() {
    if (!this.infiniteScrollReady$.getValue()) {
      this.janinService
        .isWalletLoaded()
        .pipe(
          first(),
          switchMap<boolean, Observable<any>>((isWalletLoaded: boolean): Observable<any> => {
            if (isWalletLoaded) {
              // First entry since new wallet loaded
              this.loadData();
              return of(null);
            } else {
              return this.janinService.showWalletNotLoadedAlert();
            }
          })
        )
        .subscribe(result => {
        });
    }
  }

  doRefresh(event) {
    this.transactionService.clearTransactionsOfWallet();
    this.loadData();
    event.target.complete();
  }

  loadData(event = null) {
    this.startCount$.pipe(
      first(),
      switchMap(startCount => this.transactionService
        .getTransactionsOfWallet(this.janinService.loadedWallet$.getValue(), startCount, this.amount))
    )
      .pipe(first())
      .subscribe((response) => {
        if (response) {
          const typedTxs = [];
          response.forEach(tx => {
            const typedTx = Object.assign(new Transaction(), tx);
            typedTxs.push(typedTx);
          });
          if (typedTxs.length === 0) {
            this.infiniteScrollReachedEnd$.next(true);
          } else {
            const allTransactions = [
              ...this.transactionService.transactions$.getValue(),
              ...typedTxs
            ];
            this.transactionService.transactions$.next(allTransactions);

            this.startCount$.next(this.startCount$.getValue() + this.amount);
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
