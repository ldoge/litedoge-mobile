import {Transaction, crypto as bcrypto} from 'bitcoinjs-lib';
import * as varuint from 'varuint-bitcoin';
import {LitedogeBufferwriter} from './litedoge-bufferwriter';

const ZERO = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000',
  'hex',
);

export class LitedogeTransaction extends Transaction {
  time = 0;

  private varSliceSize(someScript) {
    const length = someScript.length;
    return varuint.encodingLength(length) + length;
  }

  hashForWitnessV0(inIndex: number, prevOutScript: Buffer, value: number, hashType: number) {
    let tbuffer = Buffer.from([]);
    let bufferWriter;
    let hashOutputs = ZERO;
    let hashPrevouts = ZERO;
    let hashSequence = ZERO;
    // tslint:disable-next-line:no-bitwise
    if (!(hashType & Transaction.SIGHASH_ANYONECANPAY)) {
      tbuffer = Buffer.allocUnsafe(36 * this.ins.length);
      bufferWriter = new LitedogeBufferwriter(tbuffer, 0);
      this.ins.forEach(txIn => {
        bufferWriter.writeSlice(txIn.hash);
        bufferWriter.writeUInt32(txIn.index);
      });
      hashPrevouts = bcrypto.hash256(tbuffer);
    }
    if (
      // tslint:disable-next-line:no-bitwise
      !(hashType & Transaction.SIGHASH_ANYONECANPAY) &&
      // tslint:disable-next-line:no-bitwise
      (hashType & 0x1f) !== Transaction.SIGHASH_SINGLE &&
      // tslint:disable-next-line:no-bitwise
      (hashType & 0x1f) !== Transaction.SIGHASH_NONE
    ) {
      tbuffer = Buffer.allocUnsafe(4 * this.ins.length);
      bufferWriter = new LitedogeBufferwriter(tbuffer, 0);
      this.ins.forEach(txIn => {
        bufferWriter.writeUInt32(txIn.sequence);
      });
      hashSequence = bcrypto.hash256(tbuffer);
    }
    if (
      // tslint:disable-next-line:no-bitwise
      (hashType & 0x1f) !== Transaction.SIGHASH_SINGLE &&
      // tslint:disable-next-line:no-bitwise
      (hashType & 0x1f) !== Transaction.SIGHASH_NONE
    ) {
      const txOutsSize = this.outs.reduce((sum, output) => {
        return sum + 8 + this.varSliceSize(output.script);
      }, 0);
      tbuffer = Buffer.allocUnsafe(txOutsSize);
      bufferWriter = new LitedogeBufferwriter(tbuffer, 0);
      this.outs.forEach(out => {
        bufferWriter.writeUInt64(out.value);
        bufferWriter.writeVarSlice(out.script);
      });
      hashOutputs = bcrypto.hash256(tbuffer);
    } else if (
      // tslint:disable-next-line:no-bitwise
      (hashType & 0x1f) === Transaction.SIGHASH_SINGLE &&
      inIndex < this.outs.length
    ) {
      const output = this.outs[inIndex];
      tbuffer = Buffer.allocUnsafe(8 + this.varSliceSize(output.script));
      bufferWriter = new LitedogeBufferwriter(tbuffer, 0);
      bufferWriter.writeUInt64(output.value);
      bufferWriter.writeVarSlice(output.script);
      hashOutputs = bcrypto.hash256(tbuffer);
    }
    tbuffer = Buffer.allocUnsafe(156 + this.varSliceSize(prevOutScript));
    bufferWriter = new LitedogeBufferwriter(tbuffer, 0);
    const input = this.ins[inIndex];
    bufferWriter.writeUInt32(this.version);
    bufferWriter.writeUInt32(this.time);
    bufferWriter.writeSlice(hashPrevouts);
    bufferWriter.writeSlice(hashSequence);
    bufferWriter.writeSlice(input.hash);
    bufferWriter.writeUInt32(input.index);
    bufferWriter.writeVarSlice(prevOutScript);
    bufferWriter.writeUInt64(value);
    bufferWriter.writeUInt32(input.sequence);
    bufferWriter.writeSlice(hashOutputs);
    bufferWriter.writeUInt32(this.locktime);
    bufferWriter.writeUInt32(hashType);
    return bcrypto.hash256(tbuffer);
  }

  clone(): LitedogeTransaction {
    const newTx = new LitedogeTransaction();
    newTx.version = this.version;
    newTx.time = this.time;
    newTx.locktime = this.locktime;
    newTx.ins = this.ins.map(txIn => {
      return {
        hash: txIn.hash,
        index: txIn.index,
        script: txIn.script,
        sequence: txIn.sequence,
        witness: txIn.witness,
      };
    });
    newTx.outs = this.outs.map(txOut => {
      return {
        script: txOut.script,
        value: txOut.value,
      };
    });
    return newTx;
  }
}
