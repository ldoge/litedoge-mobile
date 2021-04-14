import {Network} from 'bitcoinjs-lib';

export class LitedogeNetwork implements Network {
  public readonly messagePrefix = '\x18LiteDoge Signed Message:\n';
  // LiteDoge doesn't seem to have bech32 yet
  public readonly bech32 = null;
  public readonly bip32 = {
    // data from EXT_PUBLIC_KEY
    public: 0x0488B21E,
    // data from EXT_SECRET_KEY
    private: 0x0488ADE4,
  };
  // data from PUBKEY_ADDRESS
  public readonly pubKeyHash = 0x5a;
  // data from SCRIPT_ADDRESS
  public readonly scriptHash = 0x07;
  // Seems like this should be correct
  public readonly wif = 0xab;
}
