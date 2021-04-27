import { WalletNotFoundError } from './wallet-not-found-error';

describe('WalletNotFoundError', () => {
  it('should create an instance', () => {
    expect(new WalletNotFoundError()).toBeTruthy();
  });
});
