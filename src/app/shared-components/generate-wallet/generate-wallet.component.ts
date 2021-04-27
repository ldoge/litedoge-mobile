import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {from} from 'rxjs';
import {AlertController, ModalController} from '@ionic/angular';
import {SingleWalletGeneratorService} from '../../services/single-wallet-generator.service';
import {switchMap} from 'rxjs/operators';
import {JaninService} from '../../services/janin.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-generate-wallet',
  templateUrl: './generate-wallet.component.html',
  styleUrls: ['./generate-wallet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateWalletComponent implements OnInit {
  public walletSaveInfo: FormGroup;

  constructor(private modalCtrl: ModalController,
              private singleWalletGenerator: SingleWalletGeneratorService,
              public janinService: JaninService,
              private fb: FormBuilder,
              private alertController: AlertController) {
  }

  ngOnInit() {
    this.walletSaveInfo = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      passwordConfirm: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  saveWallet() {
    const walletName = this.walletSaveInfo.get('name').value;
    const walletPassword = this.walletSaveInfo.get('password').value;
    this.janinService.saveWallet(walletName, walletPassword)
      .subscribe(() => {
        this.walletSaveInfo.reset();
        this.janinService.walletSaved$.next(true);
        this.dismiss();
      },  async err => {
        const errorModal = await this.alertController.create({
          header: 'Wallet name in use!',
          message: 'The wallet name you have chosen is already being used.',
          buttons: ['OK'],
        });

        await errorModal.present();
      });
  }

  generateWallet() {
    this.janinService.generateWallet();
  }

  dismiss() {
    this.modalCtrl
      .dismiss({
        dismissed: true
      });
  }

  passwordMatches(): boolean {
    return this.walletSaveInfo.get('password').value === this.walletSaveInfo.get('passwordConfirm').value;
  }
}