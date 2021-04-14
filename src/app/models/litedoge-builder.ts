import {payments, TransactionBuilder, crypto, Signer, script} from 'bitcoinjs-lib';
import {LitedogeTransaction} from './litedoge-transaction';
import {LitedogeBufferutils} from './litedoge-bufferutils';
import {LitedogeAddress} from './litedoge-address';
import {LitedogeClassify} from '../classes/litedoge-classify';
import {Sighash} from './sighash.enum';
import {LitedogeNetwork} from './litedoge-network';

const SCRIPT_TYPES = LitedogeClassify.types;
const PREVOUT_TYPES = new Set([
  // Raw
  'p2pkh',
  'p2pk',
  'p2wpkh',
  'p2ms',
  // P2SH wrapped
  'p2sh-p2pkh',
  'p2sh-p2pk',
  'p2sh-p2wpkh',
  'p2sh-p2ms',
  // P2WSH wrapped
  'p2wsh-p2pkh',
  'p2wsh-p2pk',
  'p2wsh-p2ms',
  // P2SH-P2WSH wrapper
  'p2sh-p2wsh-p2pkh',
  'p2sh-p2wsh-p2pk',
  'p2sh-p2wsh-p2ms',
]);

export class LitedogeBuilder extends TransactionBuilder {
  public network: LitedogeNetwork;
  private litedogeTransaction: LitedogeTransaction;
  private previousTransactionSet = {};
  private inputs: any[] = [];

  constructor(network: LitedogeNetwork) {
    super(network);
    this.litedogeTransaction = new LitedogeTransaction();
  }

  setLockTime(locktime: number): void {
    this.litedogeTransaction.locktime = locktime;
  }

  setVersion(version: number): void {
    this.litedogeTransaction.version = version;
  }

  addInput(txHash: string, vout: number, sequence?: number, prevOutScript?: Buffer): number {
    let value;
    const txBuffer = LitedogeBufferutils.reverseBuffer(Buffer.from(txHash, 'hex'));

    return this.addInputUnsafe(txBuffer, vout, sequence, prevOutScript, value);
  }

  addOutput(publicHash: string, value: number): number {
    const scriptPubKey: Buffer = LitedogeAddress.toOutputScript(publicHash, this.network);
    return this.litedogeTransaction.addOutput(scriptPubKey, value);
  }

  public sign(
    signParams: number,
    keyPair: Signer,
    redeemScript?: Buffer,
    hashType?: Sighash,
  ) {
    this.trySign(
      this.getSigningData(
        this.network,
        this.inputs,
        this.needsOutputs.bind(this),
        this.litedogeTransaction,
        signParams,
        keyPair,
        redeemScript,
        hashType,
        false,
      ),
    );
  }

  private addInputUnsafe(txHash: Buffer,
                         vout: number,
                         sequence?: number,
                         prevOutScript?: Buffer,
                         value?: any,
                         scriptSig?: any,
                         inputScript?: any) {
    const prevTxOut = txHash.toString('hex') + ':' + vout;
    if (this.previousTransactionSet[prevTxOut] !== undefined) {
      throw new Error('Duplicate TxOut: ' + prevTxOut);
    }
    let input: any = {};
    // derive what we can from the scriptSig
    if (inputScript !== undefined) {
      input = this.expandInput(inputScript);
    }
    // if an input value was given, retain it
    if (value !== undefined) {
      input.value = value;
    }
    // derive what we can from the previous transactions output script
    if (!input.prevOutScript && prevOutScript) {
      let prevOutType;
      if (!input.pubkeys && !input.signatures) {
        const expanded = this.expandOutput(prevOutScript);
        if (expanded.pubkeys) {
          input.pubkeys = expanded.pubkeys;
          input.signatures = expanded.signatures;
        }
        prevOutType = expanded.type;
      }
      input.prevOutScript = prevOutScript;
      input.prevOutType = prevOutType || LitedogeClassify.output(prevOutScript);
    }
    const vin = this.litedogeTransaction.addInput(
      txHash,
      vout,
      sequence,
      scriptSig,
    );
    this.inputs[vin] = input;
    this.previousTransactionSet[prevTxOut] = true;
    return vin;
  }

