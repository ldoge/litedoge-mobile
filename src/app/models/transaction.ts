export class Transaction {
  public timestamp: number;
  public txid: string;
  public sent: bigint;
  public received: bigint;
  public balance: bigint;

  public isSpend(): boolean {
    return this.sent < this.received;
  }

  public getAmount(): bigint {
    return this.sent - this.received;
  }
}
