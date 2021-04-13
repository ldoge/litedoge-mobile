import * as varuint from 'varuint-bitcoin';

export class LitedogeBufferwriter {
  buffer: Buffer;
  offset: number;

  constructor(buffer: Buffer, offset: number = 0) {
    this.buffer = buffer;
    this.offset = offset;
  }

  writeUInt8(i: number) {
    this.offset = this.buffer.writeUInt8(i, this.offset);
  }

  writeInt32(i: number) {
    this.offset = this.buffer.writeInt32LE(i, this.offset);
  }

  writeUInt32(i: number) {
    this.offset = this.buffer.writeUInt32LE(i, this.offset);
  }

  writeUInt64(i: number) {
    this.offset = this.writeUInt64LE(this.buffer, i, this.offset);
  }

  writeVarInt(i: number) {
    varuint.encode(i, this.buffer, this.offset);
    this.offset += varuint.encode.bytes;
  }

  writeSlice(slice: Buffer) {
    if (this.buffer.length < this.offset + slice.length) {
      throw new Error('Cannot write slice out of bounds');
    }
    this.offset += slice.copy(this.buffer, this.offset);
  }

  writeVarSlice(slice: Buffer) {
    this.writeVarInt(slice.length);
    this.writeSlice(slice);
  }

  writeVector(vector: Buffer[]) {
    this.writeVarInt(vector.length);
    vector.forEach(buf => this.writeVarSlice(buf));
  }

  private writeUInt64LE(buffer: Buffer, value: number, offset: number) {
    this.verifuint(value, 0x001fffffffffffff);
    // tslint:disable-next-line:no-bitwise
    buffer.writeInt32LE(value & -1, offset);
    buffer.writeUInt32LE(Math.floor(value / 0x100000000), offset + 4);
    return offset + 8;
  }

  private verifuint(value: number, max: number) {
    if (typeof value !== 'number') {
      throw new Error('cannot write a non-number as a number');
    }
    if (value < 0) {
      throw new Error('specified a negative value for writing an unsigned value');
    }
    if (value > max) {
      throw new Error('RangeError: value out of range');
    }
    if (Math.floor(value) !== value) {
      throw new Error('value has a fractional component');
    }
  }
}
