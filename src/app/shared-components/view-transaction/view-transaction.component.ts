import {Component, Input, OnInit} from '@angular/core';
import {TransactionService} from '../../services/transaction.service';
import {BehaviorSubject} from 'rxjs';
import {TransactionBlock} from '../../models/transaction-block';
import {first} from 'rxjs/operators';
import {ModalController} from '@ionic/angular';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss'],
})
export class ViewTransactionComponent implements OnInit {
  @Input()
  transactionId: string;
  transactionBlock$: BehaviorSubject<TransactionBlock> = new BehaviorSubject<TransactionBlock>(null);

  constructor(private transactionService: TransactionService,
              private modalCtrl: ModalController) {
  }

  ngOnInit() {
    this.transactionService
      .getTransactionBlock(this.transactionId)
      .pipe(first())
      .subscribe(transactionBlock => {
        this.transactionBlock$.next(transactionBlock);
      }, err => {
        // TODO: show 404 or something
      });
  }

  getLdogeDenominator() {
    return environment.ldogeDenominator;
  }

  dismiss() {
    this.modalCtrl
      .dismiss({
        dismissed: true
      });
  }
}
