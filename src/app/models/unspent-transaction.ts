export class UnspentTransaction {
  'txid': string;
  'vout': number;
  'address': string;
  'account': string;
  'scriptPubKey': string;
  'amount': number;
  'confirmations': number;
  'spendable': boolean;
  'solvable': boolean;
}
