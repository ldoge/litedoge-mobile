import {Component} from '@angular/core';
import {PaymentService} from '../services/payment.service';
import {BehaviorSubject} from 'rxjs';
import {JaninService} from '../services/janin.service';
import {BarcodeScannerWeb, ScanOptions, SupportedFormat} from '@capacitor-community/barcode-scanner';
import {InsufficientLitedoge} from '../models/insufficient-litedoge';
import {ToastController} from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public paymentSending$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  sendToAddress = '';
  sendToAmount = 0;

  constructor(public janinService: JaninService,
              public paymentService: PaymentService,
              private toastController: ToastController,
              private barcodeScanner: BarcodeScannerWeb) {
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

  async openQrScanner() {
    const status = await this.barcodeScanner.checkPermission({force: true});

    switch (status) {
      case status.granted:
        this.barcodeScanner.hideBackground();
        const scanOptions: ScanOptions = {targetedFormats: [SupportedFormat.QR_CODE]};
        const result = await this.barcodeScanner.startScan(scanOptions);
        if (result.hasContent) {
          this.sendToAddress = result.content;
          this.barcodeScanner.showBackground();
          await this.barcodeScanner.stopScan();
        }
        break;
    }
  }

  async makePayment() {
    try {
      this.paymentSending$.next(true);
      this.paymentService.createPayment(this.sendToAddress, this.sendToAmount)
        .subscribe(async result => {
          this.paymentSending$.next(false);
          this.sendToAddress = '';
          this.sendToAmount = 0;
          const toast = await this.toastController.create({
            message: 'Payment Sent!',
            color: 'success',
            duration: 5000
          });
          toast.present();
        }, async error => {
          const toast = await this.toastController.create({
            message: 'Transaction Failed!',
            color: 'danger',
            duration: 5000
          });
          toast.present();
          this.paymentSending$.next(false);
        });
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