  private expandInput(scriptSig, type?: any, scriptPubKey?: any) {
    if (scriptSig.length === 0) {
      return {};
    }
    if (!type) {
      let ssType = LitedogeClassify.input(scriptSig);
      if (ssType === SCRIPT_TYPES.NONSTANDARD) {
        ssType = undefined;
      }
      type = ssType;
    }
    switch (type) {
      case SCRIPT_TYPES.P2PKH: {
        const {output, pubkey, signature} = payments.p2pkh({
          input: scriptSig,
          network: this.network,
        });
        return {
          prevOutScript: output,
          prevOutType: SCRIPT_TYPES.P2PKH,
          pubkeys: [pubkey],
          signatures: [signature],
        };
      }
      case SCRIPT_TYPES.P2PK: {
        const {signature} = payments.p2pk({
          input: scriptSig,
          network: this.network,
        });
        return {
          prevOutType: SCRIPT_TYPES.P2PK,
          pubkeys: [undefined],
          signatures: [signature],
        };
      }
    }
    return {
      prevOutType: SCRIPT_TYPES.NONSTANDARD,
      prevOutScript: scriptSig,
    };
  }

  private expandOutput(outputScript: any, ourPubKey?: any) {
    const type = LitedogeClassify.output(outputScript);
    switch (type) {
      case SCRIPT_TYPES.P2PKH: {
        if (!ourPubKey) {
          return {type};
        }
        // does our hash160(pubKey) match the output scripts?
        const pkh1 = payments.p2pkh({
          output: outputScript,
          network: this.network,
        }).hash;
        const pkh2 = crypto.hash160(ourPubKey);
        if (!pkh1.equals(pkh2)) {
          return {type};
        }
        return {
          type,
          pubkeys: [ourPubKey],
          signatures: [undefined],
        };
      }
      case SCRIPT_TYPES.P2PK: {
        const p2pk = payments.p2pk({
          output: outputScript,
          network: this.network,
        });
        return {
          type,
          pubkeys: [p2pk.pubkey],
          signatures: [undefined],
        };
      }
    }
    return {type};
  }

  private trySign({
                    input,
                    ourPubKey,
                    keyPair,
                    signatureHash,
                    hashType,
                    useLowR,
                  }) {
    // enforce in order signing of public keys
    let signed = false;
    for (const [i, pubKey] of input.pubkeys.entries()) {
      if (!ourPubKey.equals(pubKey)) {
        continue;
      }
      if (input.signatures[i]) {
        throw new Error('Signature already exists');
      }
      const signature = keyPair.sign(signatureHash, useLowR);
      input.signatures[i] = script.signature.encode(signature, hashType);
      signed = true;
    }
    if (!signed) {
      throw new Error('Key pair cannot sign for this input');
    }
  }

  private getSigningData(
    network: LitedogeNetwork,
    inputs,
    needsOutputs,
    tx: LitedogeTransaction,
    signParams,
    keyPair,
    redeemScript,
    hashType: Sighash = Sighash.SIGHASH_ALL,
    useLowR,
  ) {
    const vin = signParams;
    if (keyPair === undefined) {
      throw new Error('sign requires keypair');
    }
    // TODO: remove keyPair.network matching in 4.0.0
    if (keyPair.network && keyPair.network !== network) {
      throw new TypeError('Inconsistent network');
    }
    if (!inputs[vin]) {
      throw new Error('No input at index: ' + vin);
    }
    if (needsOutputs(hashType)) {
      throw new Error('Transaction needs outputs');
    }
    const input = inputs[vin];
    // if redeemScript was previously provided, enforce consistency
    if (
      input.redeemScript !== undefined &&
      redeemScript &&
      !input.redeemScript.equals(redeemScript)
    ) {
      throw new Error('Inconsistent redeemScript');
    }
    const ourPubKey =
      keyPair.publicKey || (keyPair.getPublicKey && keyPair.getPublicKey());
    if (!this.canSign(input)) {
      if (!this.canSign(input)) {
        const prepared = this.prepareInput(
          input,
          ourPubKey,
          redeemScript,
        );
        // updates inline
        Object.assign(input, prepared);
      }
      if (!this.canSign(input)) {
        throw Error(input.prevOutType + ' not supported');
      }
    }
    // ready to sign
    const signatureHash = tx.hashForSignature(vin, input.signScript, hashType);
    return {
      input,
      ourPubKey,
      keyPair,
      signatureHash,
      hashType,
      useLowR: !!useLowR,
    };
  }

