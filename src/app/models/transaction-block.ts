import {Vdata} from './vdata';

export class TransactionBlock {
  active: string;
  tx: {
    vin: Vdata[],
    vout: Vdata[],
    total: bigint,
    timestamp: number,
    blockindex: bigint,
    _id: string,
    txid: string,
    blockhash: string,
    __v: number,
  };
  confirmations: bigint;
  blockcount: bigint;
}
