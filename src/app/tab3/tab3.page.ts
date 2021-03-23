import {Component} from '@angular/core';
import {TransactionService} from '../services/transaction.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(public transactionService: TransactionService) {
  }

  public loadTransactions() {
    this.transactionService.getTransactionsOfWallet();
  }
}
