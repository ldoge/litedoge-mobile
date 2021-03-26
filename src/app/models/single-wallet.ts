import {ECPairInterface} from 'bitcoinjs-lib/types/ecpair';

export class SingleWallet {
  get litedogeAddress(): string {
    return this.pLiteDogeAddress;
  }

  get litedogePubKey(): Buffer {
    return this.keyPair.publicKey;
  }

  get litedogeWifPrivateKey(): string {
    return this.pLiteDogeWif;
  }

  get liteDogeKeyPair(): ECPairInterface {
    return this.keyPair;
  }

  private readonly keyPair: ECPairInterface;
  private readonly pLiteDogeAddress: string;
  private readonly pLiteDogeWif: string;

  constructor(keyPair: ECPairInterface, address: string, wifData: string) {
    this.keyPair = keyPair;
    this.pLiteDogeAddress = address;
    this.pLiteDogeWif = wifData;
  }
}
