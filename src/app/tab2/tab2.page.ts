import {ChangeDetectionStrategy, Component} from '@angular/core';
import {PaymentService} from '../services/payment.service';
import {BehaviorSubject, from, Observable, Subscription} from 'rxjs';
import {JaninService} from '../services/janin.service';
import {ScanOptions, SupportedFormat, ScanResult, CheckPermissionResult} from '@capacitor-community/barcode-scanner';
import {InsufficientLitedoge} from '../models/insufficient-litedoge';
import {AlertController, ToastController} from '@ionic/angular';
import {filter, first, switchMap} from 'rxjs/operators';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Plugins} from '@capacitor/core';
import {AppService} from '../services/app.service';
import {TranslateService} from '@ngx-translate/core';

const {BarcodeScanner} = Plugins;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tab2Page {
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public paymentSending$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public sendToForm: FormGroup;
  private backButtonSubscription: Subscription;
  private scannerSubscription: Subscription;
  public scanResult$: BehaviorSubject<ScanResult> = new BehaviorSubject<ScanResult>(null);

  constructor(public janinService: JaninService,
              public paymentService: PaymentService,
              private toastController: ToastController,
              private translateService: TranslateService,
              private alertController: AlertController,
              private fb: FormBuilder,
              private appService: AppService) {
    this.sendToForm = this.fb.group({
      address: ['', [Validators.required, Validators.minLength(21)]],
      amount: [0, [Validators.required, Validators.min(1)]]
    });

    // Keep listening for QR results
    this.scanResult$
      .pipe(filter(result => result !== null))
      .subscribe(async result => {
        if (result.hasContent) {
          this.sendToForm.get('address').setValue(result.content);
          await this.stopQrScanner();
        }
      });
  }

  ionViewWillEnter() {
    this.isLoading$.next(true);
    this.janinService
      .isWalletLoaded()
      .pipe(
        first(),
        switchMap(result => {
          if (result) {
            return this.paymentService.refreshBalances();
          }

          return this.janinService.showWalletNotLoadedAlert();
        })
      )
      .subscribe(result => {
        if (Array.isArray(result)) {
          this.isLoading$.next(false);
        }
      });

    // When back button is pressed and scanner is active, stop QR scanner immediately
    this.backButtonSubscription = this.appService
      .backButtonEventEmitter()
      .subscribe(async () => {
        if (this.scannerSubscription && !this.scannerSubscription.closed) {
          await this.stopQrScanner();
        }
      });
  }

  ionViewDidLeave() {
    this.backButtonSubscription.unsubscribe();
  }

  doRefresh(event) {
    this.paymentService
      .refreshBalances()
      .subscribe(() => {
        event.target.complete();
      });
  }

  async openQrScanner() {
    const status: CheckPermissionResult = await BarcodeScanner.checkPermission({force: true});

    if (status.granted) {
      await BarcodeScanner.hideBackground();
      this.appService.hideBackground();
      const scanOptions: ScanOptions = {targetedFormats: [SupportedFormat.QR_CODE]};
      this.scannerSubscription = from(BarcodeScanner.startScan(scanOptions))
        .subscribe(scanResult => {
          this.scanResult$.next(scanResult);
        });
    }
  }

  async stopQrScanner() {
    if (this.scannerSubscription && !this.scannerSubscription.closed) {
      this.scannerSubscription.unsubscribe();
    }
    await BarcodeScanner.showBackground();
    this.appService.showBackground();
    await BarcodeScanner.stopScan();
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
            message: this.translateService.instant('payment_page.send_toast_info.success'),
            color: 'success',
            duration: 5000
          });
          toast.present();
        }, async error => {
          const toast = await this.toastController.create({
            message: this.translateService.instant('payment_page.send_toast_info.failure'),
            color: 'danger',
            duration: 5000
          });
          toast.present();
          this.paymentSending$.next(false);
        });
    } catch (exception: any) {
      if (exception instanceof InsufficientLitedoge) {
        const toast = await this.toastController.create({
          message: this.translateService.instant('payment_page.send_toast_info.no_funds'),
          color: 'danger',
          duration: 5000
        });
        toast.present();
      }
    }
  }

  async showScannedBalanceHelp() {
    const infoAlert = await this.alertController.create({
      header: this.translateService.instant('payment_page.scanned_balance_info.title'),
      message: this.translateService.instant('payment_page.scanned_balance_info.description'),
      buttons: [this.translateService.instant('payment_page.scanned_balance_info.button')],
    });

    infoAlert.present();
  }
}
