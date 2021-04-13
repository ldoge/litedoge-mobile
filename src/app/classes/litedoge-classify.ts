import {script} from 'bitcoinjs-lib';
import {multisig} from 'bitcoinjs-lib/src/templates/multisig';
import nullData from 'bitcoinjs-lib/src/templates/nulldata';
import pubKey from 'bitcoinjs-lib/src/templates/pubkey';
import pubKeyHash from 'bitcoinjs-lib/src/templates/pubkeyhash';
import scriptHash from 'bitcoinjs-lib/src/templates/scripthash';
import witnessCommitment from 'bitcoinjs-lib/src/templates/witnesscommitment';
import witnessPubKeyHash from 'bitcoinjs-lib/src/templates/witnesspubkeyhash';
import witnessScriptHash from 'bitcoinjs-lib/src/templates/witnessscripthash';

export class LitedogeClassify {
  public static types = {
    P2MS: 'multisig',
    NONSTANDARD: 'nonstandard',
    NULLDATA: 'nulldata',
    P2PK: 'pubkey',
    P2PKH: 'pubkeyhash',
    P2SH: 'scripthash',
    P2WPKH: 'witnesspubkeyhash',
    P2WSH: 'witnessscripthash',
    WITNESS_COMMITMENT: 'witnesscommitment',
  };

  public static output(outputScript) {
    if (witnessPubKeyHash.output.check(outputScript)) {
      return LitedogeClassify.types.P2WPKH;
    }
    if (witnessScriptHash.output.check(outputScript)) {
      return LitedogeClassify.types.P2WSH;
    }
    if (pubKeyHash.output.check(outputScript)) {
      return LitedogeClassify.types.P2PKH;
    }
    if (scriptHash.output.check(outputScript)) {
      return LitedogeClassify.types.P2SH;
    }
    // XXX: optimization, below functions .decompile before use
    const chunks = script.decompile(outputScript);
    if (!chunks) {
      throw new TypeError('Invalid script');
    }
    if (multisig.output.check(chunks)) {
      return LitedogeClassify.types.P2MS;
    }
    if (pubKey.output.check(chunks)) {
      return LitedogeClassify.types.P2PK;
    }
    if (witnessCommitment.output.check(chunks)) {
      return LitedogeClassify.types.WITNESS_COMMITMENT;
    }
    if (nullData.output.check(chunks)) {
      return LitedogeClassify.types.NULLDATA;
    }
    return LitedogeClassify.types.NONSTANDARD;
  }


  public static input(inputScript) {
    // XXX: optimization, below functions .decompile before use
    const chunks = script.decompile(inputScript);
    if (!chunks) {
      throw new TypeError('Invalid script');
    }
    if (pubKeyHash.input.check(chunks)) {
      return LitedogeClassify.types.P2PKH;
    }
    if (scriptHash.input.check(chunks)) {
      return LitedogeClassify.types.P2SH;
    }
    if (multisig.input.check(chunks)) {
      return LitedogeClassify.types.P2MS;
    }
    if (pubKey.input.check(chunks)) {
      return LitedogeClassify.types.P2PK;
    }
    return LitedogeClassify.types.NONSTANDARD;
  }

  public static witness(witnessScript) {
    // XXX: optimization, below functions .decompile before use
    const chunks = script.decompile(witnessScript);
    if (!chunks) {
      throw new TypeError('Invalid script');
    }
    if (witnessPubKeyHash.input.check(chunks)) {
      return LitedogeClassify.types.P2WPKH;
    }
    if (witnessScriptHash.input.check(chunks)) {
      return LitedogeClassify.types.P2WSH;
    }
    return LitedogeClassify.types.NONSTANDARD;
  }
}
