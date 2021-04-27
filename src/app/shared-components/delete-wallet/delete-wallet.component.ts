import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {AlertController, ModalController} from '@ionic/angular';
import {SingleWalletGeneratorService} from '../../services/single-wallet-generator.service';
import {JaninService} from '../../services/janin.service';
import {first, switchMap} from 'rxjs/operators';
import {WalletNotFoundError} from '../../errors/wallet-not-found-error';

@Component({
  selector: 'app-delete-wallet',
  templateUrl: './delete-wallet.component.html',
  styleUrls: ['./delete-wallet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteWalletComponent implements OnInit {
  public walletNameList$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public walletDeleteInfo: FormGroup;
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private modalCtrl: ModalController,
              private singleWalletGenerator: SingleWalletGeneratorService,
              public janinService: JaninService,
              private fb: FormBuilder,
              private alertController: AlertController) {
    this.walletDeleteInfo = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit() {
    this.getWalletList();
  }

  async showDeleteAlertConfirmation() {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this wallet?',
      buttons: [
        {text: 'DELETE', cssClass: 'danger', handler: () => this.deleteWallet()},
        {text: 'CANCEL', role: 'cancel', cssClass: 'secondary'}
      ],
    });
    await alert.present();
  }

  deleteWallet() {
    const walletName = this.walletDeleteInfo.get('name').value;
    const password = this.walletDeleteInfo.get('password').value;

    this.janinService.loadWallet(walletName, password)
      .pipe(
        first(),
        switchMap(() => this.janinService.deleteWallet(walletName))
      )
      .subscribe(async () => {
        this.walletDeleteInfo.reset();
        this.janinService.unloadWallet();
        this.getWalletList();
        const alert = await this.alertController.create({
          header: 'Wallet Deleted!',
          message: 'The wallet you have selected has been deleted successfully!',
          buttons: ['OK'],
        });
        await alert.present();
      }, async err => {
        if (err instanceof WalletNotFoundError) {
          const alert = await this.alertController.create({
            header: 'Wallet Does Not Exists!',
            message: 'Something went wrong, the wallet you were trying to delete does not seem to exist. Please restart your application!',
            buttons: ['OK'],
          });
          await alert.present();
        } else {
          const alert = await this.alertController.create({
            header: 'Incorrect Password!',
            message: 'The password that you have keyed in is incorrect. Please try again!',
            buttons: ['OK'],
          });
          await alert.present();
        }
      });
  }

  dismiss() {
    this.modalCtrl
      .dismiss({
        dismissed: true
      });
  }

  private getWalletList() {
    this.singleWalletGenerator
      .getWalletList()
      .pipe(first())
      .subscribe(walletList => {
        this.walletNameList$.next(walletList);
        this.isLoading$.next(false);
      });
  }
}
