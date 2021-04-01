import {Component} from '@angular/core';
import {PaymentService} from '../services/payment.service';
import {BehaviorSubject} from 'rxjs';
import {JaninService} from '../services/janin.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(public janinService: JaninService,
              public paymentService: PaymentService) {
  }

  ionViewWillEnter() {
    this.isLoading$.next(true);
    this.paymentService
      .refreshBalances()
      .subscribe(() => {
        this.isLoading$.next(false);
      });
  }

  doRefresh(event) {
    this.paymentService
      .refreshBalances()
      .subscribe(() => {
        event.target.complete();
      });
  }
}
