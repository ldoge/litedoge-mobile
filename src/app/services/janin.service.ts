import {Injectable} from '@angular/core';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {SingleWalletGenerator} from './single-wallet-generator';
import {SingleWallet} from '../models/single-wallet';

@Injectable({
  providedIn: 'root'
})
export class JaninService {
  public litedogeCurrency = new LitedogeCurrency();

  constructor(private singleWalletGenerator: SingleWalletGenerator) {
  }

  public generateCurrency(): SingleWallet {
    return this.singleWalletGenerator.generateNewAddressAndKey(this.litedogeCurrency);
  }

  public WIF_RegEx() {
    return new RegExp('^' + this.litedogeCurrency.WIF_Start + '[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{50}$');
  }

  public CWIF_RegEx() {
    return new RegExp('^' + this.litedogeCurrency.CWIF_Start + '[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{51}$');
  }
}
