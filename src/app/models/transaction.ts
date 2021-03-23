export class Transaction {
  public timestamp: number;
  public txid: string;
  public sent: number;
  public received: number;
  public balance: number;

  public isSpend(): boolean {
    return this.received < this.sent;
  }

  public getAmount(): number {
    return this.received - this.sent;
  }
}
