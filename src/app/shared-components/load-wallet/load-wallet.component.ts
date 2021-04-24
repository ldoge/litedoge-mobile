import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {SingleWalletGeneratorService} from '../../services/single-wallet-generator.service';
import {BehaviorSubject} from 'rxjs';
import {TransactionService} from '../../services/transaction.service';
import {AlertController, ModalController} from '@ionic/angular';
import {first} from 'rxjs/operators';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {JaninService} from '../../services/janin.service';

@Component({
  selector: 'app-load-wallet',
  templateUrl: './load-wallet.component.html',
  styleUrls: ['./load-wallet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadWalletComponent implements OnInit {
  public walletNameList: string[];
  public loadWalletForm: FormGroup;
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private modalCtrl: ModalController,
              private janinService: JaninService,
              private singleWalletGenerator: SingleWalletGeneratorService,
              private alertController: AlertController,
              private fb: FormBuilder,
              private transactionService: TransactionService) {
  }

  ngOnInit() {
    this.loadWalletForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.singleWalletGenerator
      .getWalletList()
      .pipe(first())
      .subscribe(walletList => {
        this.walletNameList = walletList;
        this.isLoading$.next(false);
      });
  }

  loadWallet() {
    const walletName = this.loadWalletForm.get('name').value;
    const password = this.loadWalletForm.get('password').value;
    this.janinService.loadWallet(walletName, password)
      .pipe(first())
      .subscribe(decryptedWallet => {
        this.loadWalletForm.reset();
        this.janinService.loadedWallet$.next(decryptedWallet);
        this.janinService.walletSaved$.next(true);
        this.transactionService.clearTransactionsOfWallet();
        this.dismiss();
      }, async err => {
        const alert = await this.alertController.create({
          header: 'Incorrect Password!',
          message: 'The password that you have keyed in is incorrect. Please try again!',
          buttons: ['OK'],
        });
        await alert.present();
      });
  }

  dismiss() {
    this.modalCtrl
      .dismiss({
        dismissed: true
      });
  }
}
