import {LitedogeNetwork} from './litedoge-network';

export class LitedogeCurrency {
  public readonly name = 'LiteDoge';
  public networkVersion = 0x5a;
  public readonly network: LitedogeNetwork = new LitedogeNetwork();
  public readonly privateKeyPrefix = 0xab;
  // tslint:disable-next-line:variable-name
  public readonly WIF_Start = '6';
  // tslint:disable-next-line:variable-name
  public readonly CWIF_Start = 'S';
}
