import {Injectable} from '@angular/core';
import {JaninService} from './janin.service';
import * as bitcoin from 'bitcoinjs-lib';
import {PaymentOpts} from 'bitcoinjs-lib/types/payments';
import {Payment} from 'bitcoinjs-lib';
import {Network} from 'bitcoinjs-lib/types/networks';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private janinService: JaninService) {
  }

  public createPayment(receiverAddress: string, amount: number) {
    const wallet = this.janinService.loadedWallet$.getValue();
    const transactionBuilder = new bitcoin.TransactionBuilder(this.janinService.litedogeCurrency.network);

    transactionBuilder.addOutput(receiverAddress, amount);
    transactionBuilder.sign(0, wallet.liteDogeKeyPair);
    console.log(transactionBuilder.build().toHex());
  }
}
