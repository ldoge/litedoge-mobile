import {Network} from 'bitcoinjs-lib';
import {LitedogeNetwork} from './litedoge-network';

export class LitedogeCurrency {
  public name = 'LiteDoge';
  public networkVersion = 0x5a;
  public network: Network = new LitedogeNetwork();
  public privateKeyPrefix = 0xab;
  // tslint:disable-next-line:variable-name
  public WIF_Start = '6';
  // tslint:disable-next-line:variable-name
  public CWIF_Start = 'S';
}
