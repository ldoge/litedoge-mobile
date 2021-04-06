import {Component} from '@angular/core';
import {PaymentService} from '../services/payment.service';
import {BehaviorSubject} from 'rxjs';
import {JaninService} from '../services/janin.service';
import {QRScanner, QRScannerStatus} from '@ionic-native/qr-scanner/ngx';
import {InsufficientLitedoge} from '../models/insufficient-litedoge';
import {ToastController} from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  sendToAddress = '';
  sendToAmount = 0;

  constructor(public janinService: JaninService,
              public paymentService: PaymentService,
              private toastController: ToastController,
              private qrScanner: QRScanner) {
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

  openQrScanner() {
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          // camera permission was granted
          // start scanning
          const scanSub = this.qrScanner.scan().subscribe((text: string) => {
            this.sendToAddress = text;

            this.qrScanner.hide(); // hide camera preview
            scanSub.unsubscribe(); // stop scanning
          });

        } else if (status.denied) {
          // camera permission was permanently denied
          // you must use QRScanner.openSettings() method to guide the user to the settings page
          // then they can grant the permission from there
        } else {
          // permission was denied, but not permanently. You can ask for permission again at a later time.
        }
      })
      .catch((e: any) => console.log('Error is', e));
  }

  async makePayment() {
    try {
      this.paymentService.createPayment(this.sendToAddress, this.sendToAmount);
      this.sendToAddress = '';
      this.sendToAmount = 0;
      const toast = await this.toastController.create({
        message: 'Payment Sent!',
        color: 'success',
        duration: 5000
      });
      toast.present();
    } catch (exception: any) {
      if (exception instanceof InsufficientLitedoge) {
        const toast = await this.toastController.create({
          message: 'Insufficient Funds!',
          color: 'danger',
          duration: 5000
        });
        toast.present();
      }
    }
  }
}
