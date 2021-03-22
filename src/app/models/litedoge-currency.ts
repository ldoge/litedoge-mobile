import {Network} from 'bitcoinjs-lib';

export class LitedogeCurrency {
  public name = 'LiteDoge';
  public networkVersion = 0x5a;
  public network: Network = {
    messagePrefix: '\x18LiteDoge Signed Message:\n',
    // LiteDoge doesn't seem to have bech32 yet
    bech32: '',
    bip32: {
      // data from EXT_PUBLIC_KEY
      public: 0x0488B21E,
      // data from EXT_SECRET_KEY
      private: 0x0488ADE4,
    },
    // data from PUBKEY_ADDRESS
    pubKeyHash: 0x5a,
    // data from SCRIPT_ADDRESS
    scriptHash: 0x07,
    // TODO: find out WTF is wif. Seems like this should be correct
    wif: 0xab,
  };
  public privateKeyPrefix = 0xab;
  // tslint:disable-next-line:variable-name
  public WIF_Start = '6';
  // tslint:disable-next-line:variable-name
  public CWIF_Start = 'S';
}