  setTime(time: number) {
    this.litedogeTransaction.time = time;
  }

  setTimeToCurrentTime() {
    this.setTime(Math.floor(Date.now() / 1000));
  }

  build(): LitedogeTransaction {
    if (!this.litedogeTransaction.inputs.length) {
      throw new Error('Transaction has no inputs');
    }
    if (!this.litedogeTransaction.outputs.length) {
      throw new Error('Transaction has no outputs');
    }

    const tx = this.litedogeTransaction.litedogeClone();
    // create script signatures from inputs
    this.inputs.forEach((input, i) => {
      if (!input.prevOutType) {
        throw new Error('Transaction is not complete');
      }
      const result = this.paymentBuild(input.prevOutType, input);
      if (!result) {
        if (input.prevOutType === SCRIPT_TYPES.NONSTANDARD) {
          throw new Error('Unknown input type');
        }
        throw new Error('Not enough information');
      }
      tx.setInputScript(i, result.input);
    });
    return tx;
  }

  paymentBuild(type, input) {
    const pubkeys = input.pubkeys || [];
    const signatures = input.signatures || [];
    switch (type) {
      case SCRIPT_TYPES.P2PKH: {
        if (pubkeys.length === 0) {
          break;
        }
        if (signatures.length === 0) {
          break;
        }
        return payments.p2pkh({pubkey: pubkeys[0], signature: signatures[0], network: this.network});
      }
      case SCRIPT_TYPES.P2WPKH: {
        if (pubkeys.length === 0) {
          break;
        }
        if (signatures.length === 0) {
          break;
        }
        return payments.p2wpkh({pubkey: pubkeys[0], signature: signatures[0], network: this.network});
      }
      case SCRIPT_TYPES.P2PK: {
        if (pubkeys.length === 0) {
          break;
        }
        if (signatures.length === 0) {
          break;
        }
        return payments.p2pk({signature: signatures[0], network: this.network});
      }
      case SCRIPT_TYPES.P2SH: {
        const redeem = this.paymentBuild(input.redeemScriptType, input);
        if (!redeem) {
          return;
        }
        return payments.p2sh({
          redeem: {
            output: redeem.output || input.redeemScript,
            input: redeem.input,
          },
          network: this.network,
        });
      }
    }
  }

  private canSign(input) {
    return (
      input.signScript !== undefined &&
      input.signType !== undefined &&
      input.pubkeys !== undefined &&
      input.signatures !== undefined &&
      input.signatures.length === input.pubkeys.length &&
      input.pubkeys.length > 0
    );
  }

  private prepareInput(input, ourPubKey, redeemScript?) {
    const prevOutScript = payments.p2pkh({pubkey: ourPubKey, network: this.network}).output;
    return {
      prevOutType: SCRIPT_TYPES.P2PKH,
      prevOutScript,
      signScript: prevOutScript,
      signType: SCRIPT_TYPES.P2PKH,
      pubkeys: [ourPubKey],
      signatures: [undefined],
    };
  }

  private needsOutputs(signingHashType: Sighash): boolean {
    if (signingHashType === Sighash.SIGHASH_ALL) {
      return this.litedogeTransaction.outputs.length === 0;
    }
    // if inputs are being signed with SIGHASH_NONE, we don't strictly need outputs
    // .build() will fail, but .buildIncomplete() is OK
    return (
      this.litedogeTransaction.outputs.length === 0 &&
      this.inputs.some(input => {
        if (!input.signatures) {
          return false;
        }
        return input.signatures.some(signature => {
          if (!signature) {
            return false;
          } // no signature, no issue
          const hashType = this.signatureHashType(signature);
          // tslint:disable-next-line:no-bitwise
          if (hashType & Sighash.SIGHASH_NONE) {
            return false;
          } // SIGHASH_NONE doesn't care about outputs
          return true; // SIGHASH_* does care
        });
      })
    );
  }

  private signatureHashType(buffer: Buffer): number {
    return buffer.readUInt8(buffer.length - 1);
  }
}
