import {Component} from '@angular/core';
import {PaymentService} from '../services/payment.service';
import {BehaviorSubject} from 'rxjs';
import {JaninService} from '../services/janin.service';
import {BarcodeScannerWeb, ScanOptions, SupportedFormat} from '@capacitor-community/barcode-scanner';
import {InsufficientLitedoge} from '../models/insufficient-litedoge';
import {AlertController, ToastController} from '@ionic/angular';
import {switchMap} from 'rxjs/operators';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public paymentSending$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public sendToForm: FormGroup;

  constructor(public janinService: JaninService,
              public paymentService: PaymentService,
              private toastController: ToastController,
              private fb: FormBuilder,
              private alertController: AlertController,
              private barcodeScanner: BarcodeScannerWeb) {
    this.sendToForm = this.fb.group({
      address: ['', [Validators.required, Validators.minLength(21)]],
      amount: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ionViewWillEnter() {
    this.isLoading$.next(true);
    this.janinService
      .isWalletLoaded()
      .pipe(switchMap(result => {
        if (result) {
          return this.paymentService.refreshBalances();
        }

        return this.janinService.showWalletNotLoadedAlert();
      }))
      .subscribe(result => {
        if (Array.isArray(result)) {
          this.isLoading$.next(false);
        }
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
        await this.barcodeScanner.hideBackground();
        const scanOptions: ScanOptions = {targetedFormats: [SupportedFormat.QR_CODE]};
        const result = await this.barcodeScanner.startScan(scanOptions);
        if (result.hasContent) {
          this.sendToForm.get('address').setValue(result.content);
          await this.barcodeScanner.showBackground();
          await this.barcodeScanner.stopScan();
        }
        break;
    }
  }

  async makePayment() {
    try {
      this.paymentSending$.next(true);
      const sendToAddress = this.sendToForm.get('address').value;
      const sendToAmount = this.sendToForm.get('amount').value;
      this.paymentService.createPayment(sendToAddress, sendToAmount)
        .subscribe(async result => {
          this.paymentSending$.next(false);
          this.sendToForm.reset();
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
