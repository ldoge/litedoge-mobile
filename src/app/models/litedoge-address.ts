import {LitedogeNetwork} from './litedoge-network';
import * as bs58check from 'bs58check';
import {payments} from 'bitcoinjs-lib';

export class LitedogeAddress {
  public static fromBase58Check(address) {
    const payload = bs58check.decode(address);
    if (payload.length < 21) {
      throw new TypeError(address + ' is too short');
    }
    if (payload.length > 21) {
      throw new TypeError(address + ' is too long');
    }
    const version = payload.readUInt8(0);
    const hash = payload.slice(1);
    return {version, hash};
  }

  public static toOutputScript(address, network: LitedogeNetwork) {
    let decodeBase58;
    try {
      decodeBase58 = LitedogeAddress.fromBase58Check(address);
    } catch (e) {
    }
    if (decodeBase58) {
      if (decodeBase58.version === network.pubKeyHash) {
        return payments.p2pkh({hash: decodeBase58.hash}).output;
      }
      if (decodeBase58.version === network.scriptHash) {
        return payments.p2sh({hash: decodeBase58.hash}).output;
      }
    }
    throw new Error(address + ' has no matching Script');
  }
}
